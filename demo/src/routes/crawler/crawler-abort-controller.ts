const CRAWLER_ABORT_SYMBOL = Symbol("Crawler abort symbol");

class CrawlerAbortController {
  #abortController = new AbortController();

  get signal() {
    return this.#abortController.signal;
  }

  abort() {
    this.#abortController.abort(CRAWLER_ABORT_SYMBOL);
  }

  setNew() {
    if (this.#abortController.signal.aborted) {
      this.#abortController = new AbortController();
    }
  }
}

export { CRAWLER_ABORT_SYMBOL, CrawlerAbortController };
