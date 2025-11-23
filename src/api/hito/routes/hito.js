const { createCoreRouter } = require('@strapi/strapi').factories;

// Rutas CRUD con políticas de seguridad
// La validación de acceso también se maneja en el controller
module.exports = createCoreRouter('api::hito.hito');
