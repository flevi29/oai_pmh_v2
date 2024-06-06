export class Indexes {
  readonly #indexes = new Map<number, number>();

  addIndex(index: number): void {
    let indexDelCount = 1;

    const oneAboveIndex = index + 1,
      oneAboveDelCount = this.#indexes.get(oneAboveIndex);

    if (oneAboveDelCount !== undefined) {
      indexDelCount += oneAboveDelCount;
      this.#indexes.delete(oneAboveIndex);
    }

    for (let i = index - 1; i >= 0; i -= 1) {
      const delCount = this.#indexes.get(i);

      if (delCount === undefined) {
        continue;
      }

      if (i + delCount === index) {
        this.#indexes.set(i, delCount + indexDelCount);
        return;
      }

      break;
    }

    this.#indexes.set(index, indexDelCount);
  }

  removeMarkedElements(array: unknown[]): void {
    const indexes: [index: number, delCount: number][] = Array.from(
      this.#indexes,
    ).sort(([indexA], [indexB]) => indexB - indexA);

    for (const [index, delCount] of indexes) {
      array.splice(index, delCount);
    }

    this.#indexes.clear();
  }
}
