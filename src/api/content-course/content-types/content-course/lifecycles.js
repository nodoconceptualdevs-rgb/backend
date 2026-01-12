/**
 * Extrae el courseId de la estructura de Strapi v5
 * Maneja: { set: [{id}] }, { connect: [{id}] }, {id}, o ID directo
 */
function extractCourseId(courseData) {
  if (!courseData) return null;
  
  if (typeof courseData === 'object') {
    // Strapi v5: { set: [ { id: X } ] }
    if (courseData.set && Array.isArray(courseData.set) && courseData.set.length > 0) {
      return courseData.set[0].id || courseData.set[0];
    }
    // Strapi v5: { connect: [ { id: X } ] }
    if (courseData.connect && Array.isArray(courseData.connect) && courseData.connect.length > 0) {
      return courseData.connect[0].id || courseData.connect[0];
    }
    // Objeto con id directo
    if (courseData.id) {
      return courseData.id;
    }
  }
  
  // ID simple numérico
  return courseData;
}

module.exports = {
  /**
   * Calcula el orden automáticamente antes de crear la lección
   */
  async beforeCreate(event) {
    const { params } = event;
    
    console.log('🔍 beforeCreate - Iniciando...');
    console.log('📦 params.data completo:', JSON.stringify(params.data, null, 2));
    console.log('🎯 course value:', params.data.course);
    console.log('🎯 course type:', typeof params.data.course);
    
    // Si no se especificó orden, calcularlo automáticamente
    if (!params.data.order && params.data.course) {
      const courseId = extractCourseId(params.data.course);
      
      console.log('🔍 beforeCreate - CourseId extraído:', courseId, 'Tipo:', typeof courseId);
      
      if (!courseId) {
        console.error('❌ No se pudo extraer courseId de:', JSON.stringify(params.data.course));
        params.data.order = 1;
        return;
      }
      
      try {
        // Obtener todas las lecciones del curso ordenadas por orden descendente
        const lessons = await strapi.entityService.findMany('api::content-course.content-course', {
          filters: { course: courseId },
          sort: { order: 'desc' },
          limit: 1,
        });
        
        // Asignar el siguiente número de orden
        const lastOrder = lessons && lessons.length > 0 ? lessons[0].order : 0;
        params.data.order = lastOrder + 1;
        
        console.log(`✅ Orden automático asignado: ${params.data.order} para lección "${params.data.lesson_title}"`);
      } catch (error) {
        console.error('❌ Error en beforeCreate al calcular orden:', error);
        // Asignar orden 1 por defecto si hay error
        params.data.order = 1;
      }
    }
  },

  /**
   * Actualiza el contador de lecciones del curso cuando se crea una lección
   */
  async afterCreate(event) {
    const { result, params } = event;
    
    console.log('🔍 afterCreate - Lección creada');
    console.log('📦 result.id:', result?.id);
    console.log('🎯 result.course:', result?.course);
    console.log('🎯 params.data.course:', params?.data?.course);
    
    // Intentar obtener courseId de múltiples fuentes
    let courseId = null;
    
    // 1. Desde result.course (cuando ya está poblado)
    if (result?.course) {
      if (typeof result.course === 'object' && result.course.id) {
        courseId = result.course.id;
        console.log('✅ CourseId extraído de result.course.id:', courseId);
      } else if (typeof result.course === 'number') {
        courseId = result.course;
        console.log('✅ CourseId extraído de result.course:', courseId);
      }
    }
    
    // 2. Si no, desde params.data.course (formato connect o directo)
    if (!courseId && params?.data?.course) {
      courseId = extractCourseId(params.data.course);
      console.log('✅ CourseId extraído de params.data.course:', courseId);
    }
    
    // 3. Si aún no lo tenemos, buscar la lección recién creada con populate
    if (!courseId && result?.id) {
      try {
        console.log('🔍 Buscando lección con populate para obtener courseId...');
        const lesson = await strapi.entityService.findOne('api::content-course.content-course', result.id, {
          populate: ['course']
        });
        if (lesson?.course) {
          courseId = typeof lesson.course === 'object' ? lesson.course.id : lesson.course;
          console.log('✅ CourseId obtenido de populate:', courseId);
        }
      } catch (error) {
        console.error('❌ Error al buscar lección con populate:', error);
      }
    }
    
    console.log('🔍 afterCreate - courseId FINAL extraído:', courseId);
    
    if (courseId) {
      try {
        await updateCourseLessonCount(courseId);
      } catch (error) {
        console.error('❌ Error en afterCreate al actualizar contador:', error);
      }
    } else {
      console.error('❌ No se pudo obtener courseId en afterCreate después de todos los intentos');
      console.error('❌ result completo:', JSON.stringify(result, null, 2));
      console.error('❌ params completo:', JSON.stringify(params, null, 2));
    }
  },

  /**
   * Actualiza el contador de lecciones del curso cuando se elimina una lección
   */
  async afterDelete(event) {
    const { result } = event;
    
    if (result && result.course) {
      await updateCourseLessonCount(result.course);
    }
  },

  /**
   * Actualiza el contador si se mueve una lección de un curso a otro
   */
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Si se cambió el curso al que pertenece la lección
    const oldCourse = params?.data?.course;
    const newCourse = result?.course;
    
    if (oldCourse && newCourse && oldCourse !== newCourse) {
      // Actualizar ambos cursos
      await updateCourseLessonCount(oldCourse);
      await updateCourseLessonCount(newCourse);
    } else if (newCourse) {
      // Solo actualizar el curso actual
      await updateCourseLessonCount(newCourse);
    }
  },
};

/**
 * Cuenta las lecciones activas (no eliminadas) y actualiza el campo number_lessons del curso
 */
async function updateCourseLessonCount(courseData) {
  try {
    // Extraer el ID del curso usando la función auxiliar
    const id = extractCourseId(courseData);
    
    if (!id) {
      console.error('❌ updateCourseLessonCount - No se pudo extraer courseId de:', courseData);
      return;
    }
    
    console.log('🔍 updateCourseLessonCount - Iniciando para curso:', id);
    
    // Obtener todas las lecciones del curso (sin filtrar por publishedAt para evitar el error de binding)
    const lessons = await strapi.entityService.findMany('api::content-course.content-course', {
      filters: {
        course: id,
      },
    });

    console.log('🔍 updateCourseLessonCount - Lecciones encontradas:', lessons?.length || 0);

    // Filtrar manualmente las lecciones publicadas (no soft-deleted)
    const publishedLessons = Array.isArray(lessons) 
      ? lessons.filter(lesson => lesson.publishedAt !== null && lesson.publishedAt !== undefined)
      : [];
    
    const count = publishedLessons.length;

    console.log('🔍 updateCourseLessonCount - Lecciones publicadas:', count);

    // Actualizar el curso con el nuevo contador
    await strapi.entityService.update('api::course.course', id, {
      data: {
        number_lessons: count,
      },
    });

    console.log(`✅ Curso ${id}: actualizado a ${count} lecciones`);
  } catch (error) {
    console.error('❌ Error actualizando contador de lecciones:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}
