'use strict';

const { verify } = require('jsonwebtoken');
const { obtenerUsuarioDesdeToken } = require('../../../utils/permisos-obra');
const { registrarHistorial } = require('../../../utils/historial');

// Campos seguros del usuario a exponer al popular `gerentes` (evita filtrar
// password, resetPasswordToken, confirmationToken, etc.)
const GERENTE_FIELDS = ['id', 'username', 'email'];

/**
 * Estas rutas usan auth: false porque el rol "Authenticated" de Strapi
 * nunca tuvo estos permisos habilitados en el panel de administración.
 * En su lugar, verificamos el JWT a mano (mismo patrón que
 * proyecto.js::authNFC) y exigimos rol admin explícitamente.
 */
async function verificarAdmin(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return false;

  try {
    const decoded = verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'));
    const userId = typeof decoded === 'object' ? decoded.id : undefined;
    if (!userId) return false;

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
      populate: ['role'],
    });

    return Boolean(user && user.role?.type === 'admin');
  } catch (error) {
    return false;
  }
}

module.exports = {
  async obtenerPermisos(ctx) {
    if (!(await verificarAdmin(ctx))) {
      return ctx.forbidden('Solo administradores pueden ver permisos de gerentes');
    }

    const { obraId, gerenteId } = ctx.params;

    try {
      const permisos = await strapi.entityService.findMany(
        'api::obra-gerente-permiso.obra-gerente-permiso',
        {
          filters: {
            obra: { id: parseInt(obraId) },
            gerente: { id: parseInt(gerenteId) },
          },
        }
      );

      if (permisos.length === 0) {
        return ctx.send({
          permisos: {
            partidas: { read: false, create: false, update: false, delete: false },
            reportes: { read: false, create: false },
            personal: { read: false, create: false, update: false, delete: false },
            valuaciones: { read: false, create: false },
            analitica: { read: false },
            inventario: { read: false, create: false, update: false, delete: false },
            historial: { read: false },
          },
        });
      }

      const permiso = permisos[0];
      return ctx.send({
        id: permiso.id,
        permisos: {
          partidas: permiso.partidas,
          reportes: permiso.reportes,
          personal: permiso.personal,
          valuaciones: permiso.valuaciones,
          analitica: permiso.analitica,
          inventario: permiso.inventario,
          historial: permiso.historial ?? { read: false },
        },
      });
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      ctx.throw(500, 'Error al obtener permisos');
    }
  },

  async guardarPermisos(ctx) {
    if (!(await verificarAdmin(ctx))) {
      return ctx.forbidden('Solo administradores pueden asignar permisos de gerentes');
    }

    const { obraId } = ctx.params;
    const { gerenteId, permisos } = ctx.request.body;

    try {
      // Buscar si ya existe el registro
      const existente = await strapi.entityService.findMany(
        'api::obra-gerente-permiso.obra-gerente-permiso',
        {
          filters: {
            obra: { id: parseInt(obraId) },
            gerente: { id: parseInt(gerenteId) },
          },
        }
      );

      let resultado;
      if (existente.length > 0) {
        // Actualizar
        resultado = await strapi.entityService.update(
          'api::obra-gerente-permiso.obra-gerente-permiso',
          existente[0].id,
          {
            data: {
              partidas: permisos.partidas,
              reportes: permisos.reportes,
              personal: permisos.personal,
              valuaciones: permisos.valuaciones,
              analitica: permisos.analitica,
              inventario: permisos.inventario,
              historial: permisos.historial,
            },
          }
        );
      } else {
        // Crear nuevo
        resultado = await strapi.entityService.create(
          'api::obra-gerente-permiso.obra-gerente-permiso',
          {
            data: {
              obra: parseInt(obraId),
              gerente: parseInt(gerenteId),
              partidas: permisos.partidas,
              reportes: permisos.reportes,
              personal: permisos.personal,
              valuaciones: permisos.valuaciones,
              analitica: permisos.analitica,
              inventario: permisos.inventario,
              historial: permisos.historial,
            },
          }
        );
      }

      const obraRef = await strapi.entityService.findOne('api::obra.obra', parseInt(obraId));
      const gerenteRef = await strapi.query('plugin::users-permissions.user').findOne({ where: { id: parseInt(gerenteId) } });
      await registrarHistorial({
        obra: obraRef,
        usuario: await obtenerUsuarioDesdeToken(ctx),
        modulo: 'equipo',
        accion: 'EDITAR',
        descripcion: `Actualizó los permisos de ${gerenteRef?.username ?? 'un gerente'}`,
        cambios: { permisos: { anterior: null, nuevo: permisos } },
      });

      return ctx.send({
        message: 'Permisos guardados correctamente',
        data: resultado,
      });
    } catch (error) {
      console.error('Error guardando permisos:', error);
      ctx.throw(500, 'Error al guardar permisos');
    }
  },

  async obtenerMisPermisos(ctx) {
    const user = await obtenerUsuarioDesdeToken(ctx);
    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    const { obraId } = ctx.params;
    const defaults = {
      partidas: { read: false, create: false, update: false, delete: false },
      reportes: { read: false, create: false },
      personal: { read: false, create: false, update: false, delete: false },
      valuaciones: { read: false, create: false },
      analitica: { read: false },
      inventario: { read: false, create: false, update: false, delete: false },
      historial: { read: false },
    };

    if (user.role?.type === 'admin') {
      // Admin no tiene registro de permisos — su acceso es total por rol.
      return ctx.send({
        permisos: {
          partidas: { read: true, create: true, update: true, delete: true },
          reportes: { read: true, create: true },
          personal: { read: true, create: true, update: true, delete: true },
          valuaciones: { read: true, create: true },
          analitica: { read: true },
          inventario: { read: true, create: true, update: true, delete: true },
          historial: { read: true },
        },
      });
    }

    try {
      const permisos = await strapi.entityService.findMany(
        'api::obra-gerente-permiso.obra-gerente-permiso',
        {
          filters: {
            obra: { id: parseInt(obraId) },
            gerente: { id: user.id },
          },
        }
      );

      if (permisos.length === 0) {
        return ctx.send({ permisos: defaults });
      }

      const permiso = permisos[0];
      return ctx.send({
        permisos: {
          partidas: permiso.partidas,
          reportes: permiso.reportes,
          personal: permiso.personal,
          valuaciones: permiso.valuaciones,
          analitica: permiso.analitica,
          inventario: permiso.inventario,
          historial: permiso.historial ?? { read: false },
        },
      });
    } catch (error) {
      console.error('Error obteniendo mis permisos:', error);
      ctx.throw(500, 'Error al obtener permisos');
    }
  },

  async obtenerGerentesConPermisos(ctx) {
    if (!(await verificarAdmin(ctx))) {
      return ctx.forbidden('Solo administradores pueden ver el equipo y permisos de una obra');
    }

    const { obraId } = ctx.params;

    try {
      const obra = await strapi.entityService.findOne('api::obra.obra', obraId, {
        populate: { gerentes: { fields: GERENTE_FIELDS } },
      });

      if (!obra) {
        return ctx.notFound('Obra no encontrada');
      }

      // No usamos obra.gerente_permisos (populate del lado mappedBy): no
      // resuelve de forma confiable. Consultamos los permisos directamente,
      // igual que obtenerPermisos(), que sí refleja el valor real guardado.
      const permisosDeLaObra = await strapi.entityService.findMany(
        'api::obra-gerente-permiso.obra-gerente-permiso',
        {
          filters: { obra: { id: parseInt(obraId) } },
          populate: { gerente: { fields: ['id'] } },
        }
      );

      const gerentesConPermisos = (obra.gerentes || []).map((gerente) => {
        const permisoData = permisosDeLaObra.find(
          (p) => p.gerente?.id === gerente.id
        );

        return {
          id: gerente.id,
          username: gerente.username,
          email: gerente.email,
          permisos: permisoData
            ? {
                partidas: permisoData.partidas,
                reportes: permisoData.reportes,
                personal: permisoData.personal,
                valuaciones: permisoData.valuaciones,
                analitica: permisoData.analitica,
                inventario: permisoData.inventario,
                historial: permisoData.historial ?? { read: false },
              }
            : {
                partidas: { read: false, create: false, update: false, delete: false },
                reportes: { read: false, create: false },
                personal: { read: false, create: false, update: false, delete: false },
                valuaciones: { read: false, create: false },
                analitica: { read: false },
                inventario: { read: false, create: false, update: false, delete: false },
                historial: { read: false },
              },
        };
      });

      return ctx.send({ gerentes: gerentesConPermisos });
    } catch (error) {
      console.error('Error obteniendo gerentes con permisos:', error);
      ctx.throw(500, 'Error al obtener gerentes');
    }
  },
};
