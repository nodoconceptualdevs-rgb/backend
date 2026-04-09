/**
 * Policy: isProjectManager
 * Verifica que el usuario autenticado sea el gerente del proyecto o admin
 */

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const projectId = policyContext.params.id;

  // Si no hay usuario autenticado, denegar
  if (!user) {
    return false;
  }

  // Admin puede acceder a todo
  if (user.role.type === 'admin') {
    return true;
  }

  // Si no hay projectId (ej: en find), permitir (el controller filtra después)
  if (!projectId) {
    return true;
  }

  try {
    // Verificar si es gerente del proyecto
    const proyecto = await strapi.db.query('api::proyecto.proyecto').findOne({
      where: { id: projectId },
      populate: ['gerentes']
    });

    if (!proyecto) {
      return false;
    }

    // Permitir si es uno de los gerentes asignados
    return proyecto.gerentes?.some(g => g.id === user.id) || false;
  } catch (error) {
    console.error('Error en policy isProjectManager:', error);
    return false;
  }
};
