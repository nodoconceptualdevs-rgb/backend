module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
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
      // Permitir cualquier origen para solucionar problemas de CORS
      origin: ['*'],
      // Permitir todos los headers necesarios, incluyendo Authorization
      headers: [
        'Content-Type', 
        'Authorization', 
        'Origin', 
        'Accept',
        'User-Agent',
        'Cache-Control',
        'X-Requested-With'
      ],
      // Permitir todos los métodos HTTP comunes
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      keepHeaderOnError: true,
      // Configuración para permitir credenciales
      credentials: false,
      // Exponer estos headers para que el cliente pueda leerlos
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
      // Permitir preflight caching por 24 horas
      maxAge: 86400,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];