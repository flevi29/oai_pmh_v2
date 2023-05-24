import { build, emptyDir } from "../dev_deps.ts";
import { default as denoJson } from "../deno.json" assert { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {},
  typeCheck: "single",
  test: false,
  declaration: "separate",
  scriptModule: false,
  esModule: true,
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
    bugs: {
      url: "https://github.com/flevi29/oai_pmh_v2/issues",
    },
    homepage: "https://github.com/flevi29/oai_pmh_v2#readme",
    devDependencies: { "@types/node": "^20.2.3" },
  },
  // DOM is required for fetch API to type check properly
  compilerOptions: { target: "ES2022", lib: ["DOM"] },
  packageManager: "pnpm",
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
