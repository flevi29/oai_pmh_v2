import { derived, readonly, writable } from "svelte/store";
import { parseIdentifyResponse } from "$rootSrc/model/parser/identify";
import { XMLParser } from "$rootSrc/parser/xml_parser";
import { InnerValidationError } from "$rootSrc/error/validation_error";
import { Semaphore } from "./semaphore";
import { parseBaseURLs } from "./base-urls";
import { URLStore } from "$lib/stores/url-store";
import {
  CRAWLER_ABORT_SYMBOL,
  CrawlerAbortController,
} from "./crawler-abort-controller";
import { Indexes } from "./indexes";

const CORS_PROXIED_URL_LIST_URL = `https://corsproxy.io/?${
    encodeURIComponent("https://www.openarchives.org/pmh/registry/ListFriends")
  }`,
  TIMEOUT = 60_000,
  WEIGHT = 10;

export class Crawler {
  #abortController = new CrawlerAbortController();

  #isProcessing = false;
  readonly #writableIsProcessing = writable(this.#isProcessing);
  readonly isProcessing = readonly(this.#writableIsProcessing);
  #setIsProcessing(value: boolean): void {
    this.#isProcessing = value;
    this.#writableIsProcessing.set(value);
  }

  #isTerminating = false;
  readonly #writableIsTerminating = writable(this.#isTerminating);
  #setIsTerminating(value: boolean): void {
    this.#isTerminating = value;
    this.#writableIsTerminating.set(value);
  }

  #isToBeTerminated = false;

  // @TODO: Could also check if there are urls here
  isStartable = derived(this.#writableIsProcessing, ($isProcessing) => {
    return !$isProcessing;
  });

  isTerimnatable = derived([
    this.#writableIsProcessing,
    this.#writableIsTerminating,
  ], ([$isProcessing, $isTerminating]) => {
    return $isProcessing && !$isTerminating;
  });

  readonly #parser = new XMLParser(DOMParser);
  #urlStore: URLStore | null = null;
  #urls?: string[];
  #validURLs?: string[];
  readonly #writableValidURLs = writable<string[] | undefined>(this.#validURLs);
  readonly validURLs = readonly(this.#writableValidURLs);

  readonly #indexes = new Indexes();
  #index?: number;

  readonly #semaphore = new Semaphore(WEIGHT);

  readonly #urlStoreInitPromise = (async () => {
    const urlStore = new URLStore();

    await urlStore.connectToDatabase();

    this.#urls = await urlStore.getURLs();
    this.#validURLs = await urlStore.getValidURLs();
    this.#writableValidURLs.set(this.#validURLs);
    this.#urlStore = urlStore;
  })().catch(console.warn);

  disconnectURLStore() {
    this.#urlStore?.closeDatabase();
  }

  #addValidURL(url: string): void {
    (this.#validURLs ??= []).push(url);
    this.#writableValidURLs.set(this.#validURLs);
  }

  async #fetchURLs(): Promise<string[]> {
    if (this.#urls !== undefined) {
      return this.#urls;
    }

    const response = await fetch(CORS_PROXIED_URL_LIST_URL);

    if (!response.ok) {
      const responseBody = await response.text(),
        { status, statusText } = response;

      throw new Error(`${status} ${statusText}: ${responseBody}`, {
        cause: response,
      });
    }

    const xml = await response.text(),
      { childNodes } = this.#parser.parse(xml);

    return (this.#urls = parseBaseURLs(childNodes));
  }

  async #validateURLs(): Promise<void> {
    const urls = await this.#fetchURLs();

    try {
      for (;;) {
        if (!this.#isProcessing || this.#isToBeTerminated) {
          break;
        }

        this.#index = this.#index === undefined
          ? urls.length - 1
          : this.#index - 1;

        const url = urls[this.#index], index = this.#index;
        if (url === undefined) {
          break;
        }

        const releaseLock = await this.#semaphore.acquireLock();

        (async () => {
          const response = await fetch(`${url}?verb=Identify`, {
            signal:
              // @TODO: coming in typescript 5.5
              (<(
                signals: Iterable<AbortSignal>,
              ) => AbortSignal> ((<any> AbortSignal).any))([
                AbortSignal.timeout(TIMEOUT),
                this.#abortController.signal,
              ]),
          }).catch((error) =>
            error === CRAWLER_ABORT_SYMBOL ? CRAWLER_ABORT_SYMBOL : null
          );

          // In case we aborted due to termination
          if (response === CRAWLER_ABORT_SYMBOL) {
            return;
          }

          responseParse: {
            if (response === null || !response.ok) {
              break responseParse;
            }

            const xml = await response.text(),
              { childNodes } = this.#parser.parse(xml);

            try {
              // @TODO: Maybe do something with this as well
              parseIdentifyResponse(childNodes);
            } catch (error: unknown) {
              if (!(error instanceof InnerValidationError)) {
                throw error;
              }

              // @TODO: Maybe log this for now, because we might catch bugs like this too
              console.warn(error);
              console.log(url);
              console.log(xml);
              break responseParse;
            }

            this.#addValidURL(url);
          }

          this.#indexes.addIndex(index);
        })().catch((error) => {
          console.warn(error);
          this.#isToBeTerminated = true;
          this.#abortController.abort();
        }).finally(() => releaseLock());
      }
    } finally {
      this.#isToBeTerminated = false;
      this.#index = undefined;

      await this.#semaphore.waitForEmptyQueue();

      this.#abortController.setNew();
    }
  }

  async #updateStores(): Promise<void> {
    if (this.#urls !== undefined) {
      this.#indexes.removeMarkedElements(this.#urls);
      await this.#urlStore?.setURLs(this.#urls);
    }

    if (this.#validURLs !== undefined) {
      await this.#urlStore?.setValidURLs(this.#validURLs);
    }
  }

  startProcess(): void {
    if (this.#isProcessing) {
      throw new Error("already processing");
    }

    this.#setIsProcessing(true);

    (async () => {
      await this.#urlStoreInitPromise;
      await this.#validateURLs().catch(console.warn);
      await this.#updateStores();
    })().catch(console.warn).finally(() => this.#setIsProcessing(false));
  }

  terminateProcess(): void {
    if (this.#isTerminating) {
      throw new Error("process is already being terimnated");
    }

    if (!this.#isProcessing) {
      throw new Error("no process in progress to terminate");
    }

    this.#setIsTerminating(true);
    this.#isToBeTerminated = true;
    this.#abortController.abort();

    const { promise, resolve } = Promise.withResolvers<void>(),
      unsubsribe = this.#writableIsProcessing.subscribe((v) => {
        if (!v) {
          resolve();
        }
      });

    promise.catch(console.warn).finally(() => {
      this.#isToBeTerminated = false;
      unsubsribe();
      this.#setIsTerminating(false);
    }).catch(console.warn);
  }

  clearURLs() {
    (async () => {
      if (this.#urlStore !== null) {
        await this.#urlStore.clearURLs();
        await this.#urlStore.clearValidURLs();
      }

      this.#urls = undefined;
      this.#validURLs = undefined;
      this.#writableValidURLs.set(undefined);
    })().catch(console.error);
  }
}
