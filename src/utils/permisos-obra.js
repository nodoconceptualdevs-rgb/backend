'use strict';

const { verify } = require('jsonwebtoken');

/**
 * Decodifica y verifica el JWT del header Authorization a mano (estas rutas
 * usan auth: false porque el rol "Authenticated" de Strapi nunca tuvo estas
 * acciones habilitadas en el panel de administración). Mismo patrón que
 * proyecto.js::authNFC y obra-gerente-permiso.js::verificarAdmin.
 */
async function obtenerUsuarioDesdeToken(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'));
    const userId = typeof decoded === 'object' ? decoded.id : undefined;
    if (!userId) return null;

    return await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
      populate: ['role'],
    });
  } catch (error) {
    return null;
  }
}

/**
 * Exige rol admin, sin contexto de obra. Para rutas legacy/sueltas que el
 * frontend no usa y no tienen una obra específica asociada de forma directa.
 */
async function requiereAdmin(ctx) {
  const user = await obtenerUsuarioDesdeToken(ctx);
  if (!user) {
    ctx.unauthorized('Debes estar autenticado');
    return null;
  }
  if (user.role?.type !== 'admin') {
    ctx.forbidden('Solo administradores pueden realizar esta acción');
    return null;
  }
  return user;
}

/**
 * Exige que el usuario autenticado pueda hacer `operacion` sobre `modulo`
 * en la obra `obraId`. Admin siempre puede. Gerente necesita estar asignado
 * a la obra (obra.gerentes) Y tener ese permiso puntual en su registro
 * obra-gerente-permiso (si no tiene registro, se trata como todo-falso,
 * mismo default que ya usa el frontend).
 */
async function requierePermisoObra(ctx, obraId, modulo, operacion) {
  const user = await obtenerUsuarioDesdeToken(ctx);
  if (!user) {
    ctx.unauthorized('Debes estar autenticado');
    return null;
  }

  if (user.role?.type === 'admin') return user;

  if (user.role?.type !== 'gerente_de_proyecto') {
    ctx.forbidden('No tienes permiso para realizar esta acción');
    return null;
  }

  const obraIdNum = parseInt(obraId);
  if (!obraIdNum) {
    ctx.badRequest('obraId inválido');
    return null;
  }

  const obra = await strapi.entityService.findOne('api::obra.obra', obraIdNum, {
    populate: { gerentes: { fields: ['id'] } },
  });
  const esGerenteDeEstaObra = Boolean(
    obra && (obra.gerentes || []).some((g) => g.id === user.id)
  );
  if (!esGerenteDeEstaObra) {
    ctx.forbidden('No tienes acceso a esta obra');
    return null;
  }

  const permisos = await strapi.entityService.findMany(
    'api::obra-gerente-permiso.obra-gerente-permiso',
    { filters: { obra: { id: obraIdNum }, gerente: { id: user.id } } }
  );
  const permiso = permisos[0];
  const permitido = Boolean(permiso && permiso[modulo] && permiso[modulo][operacion]);

  if (!permitido) {
    ctx.forbidden(`No tienes permiso de "${operacion}" en "${modulo}" para esta obra`);
    return null;
  }

  return user;
}

module.exports = { requierePermisoObra, requiereAdmin, obtenerUsuarioDesdeToken };
