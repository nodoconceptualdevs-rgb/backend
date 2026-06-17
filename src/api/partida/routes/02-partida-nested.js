module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/partidas',
      handler: 'partida-nested.getPartidas',
      config: {
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/obras/:obraId/partidas',
      handler: 'partida-nested.createPartida',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.getPartida',
      config: {
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.updatePartida',
      config: {
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/obras/:obraId/partidas/:partidaId',
      handler: 'partida-nested.deletePartida',
      config: {
        policies: []
      }
    }
  ]
};
