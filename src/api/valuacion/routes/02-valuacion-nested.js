'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/valuaciones',
      handler: 'valuacion-nested.getValuaciones',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/obras/:obraId/valuaciones',
      handler: 'valuacion-nested.createValuacion',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/obras/:obraId/valuaciones/:valuacionId',
      handler: 'valuacion-nested.deleteValuacion',
      config: { auth: false },
    },
  ],
};
