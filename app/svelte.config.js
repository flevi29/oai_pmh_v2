import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // https://svelte.dev/docs/kit/integrations
  preprocess: vitePreprocess(),

  kit: { adapter: adapter({ precompress: true, strict: true }) },

  compilerOptions: { runes: true },
};

export default config;
