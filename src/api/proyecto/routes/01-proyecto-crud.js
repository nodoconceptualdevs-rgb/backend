const { createCoreRouter } = require('@strapi/strapi').factories;

// Rutas CRUD estándar con policies de seguridad
module.exports = createCoreRouter('api::proyecto.proyecto', {
  config: {
    update: {
      policies: ['api::proyecto.is-project-manager']
    },
    delete: {
      policies: ['api::proyecto.is-project-manager']
    }
  }
});
