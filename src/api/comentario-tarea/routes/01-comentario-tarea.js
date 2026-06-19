module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/comentario-tareas',
      handler: 'comentario-tarea.find',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/comentario-tareas/:id',
      handler: 'comentario-tarea.findOne',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/comentario-tareas',
      handler: 'comentario-tarea.create',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/comentario-tareas/:id',
      handler: 'comentario-tarea.delete',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
