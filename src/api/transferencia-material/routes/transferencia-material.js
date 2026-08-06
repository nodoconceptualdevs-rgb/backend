'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/transferencias-material',
      handler: 'transferencia-material.crear',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/obras/:obraId/transferencias',
      handler: 'transferencia-material.obtenerPorObra',
      config: { auth: false },
    },
  ],
};
