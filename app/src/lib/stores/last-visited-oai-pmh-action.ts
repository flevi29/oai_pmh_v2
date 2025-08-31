const LAST_VISITED_OAI_PMH_ACTION_KEY = "lastVisitedOaiPmhAction";

export const getLastVisitedOaiPmhAction = (): string | null =>
  localStorage.getItem(LAST_VISITED_OAI_PMH_ACTION_KEY);
export const setLastVisitedOaiPmhAction = (value: string): void =>
  localStorage.setItem(LAST_VISITED_OAI_PMH_ACTION_KEY, value);
