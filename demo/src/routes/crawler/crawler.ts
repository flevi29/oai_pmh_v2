import { readonly, writable } from "svelte/store";
import { parseIdentifyResponse } from "../../../../src/model/parser/identify";
import {
  parseToRecordOrString,
  XMLParser,
} from "../../../../src/parser/xml_parser";
import { InnerValidationError } from "../../../../src/error/validation_error";
import { Semaphore } from "./semaphore";
import {
  getURLs,
  getValidURLs,
  setURLs,
  setValidURLs,
} from "$lib/stores/oai-pmh-list";

const CORS_PROXIED_URL_LIST_URL =
    "https://corsproxy.io/?https://www.openarchives.org/pmh/registry/ListFriends",
  COUNT = 10,
  TIMEOUT = 60_000,
  WEIGHT = 5;

export class Crawler {
  #started = false;

  readonly #parser = new XMLParser(DOMParser);
  // @TODO: This can actually return an array with one empty string, beware: > "".split("|") => [ '' ]
  #urls = getURLs();
  #validURLs = getValidURLs();
  readonly #writableValidURLs = writable(this.#validURLs);
  readonly validURLs = readonly(this.#writableValidURLs);

  #validationIntervalID: ReturnType<typeof setInterval> | null = null;
  #storeUpdateIntervalID: ReturnType<typeof setInterval> | null = null;

  #indexes: number[] = [];
  #lastStartIndex?: number;

  readonly #semaphore = new Semaphore(WEIGHT);
  readonly concurrentValidations = writable<number | null>(null);

  #pushValidURLs(urls: string[]): void {
    (this.#validURLs ??= []).push(...urls);
    this.#writableValidURLs.set(this.#validURLs);
  }

  async #fetchURLs(): Promise<string[]> {
    const response = await fetch(CORS_PROXIED_URL_LIST_URL);

    if (!response.ok) {
      const responseBody = await response.text(),
        { status, statusText } = response;

      throw new Error(`${status} ${statusText}: ${responseBody}`, {
        cause: response,
      });
    }

    const xml = await response.text(),
      xmlDocument = this.#parser.parse(xml),
      parseResult = parseToRecordOrString(xmlDocument.childNodes);

    if (parseResult instanceof Error) {
      throw new Error(
        `error parsing base XML contents: ${parseResult.message}`,
      );
    }

    if (typeof parseResult !== "object") {
      throw new Error(
        "expected base XML to have child nodes other than text",
      );
    }

    const { BaseURLs } = parseResult;
    if (Object.keys(parseResult).length !== 1 || BaseURLs === undefined) {
      throw new Error("expected base XML to have one <BaseURLs> child node");
    }

    const { value } = BaseURLs[0]!;
    if (value === undefined) {
      throw new Error("expected <BaseURLs> node not to be empty");
    }

    const nextParseResult = parseToRecordOrString(value);

    if (nextParseResult instanceof Error) {
      throw new Error(
        `error parsing <BaseURLs> contents: ${nextParseResult.message}`,
      );
    }

    if (typeof nextParseResult !== "object") {
      throw new Error(
        "expected <BaseURLs> to have child nodes othen than text",
      );
    }

    const { baseURL } = nextParseResult;
    if (baseURL === undefined) {
      throw new Error("expected <BaseURLs> to have <baseURL> child nodes");
    }

    return baseURL.map(({ value }) => {
      if (value === undefined) {
        throw new Error("expected <BaseURLs><baseURL> not to be empty");
      }

      const parsedBaseURL = parseToRecordOrString(value);

      if (typeof parsedBaseURL !== "string") {
        throw new Error("expected <BaseURLs><baseURL> to be a text node");
      }

      return parsedBaseURL;
    });
  }

  async #validateURLs(): Promise<void> {
    const releaseLock = await this.#semaphore.acquireLock();

    try {
      const lastIndexEnd = this.#lastStartIndex === undefined
          ? undefined
          : this.#lastStartIndex + COUNT - 1,
        startIndex = lastIndexEnd === undefined ? 0 : lastIndexEnd + 1;

      if (this.#urls === null) {
        this.#urls = await this.#fetchURLs();
      }

      const slicedURLs = this.#urls.slice(startIndex, startIndex + COUNT);
      this.#lastStartIndex = startIndex;

      const settledPromises = await Promise.allSettled(
        slicedURLs.map(async (url) => {
          const response = await fetch(`${url}?verb=Identify`, {
            signal: AbortSignal.timeout(TIMEOUT),
          }).catch(() => null);

          if (response === null || !response.ok) {
            return;
          }

          const xml = await response.text(),
            { childNodes } = this.#parser.parse(xml);

          try {
            // @TODO: Maybe do something with this as well
            parseIdentifyResponse(childNodes);
          } catch (error: unknown) {
            if (error instanceof InnerValidationError) {
              // @TODO: Maybe log this for now, because we might catch bugs like this too
              console.warn(error);
              console.log(xml);
              return;
            }

            throw error;
          }

          return url;
        }),
      );

      let validURLs: string[] | null = null, errors: unknown[] | null = null;
      for (const settledPromise of settledPromises) {
        if (settledPromise.status === "fulfilled") {
          const { value } = settledPromise;
          if (value !== undefined) {
            (validURLs ??= []).push(value);
          }
        } else {
          (errors ??= []).push(settledPromise.reason);
        }
      }

      if (errors !== null) {
        throw new Error("something went wrong", { cause: errors });
      }

      if (validURLs !== null) {
        this.#pushValidURLs(validURLs);
      }

      this.#indexes.push(startIndex);
    } finally {
      releaseLock();
    }
  }

  #updateStores(): void {
    if (this.#urls !== null) {
      // Optimized so that the minimal amount of splice operations are made.
      let delCount = 1;
      this.#indexes.sort((a, b) => b - a);
      for (let i = 0; i < this.#indexes.length; i += 1) {
        const value = this.#indexes[i]!, nextValue = this.#indexes[i + 1];

        if (nextValue !== undefined && value - nextValue === COUNT) {
          delCount += 1;
          continue;
        }

        this.#urls.splice(value, COUNT * delCount);
        delCount = 1;
      }

      this.#indexes = [];

      setURLs(this.#urls);
    }

    if (this.#validURLs !== null) {
      setValidURLs(this.#validURLs);
    }
  }

  // @TODO: This ain't stopping even if it finished boy, so gotta decide when it finishes
  // @TODO: Use a Semaphor instead of this bullshit, we shouldn't have more than X concurrent network requests!
  start(): void {
    this.#storeUpdateIntervalID = setInterval(() => {
      this.#updateStores();
    }, 10_000);

    this.#validationIntervalID = setInterval(() => {
      if (this.#urls !== null && this.#urls.length === 0) {
        clearInterval(this.#storeUpdateIntervalID!);
        clearInterval(this.#validationIntervalID!);
      } else {
        this.#validateURLs().catch(console.warn);
      }
    }, 300);
  }

  async stop(): Promise<void> {
    if (this.#validationIntervalID !== null) {
      clearInterval(this.#validationIntervalID);
    }

    if (this.#storeUpdateIntervalID !== null) {
      clearInterval(this.#storeUpdateIntervalID);
    }

    // this will only run on the latest browsers
    // https://caniuse.com/mdn-javascript_builtins_promise_withresolvers
    const { promise, resolve } = Promise.withResolvers<void>();
    const unsubsribe = this.#semaphore.isBusy.subscribe((v) => {
      if (!v) {
        resolve();
      }
    });

    await promise;
    unsubsribe();

    this.#updateStores();
  }
}
