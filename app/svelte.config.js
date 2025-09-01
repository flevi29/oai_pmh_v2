import { env } from "node:process";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";

/**
 * `base_path` output at {@link https://github.com/actions/configure-pages/}
 * @type {import('@sveltejs/kit').KitConfig["paths"]}
 */
const paths =
  env.PAGES_BASE_PATH !== undefined ? { base: env.PAGES_BASE_PATH } : undefined;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // https://svelte.dev/docs/kit/integrations
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // https://svelte.dev/docs/kit/adapter-static#Options-fallback
      fallback: "404.html",
      precompress: true,
      strict: true,
    }),
    paths,
  },

  compilerOptions: { runes: true },
};

export default config;
