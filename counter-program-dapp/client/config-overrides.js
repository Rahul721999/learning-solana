const path = require('path');

module.exports = function override(config) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        // "buffer": require.resolve("buffer"),
    };
    config.resolve.alias = {
        ...config.resolve.alias,
        process: "process/browser",
    };
    return config;
};
