'use strict';

const CATEGORIAS_HERRAMIENTA_SEED = [
  { nombre: 'Equipo pesado' },
  { nombre: 'Mano de obra' },
  { nombre: 'Transporte' },
  { nombre: 'Medición' },
  { nombre: 'Seguridad' },
  { nombre: 'Otro' },
];

const CATEGORIAS_SEED = [
  { nombre: 'ESTRUCTURA', etiqueta: 'Estructura' },
  { nombre: 'ACABADOS', etiqueta: 'Acabados' },
  { nombre: 'INSTALACIONES', etiqueta: 'Instalaciones' },
  { nombre: 'HERRAMIENTAS', etiqueta: 'Herramientas' },
  { nombre: 'OTRO', etiqueta: 'Otro' },
];

const UNIDADES_SEED = [
  { nombre: 'bolsa', abreviatura: 'bol' },
  { nombre: 'tonelada', abreviatura: 'ton' },
  { nombre: 'm³', abreviatura: 'm³' },
  { nombre: 'm²', abreviatura: 'm²' },
  { nombre: 'm', abreviatura: 'm' },
  { nombre: 'unidad', abreviatura: 'u' },
  { nombre: 'caja', abreviatura: 'cja' },
  { nombre: 'galón', abreviatura: 'gal' },
  { nombre: 'varilla', abreviatura: 'var' },
  { nombre: 'kg', abreviatura: 'kg' },
];

async function otorgarPermisosCatalogo(strapi, uid, rolTipo = 'admin', acciones = ['find', 'findOne', 'create', 'update', 'delete']) {
  // Los content-types nuevos nacen sin permisos habilitados en ningún rol.
  // Se replican los mismos permisos que ya tienen categoria-herramienta /
  // unidad-medida para no depender de tocar el panel de Roles a mano
  // (mismo patrón que permisos-obra.js explica en su comentario).
  const rol = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: rolTipo },
  });
  if (!rol) return;

  for (const accion of acciones) {
    const action = `${uid}.${accion}`;
    const existe = await strapi.query('plugin::users-permissions.permission').findOne({
      where: { action, role: rol.id },
    });
    if (!existe) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: rol.id },
      });
    }
  }
}

async function seedCategoriasYUnidades(strapi) {
  // Solo sembrar si la tabla está vacía (primera instalación)
  const categorias = await strapi.entityService.findMany('api::categoria-material.categoria-material', {});
  if (categorias.length === 0) {
    for (const cat of CATEGORIAS_SEED) {
      await strapi.entityService.create('api::categoria-material.categoria-material', { data: cat });
    }
  }

  const unidades = await strapi.entityService.findMany('api::unidad-medida.unidad-medida', {});
  if (unidades.length === 0) {
    for (const uni of UNIDADES_SEED) {
      await strapi.entityService.create('api::unidad-medida.unidad-medida', { data: uni });
    }
  }

  const catHerramientas = await strapi.entityService.findMany('api::categoria-herramienta.categoria-herramienta', {});
  if (catHerramientas.length === 0) {
    for (const cat of CATEGORIAS_HERRAMIENTA_SEED) {
      await strapi.entityService.create('api::categoria-herramienta.categoria-herramienta', { data: cat });
    }
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await seedCategoriasYUnidades(strapi);
    await otorgarPermisosCatalogo(strapi, 'api::ubicacion-deposito.ubicacion-deposito');

    // Strapi exige permiso de "find" sobre el content-type destino de una
    // relación para poder escribirla vía la API pública (ver
    // throw-restricted-relations en @strapi/utils). "Personal" nunca tuvo
    // permisos porque siempre se accedió por rutas custom con auth:false —
    // ahora que "obra.capataz" apunta a Personal, hace falta este mínimo.
    await otorgarPermisosCatalogo(strapi, 'api::personal.personal', 'admin', ['find']);
    await otorgarPermisosCatalogo(strapi, 'api::personal.personal', 'gerente_de_proyecto', ['find']);
  },
};
