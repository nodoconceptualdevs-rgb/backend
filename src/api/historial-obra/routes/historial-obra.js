'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/historial',
      handler: 'historial-obra.obtenerHistorialObra',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/historial',
      handler: 'historial-obra.obtenerHistorialGlobal',
      config: {
        auth: false,
      },
    },
  ],
};
