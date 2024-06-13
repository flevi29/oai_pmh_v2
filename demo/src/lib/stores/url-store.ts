type ValidURLObject = { name: string; url: string };

const DB_NAME = "URLS",
  VERSION = 1,
  URLS_STORE = "urlsStore",
  URLS_KEY = "0",
  VALID_URLS_KEY = "1";

function tryJSONStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

class URLStore {
  #db: IDBDatabase | null = null;

  closeDatabase() {
    if (this.#db === null) {
      return;
    }

    try {
      this.#db.close();
    } catch (error) {
      console.error(error);
    }

    this.#db.onclose = null;
    this.#db.onversionchange = null;
    this.#db.onabort = null;
    this.#db.onerror = null;

    this.#db = null;
  }

  async connectToDatabase(): Promise<void> {
    const openRequest = indexedDB.open(DB_NAME, VERSION);
    this.#db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => resolve(openRequest.result);
      openRequest.onblocked = (event) => {
        const { oldVersion, newVersion } = event;
        reject(
          new Error(
            `Upgrade required from version ${oldVersion} to ${newVersion}, expected other connections to be closed`,
            { cause: event },
          ),
        );
      };
      openRequest.onupgradeneeded = (event) => {
        // Database migration code
        const db = openRequest.result;
        let actualVersion = event.oldVersion;

        if (actualVersion === 0) {
          db.createObjectStore(URLS_STORE);

          actualVersion += 1;
        }

        // In case we upgrade:
        // if (actualVersion === 1) {
        //   // migration code here...
        //   actualVersion += 1;
        // }
      };
    }).finally(() => {
      openRequest.onerror = null;
      openRequest.onsuccess = null;
      openRequest.onblocked = null;
      openRequest.onupgradeneeded = null;
    });

    this.#db.onclose = (event) => {
      this.closeDatabase();
      console.error(
        new Error("Connection to database closed unexpectedly", {
          cause: event,
        }),
      );
    };

    this.#db.onversionchange = (event) => {
      this.closeDatabase();

      const { oldVersion, newVersion } = event;
      // @TODO: This should call a callback which should reload the browser eventually, otherwise DB cannot be used on tab
      console.error(
        new Error(
          `Upgrade required from version ${oldVersion} to ${newVersion}, page reload required`,
          { cause: event },
        ),
      );
    };

    const unexpectedEventBubbleUpHandler = (event: Event) => {
      this.closeDatabase();

      console.error(
        new Error("Unhandled abort/error event caught from a transaction", {
          cause: event,
        }),
      );
    };

    this.#db.onabort = unexpectedEventBubbleUpHandler;
    this.#db.onerror = unexpectedEventBubbleUpHandler;
  }

  #getDB(): IDBDatabase {
    if (this.#db === null) {
      throw new Error("db hasn't been initialized or was closed");
    }

    return this.#db;
  }

  #getTransactionAndStore(): {
    transaction: IDBTransaction;
    transactionPromise: Promise<void>;
    store: IDBObjectStore;
  } {
    const db = this.#getDB(),
      transaction = db.transaction(URLS_STORE, "readwrite", {
        durability: "relaxed",
      }),
      transactionPromise = new Promise<void>((resolve, reject) => {
        transaction.onabort = (event) => {
          event.stopPropagation();
          reject(new Error("Transaction aborted"));
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
          event.stopPropagation();
          reject(transaction.error);
        };
      }).finally(() => {
        transaction.onabort = null;
        transaction.oncomplete = null;
        transaction.onerror = null;
      }),
      store = transaction.objectStore(URLS_STORE);

    return { transaction, transactionPromise, store };
  }

  async #getRequestResult<T>(
    transaction: IDBTransaction,
    transactionPromise: Promise<void>,
    request: IDBRequest<T>,
  ): Promise<T> {
    const requestPromise = new Promise<T>((resolve, reject) => {
      request.onerror = (event) => {
        event.stopPropagation();
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result);
    }).finally(() => {
      request.onerror = null;
      request.onsuccess = null;
    });

    transaction.commit();

    const [settledRequest, settledTransaction] = await Promise.allSettled([
      requestPromise,
      transactionPromise,
    ]);

    if (settledRequest.status === "fulfilled") {
      return settledRequest.value;
    }

    const cause: unknown[] = [settledRequest.reason];
    if (settledTransaction.status === "rejected") {
      cause.push(settledTransaction.reason);
    }

    throw new Error(
      "Transaction and/or request failed with the following errors:\n" +
        cause.map((v) =>
          "\t" +
          (typeof v === "object" && v !== null && "message" in v
            ? v.message
            : tryJSONStringify(v))
        ).join("\n"),
      { cause },
    );
  }

  async getURLs(): Promise<string[] | undefined> {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    return await this.#getRequestResult<string[] | undefined>(
      transaction,
      transactionPromise,
      store.get(URLS_KEY),
    );
  }

  async setURLs(urls: string[]): Promise<void> {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    await this.#getRequestResult(
      transaction,
      transactionPromise,
      store.put(urls, URLS_KEY),
    );
  }

  async clearURLs() {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    await this.#getRequestResult(
      transaction,
      transactionPromise,
      store.delete(URLS_KEY),
    );
  }

  async getValidURLs(): Promise<ValidURLObject[] | undefined> {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    return await this.#getRequestResult<ValidURLObject[] | undefined>(
      transaction,
      transactionPromise,
      store.get(VALID_URLS_KEY),
    );
  }

  async setValidURLs(urls: ValidURLObject[]): Promise<void> {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    await this.#getRequestResult(
      transaction,
      transactionPromise,
      store.put(urls, VALID_URLS_KEY),
    );
  }

  async clearValidURLs() {
    const { store, transaction, transactionPromise } = this
      .#getTransactionAndStore();

    await this.#getRequestResult(
      transaction,
      transactionPromise,
      store.delete(VALID_URLS_KEY),
    );
  }
}

export { URLStore, type ValidURLObject };
