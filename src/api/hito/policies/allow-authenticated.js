'use strict';

/**
 * `allow-authenticated` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  const { state } = policyContext;

  if (!state.user) {
    return false;
  }

  return true;
};
