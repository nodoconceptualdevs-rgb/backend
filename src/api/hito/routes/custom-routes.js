module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/hitos/reordenar',
      handler: 'hito.reordenar',
      config: {
        policies: ['api::hito.allow-authenticated'],
      },
    },
  ],
};
