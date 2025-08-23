
const { getDefaultConfig } = require('expo/metro-config');

// Customize the Metro bundler configuration to improve compatibility with some
// packages (like Firebase) that export CommonJS modules and rely on package
// exports. Without these tweaks, Metro can sometimes fail to resolve
// modules, leading to errors such as "Component auth has not been registered"
// when Firebase's auth module is initialized.  See:
// https://stackoverflow.com/questions/78030915/component-auth-has-not-been-registered-yet
const defaultConfig = getDefaultConfig(__dirname);

// Add the .cjs extension to the list of resolved source extensions. Some
// Firebase modules publish CommonJS builds with a .cjs extension, and Metro
// won't find them unless we explicitly add this extension.
defaultConfig.resolver.sourceExts = defaultConfig.resolver.sourceExts || [];
if (!defaultConfig.resolver.sourceExts.includes('cjs')) {
  defaultConfig.resolver.sourceExts.push('cjs');
}

// Disable the unstable package exports feature. This is currently enabled by
// default in Expo SDK 53, but it breaks Firebase's ESM/CJS resolution. Setting
// this flag to false tells Metro to ignore "exports" fields in package.json
// and fall back to traditional resolution, which avoids runtime errors.
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
