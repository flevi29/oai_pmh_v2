import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";
import { getLastVisitedOaiPmhAction } from "$lib/stores/last-visited-oai-pmh-action";
import type { PageLoad } from "./$types";

// TODO: Should identify be default? Maybe.
export const load: PageLoad = () =>
  redirect(308, getLastVisitedOaiPmhAction() ?? resolve("/identify"));
