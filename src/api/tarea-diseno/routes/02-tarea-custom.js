module.exports = {
  routes: [
    {
      method: 'PATCH',
      path: '/tareas-diseno/:id/estado',
      handler: 'tarea-diseno.updateEstado',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/tareas-diseno/reordenar',
      handler: 'tarea-diseno.reordenar',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
