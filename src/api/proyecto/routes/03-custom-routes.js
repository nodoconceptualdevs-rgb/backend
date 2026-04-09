module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/proyectos/:id/regenerar-token',
      handler: 'proyecto.regenerarToken',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};
