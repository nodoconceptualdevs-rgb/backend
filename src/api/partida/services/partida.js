'use strict';

/**
 * partida service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::partida.partida', ({ strapi }) => ({
  async updatePrecioWithHistory(partidaId, nuevoPrecio) {
    try {
      // 1. Cerrar registro vigente en histórico
      const registroVigente = await strapi.db.query('api::partida-precio-historial.partida-precio-historial').findOne({
        where: {
          partida: partidaId,
          fecha_fin: null
        }
      });

      if (registroVigente) {
        await strapi.entityService.update('api::partida-precio-historial.partida-precio-historial', registroVigente.id, {
          data: {
            fecha_fin: new Date().toISOString()
          }
        });
      }

      // 2. Crear nuevo registro en histórico
      await strapi.entityService.create('api::partida-precio-historial.partida-precio-historial', {
        data: {
          partida: partidaId,
          precio: nuevoPrecio,
          fecha_inicio: new Date().toISOString(),
          fecha_fin: null
        }
      });

      // 3. Actualizar precio_actual en partida
      const partidaActualizada = await strapi.entityService.update('api::partida.partida', partidaId, {
        data: {
          precio_actual: nuevoPrecio
        }
      });

      return partidaActualizada;
    } catch (error) {
      console.error('[ERROR] updatePrecioWithHistory:', error);
      throw error;
    }
  }
}));
