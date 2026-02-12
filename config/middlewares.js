module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: false,  // Desactivar valores predeterminados restrictivos
        directives: {
          'default-src': ["*", "'unsafe-inline'", "'unsafe-eval'"],
          'connect-src': ["*", "'unsafe-inline'"],
          'img-src': ["*", 'data:', 'blob:'],
          'media-src': ["*", 'data:', 'blob:'],
          'script-src': ["*", "'unsafe-inline'", "'unsafe-eval'"],
          'style-src': ["*", "'unsafe-inline'"],
          upgradeInsecureRequests: null,
        },
      },
      // Rate limiting configurado para 100 requests por minuto
      rateLimits: {
        enabled: true,
        interval: { min: 1 }, // Ventana de 1 minuto
        max: 100, // Máximo 100 requests por minuto
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      // Configuración CORS más permisiva para solucionar problemas persistentes
      origin: ['*'],  // Permitir cualquier origen temporalmente para diagnóstico
      // Headers permitidos (ampliados)
      headers: ['*'],  // Permitir cualquier header
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      keepHeaderOnError: true,
      // Importante: false para evitar problemas de cookies entre dominios
      credentials: false,
      exposeHeaders: ['*'],  // Exponer todos los headers
      maxAge: 31536000, // 1 año en segundos
      // Añadir preflight success siempre
      preflightContinue: false,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];