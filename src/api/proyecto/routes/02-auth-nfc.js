module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/proyectos/auth-nfc',
      handler: 'proyecto.authNFC',
      config: {
        auth: false, // Público, se autentica con token NFC
        policies: [],
        middlewares: [],
      }
    }
  ]
};
