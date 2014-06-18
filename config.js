'use strict';

module.exports = {
  folders: {
    dist: 'dist',
    src: 'src',
    test: 'test'
  },
  concat: {
    library: {
      src: [
        'src/_intro.js',
        'src/core.js',
        'src/track.js',
        'src/lib/base64.js',
        'src/lib/json2.js',
        'src/lib/treasure-domready.js',
        'src/async.js',
        'src/_outro.js'
      ],
      dest: 'td-js-sdk.js'
    },
    loader: {
      src: [
        'src/loader.js'
      ],
      dest: 'td-js-sdk-loader.js'
    }
  },
  minify: {
    library: {
      dest: 'td-js-sdk.min.js'
    },
    loader: {
      dest: 'td-js-sdk-loader.min.js'
    }
  },
  server: {
    port: '9999',
    success: {
      created: true
    },
    error: {
      error: true
    }
  }
};
