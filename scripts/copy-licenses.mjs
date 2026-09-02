import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const licensePath = join(rootDir, "LICENSE");
const packagesDir = join(rootDir, "packages");

if (!existsSync(licensePath)) {
  throw new Error("Root LICENSE file is missing");
}

for (const entry of readdirSync(packagesDir)) {
  const packageDir = join(packagesDir, entry);
  if (!statSync(packageDir).isDirectory()) continue;
  if (!existsSync(join(packageDir, "package.json"))) continue;
  copyFileSync(licensePath, join(packageDir, "LICENSE"));
  console.log(`Copied LICENSE -> packages/${entry}/LICENSE`);
}
