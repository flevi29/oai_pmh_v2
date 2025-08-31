import tsconfig from "./tsconfig.json" with { type: "json" };
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    target: tsconfig.compilerOptions.target,
    lib: {
      entry: "src/mod.ts",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        switch (format) {
          case "es":
            return `esm/${entryName}.js`;
          case "cjs":
            return `cjs/${entryName}.cjs`;
          default:
            throw new Error(`bad format ${format}`);
        }
      },
    },
  },
});
