const COUNT = 4;

let indexes: number[] = [],
  urls = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
  ];

function asd() {
  const lastIndex = indexes[indexes.length - 1],
    lastIndexEnd = lastIndex === undefined ? undefined : lastIndex + COUNT - 1,
    start = lastIndexEnd === undefined ? 0 : lastIndexEnd + 1,
    slicedURLs = urls.slice(start, start + COUNT);

  console.log({ slicedURLs, lastIndex, lastIndexEnd, start, indexes });

  indexes.push(start);
}

function del() {
  let delCount = 1;
  indexes.sort((a, b) => b - a);
  for (let i = 0; i < indexes.length; i += 1) {
    const value = indexes[i]!, nextValue = indexes[i + 1];

    if (nextValue !== undefined && value - nextValue === COUNT) {
      delCount += 1;
      continue;
    }

    urls.splice(value, COUNT * delCount);
    delCount = 1;
  }

  console.log(urls);
}

asd();
// asd();
// asd();
// asd();
// asd();
del();
