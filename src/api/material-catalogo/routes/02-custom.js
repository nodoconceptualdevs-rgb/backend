'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/material-catalogos/:id/decrementar',
      handler: 'material-catalogo.decrementar',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PATCH',
      path: '/material-catalogos/:id/generar-codigo',
      handler: 'material-catalogo.generarCodigo',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
