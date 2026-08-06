const { createCoreController } = require('@strapi/strapi').factories;
const { requiereAdmin, requierePermisoObra } = require('../../../utils/permisos-obra');
const { registrarHistorial } = require('../../../utils/historial');

module.exports = createCoreController('api::partida.partida', ({ strapi }) => ({
  async find(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.findOne(ctx);
  },

  async create(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.create(ctx);
  },

  async update(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.delete(ctx);
  },

  async updatePrecio(ctx) {
    const { id } = ctx.params;
    const { precio_nuevo } = ctx.request.body;

    // Validación básica
    if (typeof precio_nuevo !== 'number' || precio_nuevo < 0) {
      return ctx.badRequest('precio_nuevo debe ser un número ≥ 0');
    }

    try {
      // Verificar que partida existe
      const partida = await strapi.entityService.findOne('api::partida.partida', id, {
        populate: ['obra'],
      });
      if (!partida) {
        return ctx.notFound('Partida no encontrada');
      }

      const usuarioActor = await requierePermisoObra(ctx, partida.obra?.id, 'partidas', 'update');
      if (!usuarioActor) return;

      // Usar el service para actualizar con histórico
      const partidaActualizada = await strapi.service('api::partida.partida').updatePrecioWithHistory(id, precio_nuevo);

      console.log(`[PARTIDA] Precio actualizado: partida ${id}, nuevo precio ${precio_nuevo}`);

      await registrarHistorial({
        obra: partida.obra,
        usuario: usuarioActor,
        modulo: 'partidas',
        accion: 'EDITAR',
        descripcion: `Editó el precio de la partida ${partida.id}: $${partida.precioUnitario ?? 0} → $${precio_nuevo}`,
        cambios: { precioUnitario: { anterior: partida.precioUnitario ?? null, nuevo: precio_nuevo } },
      });

      return ctx.send({ data: partidaActualizada });
    } catch (error) {
      console.error('[ERROR] updatePrecio:', error);
      ctx.throw(500, 'Error actualizando precio de partida');
    }
  }
}));
