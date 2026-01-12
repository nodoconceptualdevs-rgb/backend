/**
 * Policy: isHitoManager
 * Verifica que el usuario autenticado sea el gerente del proyecto del hito o admin
 */

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const hitoId = policyContext.params.id;

  // Si no hay usuario autenticado, denegar
  if (!user) {
    return false;
  }

  // Admin puede acceder a todo
  if (user.role.type === 'admin') {
    return true;
  }

  // Si no hay hitoId (ej: en create), permitir (validar en controller)
  if (!hitoId) {
    return true;
  }

  try {
    // Buscar el hito y su proyecto
    const hito = await strapi.db.query('api::hito.hito').findOne({
      where: { id: hitoId },
      populate: {
        proyecto: {
          populate: ['gerentes']
        }
      }
    });

    if (!hito || !hito.proyecto) {
      return false;
    }

    // Permitir si es uno de los gerentes del proyecto
    return hito.proyecto.gerentes?.some(g => g.id === user.id) || false;
  } catch (error) {
    console.error('Error en policy isHitoManager:', error);
    return false;
  }
};
