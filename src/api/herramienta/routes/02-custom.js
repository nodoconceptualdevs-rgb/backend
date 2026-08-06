'use strict';

module.exports = {
  routes: [
    {
      method: 'PATCH',
      path: '/herramientas/:id/estado',
      handler: 'herramienta.updateEstado',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PATCH',
      path: '/herramientas/:id/generar-codigo',
      handler: 'herramienta.generarCodigo',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
