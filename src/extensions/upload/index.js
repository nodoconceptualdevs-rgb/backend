'use strict';

const fs = require('fs');

module.exports = {
  register({ strapi }) {
    const originalUnlink = fs.promises.unlink;

    fs.promises.unlink = async function (path) {
      try {
        return await originalUnlink.call(fs.promises, path);
      } catch (err) {
        if (
          (err.code === 'EPERM' || err.code === 'ENOENT') &&
          typeof path === 'string' &&
          path.includes('strapi-upload')
        ) {
          strapi.log.warn(`[upload] Ignoring ${err.code} on temp file cleanup: ${path}`);
          return;
        }
        throw err;
      }
    };
  },
};
