"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

module.exports = async ({ strapi }) => {
  // Configurar permisos para el content type folder
  try {
    console.log("🔧 Configurando permisos para folders...");

    // Obtener roles
    const authenticatedRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "authenticated" },
      });

    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "public" },
      });

    if (authenticatedRole) {
      // Configurar permisos para usuarios autenticados
      const authenticatedPermissions = await strapi
        .query("plugin::users-permissions.permission")
        .findMany({
          where: { role: authenticatedRole.id },
        });

      // Verificar si ya existen permisos para folder
      const folderPermissions = authenticatedPermissions.filter((p) =>
        p.action.includes("folder"),
      );

      if (folderPermissions.length === 0) {
        console.log("📁 Creando permisos para folders...");

        // Crear permisos para folder
        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: "api::folder.folder.find",
            subject: null,
            properties: {},
            conditions: [],
            role: authenticatedRole.id,
          },
        });

        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: "api::folder.folder.findOne",
            subject: null,
            properties: {},
            conditions: [],
            role: authenticatedRole.id,
          },
        });

        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: "api::folder.folder.create",
            subject: null,
            properties: {},
            conditions: [],
            role: authenticatedRole.id,
          },
        });

        console.log(
          "✅ Permisos de folder configurados para usuarios autenticados",
        );
      }
    }

    if (publicRole) {
      // Configurar permisos para usuarios públicos (solo lectura)
      const publicPermissions = await strapi
        .query("plugin::users-permissions.permission")
        .findMany({
          where: { role: publicRole.id },
        });

      const publicFolderPermissions = publicPermissions.filter((p) =>
        p.action.includes("folder"),
      );

      if (publicFolderPermissions.length === 0) {
        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: "api::folder.folder.find",
            subject: null,
            properties: {},
            conditions: [],
            role: publicRole.id,
          },
        });

        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: "api::folder.folder.findOne",
            subject: null,
            properties: {},
            conditions: [],
            role: publicRole.id,
          },
        });

        console.log(
          "✅ Permisos de folder configurados para usuarios públicos",
        );
      }
    }
  } catch (error) {
    console.error("❌ Error configurando permisos:", error);
  }
};
