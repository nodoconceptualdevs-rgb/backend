module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/partidas',
      handler: 'partida-nested.getPartidas',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/obras/:obraId/partidas',
      handler: 'partida-nested.createPartida',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.getPartida',
      config: { auth: false }
    },
    {
      method: 'PUT',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.updatePartida',
      config: { auth: false }
    },
    {
      method: 'DELETE',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.deletePartida',
      config: { auth: false }
    }
  ]
};
