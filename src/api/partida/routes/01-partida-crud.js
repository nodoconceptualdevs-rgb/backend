'use strict';

module.exports = {
  routes: [
    { method: 'GET',    path: '/partidas',     handler: 'partida.find',    config: { auth: false } },
    { method: 'GET',    path: '/partidas/:id', handler: 'partida.findOne', config: { auth: false } },
    { method: 'POST',   path: '/partidas',     handler: 'partida.create',  config: { auth: false } },
    { method: 'PUT',    path: '/partidas/:id', handler: 'partida.update',  config: { auth: false } },
    { method: 'DELETE', path: '/partidas/:id', handler: 'partida.delete',  config: { auth: false } },
  ],
};
