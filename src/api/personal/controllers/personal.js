'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { requiereAdmin } = require('../../../utils/permisos-obra');

module.exports = createCoreController('api::personal.personal', ({ strapi }) => ({
  async find(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.findOne(ctx);
  },

  async create(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.create(ctx);
  },

  async update(ctx) {
    if (!(await requiereAdmin(ctx))) return;
    return super.update(ctx);
  },
}));
