"use strict";

/**
 * media-tag controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::media-tag.media-tag",
  ({ strapi }) => ({
    // Obtener todos los tags
    async find(ctx) {
      const tags = await strapi.entityService.findMany(
        "api::media-tag.media-tag",
        {
          sort: { name: "asc" },
        },
      );
      return { data: tags };
    },

    // Crear un nuevo tag
    async create(ctx) {
      const { name } = ctx.request.body;

      if (!name || !name.trim()) {
        return ctx.badRequest("El nombre del tag es requerido");
      }

      // Verificar si ya existe
      const existing = await strapi.entityService.findMany(
        "api::media-tag.media-tag",
        {
          filters: { name: name.trim() },
        },
      );

      if (existing && existing.length > 0) {
        return ctx.badRequest("Este tag ya existe");
      }

      const tag = await strapi.entityService.create(
        "api::media-tag.media-tag",
        {
          data: {
            name: name.trim(),
            files: [],
          },
        },
      );

      return { data: tag };
    },

    // Agregar archivo a un tag
    async addFile(ctx) {
      const { id } = ctx.params;
      const { fileId } = ctx.request.body;

      if (!fileId) {
        return ctx.badRequest("El ID del archivo es requerido");
      }

      const tag = await strapi.entityService.findOne(
        "api::media-tag.media-tag",
        id,
      );

      if (!tag) {
        return ctx.notFound("Tag no encontrado");
      }

      const files = tag.files || [];

      // Evitar duplicados
      if (!files.includes(fileId)) {
        files.push(fileId);

        const updated = await strapi.entityService.update(
          "api::media-tag.media-tag",
          id,
          {
            data: { files },
          },
        );

        return { data: updated };
      }

      return { data: tag };
    },

    // Remover archivo de un tag
    async removeFile(ctx) {
      const { id } = ctx.params;

      // Obtener fileId del body o query
      const fileId = ctx.request.body?.fileId || ctx.request.query?.fileId;

      if (!fileId) {
        return ctx.badRequest("El ID del archivo es requerido");
      }

      const tag = await strapi.entityService.findOne(
        "api::media-tag.media-tag",
        id,
      );

      if (!tag) {
        return ctx.notFound("Tag no encontrado");
      }

      // Convertir fileId a número para comparación
      const fileIdNum = parseInt(fileId, 10);
      const files = (tag.files || []).filter((fId) => fId !== fileIdNum);

      const updated = await strapi.entityService.update(
        "api::media-tag.media-tag",
        id,
        {
          data: { files },
        },
      );

      return { data: updated };
    },

    // Obtener archivos de un tag
    async getFiles(ctx) {
      const { id } = ctx.params;

      const tag = await strapi.entityService.findOne(
        "api::media-tag.media-tag",
        id,
      );

      if (!tag) {
        return ctx.notFound("Tag no encontrado");
      }

      const fileIds = tag.files || [];

      if (fileIds.length === 0) {
        return [];
      }

      // Obtener archivos de la media library
      const files = await strapi.plugins.upload.services.upload.findMany({
        filters: {
          id: { $in: fileIds },
        },
      });

      return files;
    },

    // Actualizar tag
    async update(ctx) {
      const { id } = ctx.params;
      const { name } = ctx.request.body;

      if (!name || !name.trim()) {
        return ctx.badRequest("El nombre del tag es requerido");
      }

      const tag = await strapi.entityService.findOne(
        "api::media-tag.media-tag",
        id,
      );

      if (!tag) {
        return ctx.notFound("Tag no encontrado");
      }

      // Verificar si ya existe otro tag con ese nombre
      const existing = await strapi.entityService.findMany(
        "api::media-tag.media-tag",
        {
          filters: { name: name.trim() },
        },
      );

      if (existing && existing.length > 0 && existing[0].id !== parseInt(id)) {
        return ctx.badRequest("Ya existe un tag con ese nombre");
      }

      const updated = await strapi.entityService.update(
        "api::media-tag.media-tag",
        id,
        {
          data: { name: name.trim() },
        },
      );

      return { data: updated };
    },

    // Eliminar tag
    async delete(ctx) {
      const { id } = ctx.params;

      const tag = await strapi.entityService.findOne(
        "api::media-tag.media-tag",
        id,
      );

      if (!tag) {
        return ctx.notFound("Tag no encontrado");
      }

      await strapi.entityService.delete("api::media-tag.media-tag", id);

      return { data: { id } };
    },
  }),
);
