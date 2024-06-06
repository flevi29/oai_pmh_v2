import { type Writable, writable } from "svelte/store";

export class Semaphore {
  readonly #initialWeight: number;
  #weight: Writable<number>;

  constructor(weight: number) {
    this.#initialWeight = weight;
    this.#weight = writable(weight);
  }

  #moveWeight(increment: boolean): void {
    this.#weight.update((v) => increment ? v + 1 : v - 1);
  }

  #promiseChain = Promise.resolve(() => {});
  acquireLock(): Promise<() => void> {
    return (this.#promiseChain = this.#promiseChain.then(async () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      const unsubscribe = this.#weight.subscribe((weight) => {
        if (weight !== 0) {
          resolve();
        }
      });

      await promise;
      unsubscribe();

      this.#moveWeight(false);

      let callback: (() => void) | null = () => this.#moveWeight(true);
      return () => {
        if (callback !== null) {
          callback();
          callback = null;
        }
      };
    }));
  }

  async waitForEmptyQueue(): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>(),
      unsubsribe = this.#weight.subscribe((weight) => {
        if (weight === this.#initialWeight) {
          resolve();
        }
      });

    try {
      await promise;
    } finally {
      unsubsribe();
    }
  }

  runWithNoParallelism(callback: () => void): Promise<() => void> {
    return (this.#promiseChain = this.#promiseChain.then(async () => {
      await this.waitForEmptyQueue();
      callback();
      return () => {};
    }));
  }
}
