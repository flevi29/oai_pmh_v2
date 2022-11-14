import { build, emptyDir } from "../dev_deps.ts";
import { version } from "../deno.json" assert { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: { undici: true },
  typeCheck: true,
  test: false,
  declaration: true,
  scriptModule: "cjs",
  esModule: true,
  package: {
    // package.json properties
    name: "oai_pmh_v2",
    version,
    author: "Fodor Levente",
    license: "MIT",
    description: "Deno and Node.js API module for OAI-PMH.",
    keywords: ["OAI-PMH", "oaipmh", "oai", "metadata", "harvest", "protocol"],
    engines: { node: ">=16.8" },
    repository: {
      type: "git",
      url: "git+https://github.com/flevi29/oai_pmh_v2.git",
    },
    bugs: {
      url: "https://github.com/flevi29/oai_pmh_v2/issues",
    },
    homepage: "https://github.com/flevi29/oai_pmh_v2#readme",
    devDependencies: {
      "@types/node": "^18.11.9",
      "fast-xml-parser": "^4.0.11",
    },
    peerDependenciesMeta: { "fast-xml-parser": { optional: true } },
  },
  mappings: {
    "npm:fast-xml-parser@^4.0.11": {
      name: "fast-xml-parser",
      version: "^4.0.11",
      peerDependency: true,
    },
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
