const config = {
  locales: [
     'es',
  ],
  tutorials: false,
  notifications: {
    releases: false,
  },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
