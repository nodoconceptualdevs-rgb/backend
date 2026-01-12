'use strict';

/**
 * comment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => ({
  /**
   * Sobrescribir create para manejar relaciones correctamente
   */
  async create(ctx) {
    const { data } = ctx.request.body;
    
    console.log('📝 Comment Controller - Create');
    console.log('Request body:', JSON.stringify(ctx.request.body, null, 2));
    
    try {
      // Validar campos requeridos
      if (!data.content) {
        return ctx.badRequest('El contenido es requerido');
      }
      
      if (!data.content_course) {
        return ctx.badRequest('El content_course es requerido');
      }
      
      if (!data.user) {
        return ctx.badRequest('El usuario es requerido');
      }

      // Normalizar relaciones para Strapi v5
      const normalizedData = {
        content: data.content,
        is_admin_reply: data.is_admin_reply || false,
      };

      // Normalizar content_course
      if (typeof data.content_course === 'object' && data.content_course.id) {
        normalizedData.content_course = data.content_course.id;
      } else {
        normalizedData.content_course = data.content_course;
      }

      // Normalizar user
      if (typeof data.user === 'object' && data.user.id) {
        normalizedData.user = data.user.id;
      } else {
        normalizedData.user = data.user;
      }

      // Normalizar parent_comment solo si existe y no es 0
      if (data.parent_comment && data.parent_comment !== 0) {
        if (typeof data.parent_comment === 'object' && data.parent_comment.id) {
          normalizedData.parent_comment = data.parent_comment.id;
        } else {
          normalizedData.parent_comment = data.parent_comment;
        }
      }

      console.log('✅ Normalized data:', JSON.stringify(normalizedData, null, 2));

      // Actualizar el body con datos normalizados
      ctx.request.body.data = normalizedData;

      // Llamar al método create original
      const response = await super.create(ctx);
      
      console.log('✅ Comment created:', response.data?.id);
      
      return response;
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      throw error;
    }
  },

  /**
   * Sobrescribir find para optimizar el populate automáticamente
   * Esto evita errores 400 con populate complejo
   */
  async find(ctx) {
    // Optimizar el populate para Strapi v5
    ctx.query = {
      ...ctx.query,
      populate: {
        user: {
          fields: ['username', 'email']
        },
        replies: {
          populate: {
            user: {
              fields: ['username', 'email']
            }
          }
        },
        content_course: true
      }
    };

    // Llamar al método find original con el populate optimizado
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * Sobrescribir findOne para optimizar el populate automáticamente
   */
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        user: {
          fields: ['username', 'email']
        },
        replies: {
          populate: {
            user: {
              fields: ['username', 'email']
            }
          }
        },
        content_course: true
      }
    };

    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  }
}));
