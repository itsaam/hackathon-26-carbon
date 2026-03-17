/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "@expo", "metro-runtime", "src", "index.ts");
const pkgRoot = path.join(__dirname, "..", "node_modules", "@expo", "metro-runtime");

function main() {
  if (!fs.existsSync(target)) {
    console.log(`[patch] skip: not found: ${target}`);
    return;
  }

  const src = fs.readFileSync(target, "utf8");
  const fromSingle = "import '@expo/metro-runtime/rsc/runtime';";
  const fromDouble = 'import "@expo/metro-runtime/rsc/runtime";';
  const fromRelativeNoExtSingle = "import '../rsc/runtime';";
  const fromRelativeNoExtDouble = 'import \"../rsc/runtime\";';
  const fromRelativeJs = "import '../rsc/runtime.js';";

  // On some Windows setups (notably with OneDrive reparse points), Metro can fail to
  // resolve files inside reparse-point directories. We vendor a copy under `src/`
  // (which Metro already resolves) and import it locally.
  const vendoredDir = path.join(pkgRoot, "src", "rsc");
  const vendoredFile = path.join(vendoredDir, "runtime.js");
  const originalRuntime = path.join(pkgRoot, "rsc", "runtime.js");
  const to = "import './rsc/runtime.js';";

  if (
    !src.includes(fromSingle) &&
    !src.includes(fromDouble) &&
    !src.includes(fromRelativeNoExtSingle) &&
    !src.includes(fromRelativeNoExtDouble) &&
    !src.includes(fromRelativeJs)
  ) {
    console.log("[patch] ok: no patch needed (pattern not present)");
    return;
  }

  if (fs.existsSync(originalRuntime)) {
    fs.mkdirSync(vendoredDir, { recursive: true });
    fs.copyFileSync(originalRuntime, vendoredFile);
  } else {
    console.log(`[patch] warn: missing runtime: ${originalRuntime}`);
  }

  let next = src;
  next = next.replace(fromSingle, to);
  next = next.replace(fromDouble, to);
  next = next.replace(fromRelativeNoExtSingle, to);
  next = next.replace(fromRelativeNoExtDouble, to);
  next = next.replace(fromRelativeJs, to);

  fs.writeFileSync(target, next, "utf8");
  console.log("[patch] ok: patched @expo/metro-runtime import for RSC runtime");
}

main();

