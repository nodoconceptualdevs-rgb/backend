'use strict';

module.exports = {
  routes: [
    { method: 'GET',    path: '/obras/:obraId/personal',            handler: 'personal-nested.getPersonal',   config: { auth: false } },
    { method: 'POST',   path: '/obras/:obraId/personal',            handler: 'personal-nested.createPersonal', config: { auth: false } },
    { method: 'PUT',    path: '/obras/:obraId/personal/:personalId', handler: 'personal-nested.updatePersonal', config: { auth: false } },
    { method: 'DELETE', path: '/obras/:obraId/personal/:personalId', handler: 'personal-nested.deletePersonal', config: { auth: false } },
  ],
};
