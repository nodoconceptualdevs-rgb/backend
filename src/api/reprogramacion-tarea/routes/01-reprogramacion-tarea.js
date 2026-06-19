module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/reprogramacion-tareas',
      handler: 'reprogramacion-tarea.find',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/reprogramacion-tareas/:id',
      handler: 'reprogramacion-tarea.findOne',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/reprogramacion-tareas',
      handler: 'reprogramacion-tarea.create',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
