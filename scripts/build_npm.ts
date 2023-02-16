import { build, emptyDir } from "../dev_deps.ts";
import { default as denoJson } from "../deno.json" assert { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: { undici: true },
  typeCheck: true,
  test: false,
  declaration: true,
  scriptModule: false,
  esModule: true,
  package: {
    // package.json properties
    name: "oai_pmh_v2",
    version: denoJson.version,
    author: "Fodor Levente",
    license: "MIT",
    description: "Deno and Node.js API module for OAI-PMH.",
    keywords: ["OAI-PMH", "oaipmh", "oai", "metadata", "harvest", "protocol"],
    repository: {
      type: "git",
      url: "git+https://github.com/flevi29/oai_pmh_v2.git",
    },
    bugs: {
      url: "https://github.com/flevi29/oai_pmh_v2/issues",
    },
    homepage: "https://github.com/flevi29/oai_pmh_v2#readme",
    devDependencies: { "@types/node": "^18.13.0" },
  },
  compilerOptions: {
    target: "Latest",
    lib: ["dom"],
  },
  packageManager: "pnpm",
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
