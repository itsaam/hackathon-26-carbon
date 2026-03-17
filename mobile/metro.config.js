const path = require("path");
const { getDefaultConfig } = require("@expo/metro-config");
const { resolve } = require("metro-resolver");

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround Windows resolver issue for @expo/metro-runtime RSC runtime.
// Metro sometimes fails to resolve the package subpath even when the file exists.
const rscRuntimePath = path.join(__dirname, "node_modules", "@expo", "metro-runtime", "rsc", "runtime.js");
const expoMetroRuntimeRoot = path.join(__dirname, "node_modules", "@expo", "metro-runtime");

config.watchFolders = Array.from(
  new Set([...(config.watchFolders || []), expoMetroRuntimeRoot]),
);

// On some Windows setups (notably with OneDrive / reparse points), Metro can fail
// to resolve "expo" when the origin module is inside certain node_modules folders.
// Force `expo` to always resolve from the app's node_modules.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  expo: path.join(__dirname, "node_modules", "expo"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@expo/metro-runtime/rsc/runtime") {
    return { type: "sourceFile", filePath: rscRuntimePath };
  }

  return resolve(context, moduleName, platform);
};

module.exports = config;

