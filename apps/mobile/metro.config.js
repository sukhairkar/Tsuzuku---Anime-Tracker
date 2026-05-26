const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

/**
 * Metro configuration for monorepo workspace resolution.
 */
const config = {
  watchFolders: [rootDir],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(rootDir, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
