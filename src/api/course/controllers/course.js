'use strict';

/**
 * course controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    // Populate optimizado para evitar traer todas las relaciones
    ctx.query = {
      ...ctx.query,
      populate: {
        cover: true,
        content_courses: {
          populate: {
            video_lesson_url: true
          },
          sort: 'order:asc',
        }
      }
    };
    
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    
    // Populate optimizado con ordenamiento de lecciones
    ctx.query = {
      ...ctx.query,
      populate: {
        cover: true,
        content_courses: {
          populate: {
            video_lesson_url: true
          },
          sort: 'order:asc',
        }
      }
    };

    const result = await super.findOne(ctx);
    
    // Manejar cuando el curso no existe
    if (!result) {
      return ctx.notFound('Course not found');
    }
    
    console.log('📚 Curso encontrado:', result.data?.id, result.data?.title);
    console.log('📝 Lecciones:', result.data?.content_courses?.length || 0);
    
    return result;
  }
}));
