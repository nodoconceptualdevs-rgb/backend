'use strict';

/**
 * content-course controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::content-course.content-course', ({ strapi }) => ({
  /**
   * Sobrescribir el método create para asegurar que la relación con el curso se establezca
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      console.log('🎯 Controller create - Request body completo:', JSON.stringify(ctx.request.body, null, 2));
      
      // Asegurar que el courseId/documentId esté presente
      if (!data.course) {
        console.error('❌ Error: No se proporcionó courseId o documentId');
        return ctx.badRequest('El curso es requerido para crear una lección');
      }
      
      // Extraer el identificador del curso (puede ser ID numérico, documentId o objeto)
      let courseIdentifier = typeof data.course === 'object' ? data.course.id : data.course;
      
      console.log('📌 Identificador del curso recibido:', courseIdentifier, 'Tipo:', typeof courseIdentifier);
      
      // Buscar el curso (puede ser por ID numérico o documentId)
      console.log('🔍 Buscando curso...');
      
      let courseExists;
      try {
        // Si es un número, buscar por ID
        if (typeof courseIdentifier === 'number' || !isNaN(Number(courseIdentifier))) {
          courseExists = await strapi.entityService.findOne('api::course.course', Number(courseIdentifier));
        }
        
        // Si no se encontró por ID o es un string, intentar buscar por documentId
        if (!courseExists && typeof courseIdentifier === 'string') {
          console.log('🔍 Buscando por documentId:', courseIdentifier);
          try {
            // En Strapi v5, podemos buscar directamente usando el documentId en findOne
            courseExists = await strapi.documents('api::course.course').findOne({
              documentId: courseIdentifier
            });
            if (courseExists) {
              console.log('✅ Curso encontrado por documentId - ID real:', courseExists.id);
            }
          } catch (docError) {
            console.error('❌ Error buscando por documentId:', docError.message);
            // Si falla, intentar con query directa a la base de datos
            const result = await strapi.db.query('api::course.course').findOne({
              where: { documentId: courseIdentifier }
            });
            if (result) {
              courseExists = result;
              console.log('✅ Curso encontrado por documentId (query) - ID real:', courseExists.id);
            }
          }
        }
      } catch (findError) {
        console.error('❌ Error al buscar curso:', findError.message);
        return ctx.badRequest(`Error al buscar el curso con identificador ${courseIdentifier}. Verifica que sea correcto.`);
      }
      
      if (!courseExists) {
        console.error(`❌ Curso con identificador ${courseIdentifier} no encontrado en la base de datos`);
        return ctx.badRequest(`El curso con identificador ${courseIdentifier} no existe. Por favor, verifica el identificador del curso.`);
      }
      
      console.log('✅ Curso validado - ID:', courseExists.id, 'documentId:', courseExists.documentId, 'título:', courseExists.title);
      
      // Usar el ID numérico real del curso para la relación
      const realCourseId = courseExists.id;
      
      // Normalizar la relación al formato que Strapi v5 espera
      ctx.request.body.data.course = {
        connect: [{ id: realCourseId }]
      };
      console.log('🔧 Relación normalizada a formato Strapi v5 con ID real:', ctx.request.body.data.course);
      
      // Crear la lección con la relación explícita
      console.log('🚀 Creando lección...');
      const response = await super.create(ctx);
      
      console.log('✅ Lección creada exitosamente:', response.data?.id);
      
      return response;
    } catch (error) {
      console.error('❌ ERROR FATAL en create:', error);
      console.error('📋 Stack trace:', error.stack);
      return ctx.badRequest(error.message || 'Error al crear la lección');
    }
  },
  
  /**
   * Sobrescribir el método update para mantener la relación con el curso
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    console.log('🎯 Controller update - ID:', id, 'Data:', JSON.stringify(data, null, 2));
    
    // Si se está cambiando el curso, validar que exista
    if (data.course) {
      const courseExists = await strapi.entityService.findOne('api::course.course', data.course);
      if (!courseExists) {
        return ctx.badRequest(`El curso con ID ${data.course} no existe`);
      }
      console.log('✅ Curso validado:', courseExists.id, courseExists.title);
    }
    
    const response = await super.update(ctx);
    
    console.log('✅ Lección actualizada:', response.data?.id);
    
    return response;
  },
}));
