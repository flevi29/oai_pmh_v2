import { build, emptyDir } from "../dev_deps.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {},
  typeCheck: true,
  test: false,
  declaration: true,
  scriptModule: "cjs",
  esModule: true,
  package: {
    // package.json properties
    name: "oai_pmh_v2",
    version: "0.2.1",
    description: "",
    author: "",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/flevi29/oai_pmh_v2.git",
    },
    bugs: {
      url: "https://github.com/flevi29/oai_pmh_v2/issues",
    },
    homepage: "https://github.com/flevi29/oai_pmh_v2#readme",
    devDependencies: {
      "@types/node": "^18.7.13",
    },
  },
  mappings: {
    "https://cdn.skypack.dev/fast-xml-parser@4.0.9?dts": {
      name: "fast-xml-parser",
      version: "4.0.9",
      peerDependency: true,
    },
  },
  compilerOptions: {
    target: "Latest",
    lib: ["dom"],
  },
  packageManager: "npm",
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
