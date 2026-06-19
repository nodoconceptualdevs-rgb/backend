module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.fechaEntregaEstimada && !data.fechaEntregaOriginal) {
      data.fechaEntregaOriginal = data.fechaEntregaEstimada;
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (!data.fechaEntregaEstimada) return;

    // En Strapi v5 entityService el ID puede venir en distintas formas
    const where = event.params.where || {};
    const id = where.id || event.params.id || event.params.entityId;
    if (!id) return;

    const existing = await strapi.entityService.findOne(
      'api::tarea-diseno.tarea-diseno',
      id,
      { fields: ['fechaEntregaOriginal'] }
    );

    if (!existing?.fechaEntregaOriginal) {
      data.fechaEntregaOriginal = data.fechaEntregaEstimada;
    }
  },
};
