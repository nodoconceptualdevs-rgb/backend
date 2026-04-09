"use strict";

/**
 * media-tag router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

const defaultRouter = createCoreRouter("api::media-tag.media-tag");

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: "POST",
    path: "/media-tags/:id/files",
    handler: "media-tag.addFile",
  },
  {
    method: "DELETE",
    path: "/media-tags/:id/files",
    handler: "media-tag.removeFile",
  },
  {
    method: "GET",
    path: "/media-tags/:id/files",
    handler: "media-tag.getFiles",
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
