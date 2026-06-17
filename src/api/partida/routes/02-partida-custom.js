module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/partidas/:id/precio',
      handler: 'partida.updatePrecio',
      config: {
        policies: []
      }
    }
  ]
};
