import { cp, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = resolve(repositoryRoot, "dist");
const publicAssets = resolve(repositoryRoot, "assets");

await cp(resolve(buildRoot, "index.html"), resolve(repositoryRoot, "index.html"));
await rm(publicAssets, { recursive: true, force: true });
await cp(resolve(buildRoot, "assets"), publicAssets, { recursive: true });
