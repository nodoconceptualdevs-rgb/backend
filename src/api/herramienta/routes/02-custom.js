'use strict';

module.exports = {
  routes: [
    {
      method: 'PATCH',
      path: '/herramientas/:id/estado',
      handler: 'herramienta.updateEstado',
      config: { policies: [], middlewares: [] },
    },
  ],
};
