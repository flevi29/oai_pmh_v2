import { build, emptyDir } from "../dev_deps.ts";
import { default as denoJson } from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {},
  test: false,
  package: {
    name: "oai_pmh_v2",
    version: denoJson.version,
    author: "Fodor Levente",
    license: "MIT",
    description: "Node.js OAI-PMH client.",
    keywords: ["OAI-PMH", "oaipmh", "oai", "metadata", "harvest", "protocol"],
    repository: {
      type: "git",
      url: "git+https://github.com/flevi29/oai_pmh_v2.git",
    },
    bugs: { url: "https://github.com/flevi29/oai_pmh_v2/issues" },
    homepage: "https://github.com/flevi29/oai_pmh_v2#readme",
    // options under are required for fetch to work with Node.js
    // https://nodejs.org/dist/latest-v20.x/docs/api/globals.html#fetch
    devDependencies: { "@types/node": "^20.11.19" },
  },
  compilerOptions: { ...denoJson.compilerOptions, target: "ES2022" },
  packageManager: "pnpm",
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
