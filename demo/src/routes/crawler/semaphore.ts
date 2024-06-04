import { derived, type Readable, type Writable, writable } from "svelte/store";

export class Semaphore {
  #weight: number;
  readonly #listeners = new Set<(weight: number) => void>();

  constructor(weight: number) {
    this.#weight = weight;
  }

  addListener(listener: (weight: number) => void): () => boolean {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #moveWeight(increment: boolean): void {
    this.#weight = increment ? this.#weight + 1 : this.#weight - 1;
    for (const listener of this.#listeners) {
      listener(this.#weight);
    }
  }

  #promiseChain = Promise.resolve<() => void>(() => {});
  acquireLock(): Promise<() => void> {
    return (this.#promiseChain = this.#promiseChain.then(async () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      const removeListener = this.addListener((weight) => {
        if (weight !== 0) {
          resolve();
        }
      });
      await promise;
      removeListener();

      this.#moveWeight(false);
      return () => this.#moveWeight(true);
    }));
  }
}
