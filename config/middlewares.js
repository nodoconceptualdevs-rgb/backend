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
      // Configuración específica para el dominio de producción y desarrollo
      origin: [
        'https://frontend-o5rz.vercel.app',
        'http://localhost:3000',
        'https://*.vercel.app'
      ],
      // Permitir todos los headers necesarios, incluyendo Authorization
      headers: [
        '*',
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
      // Desactivar credenciales para evitar problemas con preflight
      credentials: false,
      // Exponer estos headers para que el cliente pueda leerlos
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
      // Permitir preflight caching por 24 horas
      maxAge: 86400,
      // Asegurar que los headers CORS se envían en todas las respuestas
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