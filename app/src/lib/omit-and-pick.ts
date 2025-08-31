export function omitAndPick<T extends object, TKeys extends (keyof T)[]>(
  obj: T,
  ...keys: TKeys
): [omitted: Omit<T, TKeys[number]>, picked: Pick<T, TKeys[number]>] {
  const picked = <Pick<T, TKeys[number]>>{};

  for (const key of keys) {
    picked[key] = obj[key];
    delete obj[key];
  }

  return [obj, picked];
}
