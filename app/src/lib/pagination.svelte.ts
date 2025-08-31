function splitIntoPaginatedValues<T>(
  values: T[],
  valuesPerPage: number,
): T[][] {
  const valuesByPage: T[][] = [];

  let multiplier = 1;
  for (let i = 0; i < values.length; i += valuesPerPage) {
    valuesByPage.push(values.slice(i, multiplier * valuesPerPage));
    multiplier += 1;
  }

  return valuesByPage;
}

function getPagesArray(totalPages: number, page: number): (number | null)[] {
  const pageM2 = page - 2,
    pageP2 = page + 2,
    totalPagesM1 = totalPages - 1,
    pages: (number | null)[] = [];

  let i = 1;
  while (i <= totalPages) {
    if (i === 3) {
      if (i < pageM2) {
        pages.push(null);
        i = pageM2;
      }
    } else if (i === pageP2 + 1 && i < totalPagesM1) {
      pages.push(null);

      i = totalPagesM1;
    }

    pages.push(i);

    i += 1;
  }

  return pages;
}

export function getPagination<T>(values: T[], valuesPerPage: number) {
  if (valuesPerPage < 1) {
    throw new RangeError("`valuesPerPage` must be greater than 0");
  }

  const paginatedValues: T[][] = splitIntoPaginatedValues(
      values,
      valuesPerPage,
    ),
    totalPages: number = paginatedValues.length;

  let page = $state<number>(1);
  const pages = $derived(getPagesArray(totalPages, page)),
    valuesForCurrentPage = $derived(paginatedValues[page - 1]!);

  return {
    get totalPages() {
      return totalPages;
    },
    get page() {
      return page;
    },
    get pages() {
      return pages;
    },
    get valuesForCurrentPage() {
      return valuesForCurrentPage;
    },
    setPage(value: number): void {
      if (value < 1) {
        throw new RangeError("`page` must be greater than 0");
      }

      if (value > totalPages) {
        throw new RangeError("`page` cannot be greater than `totalPages`");
      }

      page = value;
    },
  };
}
