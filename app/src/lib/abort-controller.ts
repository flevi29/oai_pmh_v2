export const ABORT_SYMBOL = Symbol(
  "Symbol for aborting requests and identifying resulting errors.",
);

export function getAbortController() {
  let ac = new AbortController(),
    signal = ac.signal;

  return {
    get signal() {
      return signal;
    },
    abort(): void {
      ac.abort(ABORT_SYMBOL);
      ac = new AbortController();
      signal = ac.signal;
    },
  };
}
