module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tareas-diseno',
      handler: 'tarea-diseno.find',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/tareas-diseno/:id',
      handler: 'tarea-diseno.findOne',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/tareas-diseno',
      handler: 'tarea-diseno.create',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/tareas-diseno/:id',
      handler: 'tarea-diseno.update',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/tareas-diseno/:id',
      handler: 'tarea-diseno.delete',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
