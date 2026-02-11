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
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'https://frontend-o5rz-bsjlu9raw-nods-projects-c8b01123.vercel.app',
        'https://frontend-o5rz.vercel.app',
      ],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'Cache-Control', 'X-Requested-With', 'User-Agent'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      keepHeaderOnError: true,
      credentials: true,
      // Configuración explícita para cookies en producción
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Set-Cookie'],
      maxAge: 31536000, // 1 año en segundos
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
