'use strict';

module.exports = {
  routes: [
    { method: 'GET',  path: '/personals',     handler: 'personal.find',    config: { auth: false } },
    { method: 'GET',  path: '/personals/:id', handler: 'personal.findOne', config: { auth: false } },
    { method: 'POST', path: '/personals',     handler: 'personal.create',  config: { auth: false } },
    { method: 'PUT',  path: '/personals/:id', handler: 'personal.update',  config: { auth: false } },
  ],
};
