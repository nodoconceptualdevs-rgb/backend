module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/email-auth/forgot-password',
      handler: 'email-auth.forgotPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/email-auth/reset-password',
      handler: 'email-auth.resetPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/email-auth/admin-create-user',
      handler: 'email-auth.adminCreateUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/email-auth/admin-reset-password',
      handler: 'email-auth.adminResetPassword',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/email-auth/send-confirmation',
      handler: 'email-auth.sendConfirmation',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/email-auth/confirm-email',
      handler: 'email-auth.confirmEmail',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
