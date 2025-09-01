import pkg from "../package.json" with { type: "json" };

const baseUrl = new URL("..", import.meta.url);
const workspaceUrl = new URL("..", baseUrl);
const distUrl = new URL("dist/", baseUrl);

const pkgUrl = new URL("package.json", distUrl);
const licenseUrl = new URL("LICENSE", workspaceUrl);
const licenseUrlTo = new URL("LICENSE", distUrl);
const readmeUrl = new URL("README.md", workspaceUrl);
const readmeUrlTo = new URL("README.md", distUrl);

const { publishExports, exports: _, ...restOfPkg } = pkg;
const pkgWithProperExports = { exports: publishExports, ...restOfPkg };

Deno.writeTextFileSync(pkgUrl, JSON.stringify(pkgWithProperExports, null, 2));

Deno.copyFileSync(licenseUrl, licenseUrlTo);
Deno.copyFileSync(readmeUrl, readmeUrlTo);
