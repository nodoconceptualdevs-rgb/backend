'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/partidas/:partidaId/historial-precios',
      handler: 'partida-precio-historial.findByPartida',
      config: { auth: false },
    },
  ],
};
