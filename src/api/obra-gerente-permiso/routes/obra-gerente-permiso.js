'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/gerente-permisos/:gerenteId',
      handler: 'obra-gerente-permiso.obtenerPermisos',
      config: {
        // auth: false porque el rol "Authenticated" de Strapi nunca tuvo
        // este permiso habilitado en el panel; la autenticación se verifica
        // a mano en el controller (mismo patrón que proyecto.js::authNFC).
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/obras/:obraId/gerente-permisos',
      handler: 'obra-gerente-permiso.guardarPermisos',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/obras/:obraId/mis-permisos',
      handler: 'obra-gerente-permiso.obtenerMisPermisos',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/obras/:obraId/gerentes-con-permisos',
      handler: 'obra-gerente-permiso.obtenerGerentesConPermisos',
      config: {
        auth: false,
      },
    },
  ],
};
