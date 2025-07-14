const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Reduce the number of workers to prevent memory issues
config.maxWorkers = 2;

// Add transformer configurations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  },
};

// Optimize the resolver
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'ttf', 'mp4', 'wav', 'mp3', 'svg'],
  platforms: ['native', 'web', 'ios', 'android'],
};

module.exports = config;