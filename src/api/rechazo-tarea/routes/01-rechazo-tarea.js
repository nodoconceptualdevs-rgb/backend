module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/rechazo-tareas',
      handler: 'rechazo-tarea.find',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/rechazo-tareas/:id',
      handler: 'rechazo-tarea.findOne',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/rechazo-tareas',
      handler: 'rechazo-tarea.create',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
