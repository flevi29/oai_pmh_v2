import type { resolve } from "$app/paths";

type ResolvedPath = ReturnType<typeof resolve>;

const LAST_VISITED_OAI_PMH_ACTION_KEY = "lastVisitedOaiPmhAction";

export const getLastVisitedOaiPmhAction = (): ResolvedPath | null =>
  localStorage.getItem(LAST_VISITED_OAI_PMH_ACTION_KEY) as ResolvedPath | null;
export const setLastVisitedOaiPmhAction = (value: ResolvedPath): void =>
  localStorage.setItem(LAST_VISITED_OAI_PMH_ACTION_KEY, value);
