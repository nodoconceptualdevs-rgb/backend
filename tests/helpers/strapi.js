const Strapi = require('@strapi/strapi');

let strapi;

async function setupStrapi() {
  if (!strapi) {
    await Strapi().load();
    strapi.server.mount();
  }
  return strapi;
}

async function closeStrapi() {
  if (strapi) {
    await strapi.destroy();
    strapi = null;
  }
}

module.exports = { setupStrapi, closeStrapi };
