import type { Schema, Struct } from '@strapi/strapi';

export interface ProyectoContenidoHito extends Struct.ComponentSchema {
  collectionName: 'components_proyecto_contenido_hitos';
  info: {
    description: 'Contenido multimedia y documentaci\u00F3n de un hito del proyecto';
    displayName: 'Contenido Hito';
  };
  attributes: {
    descripcion_avance: Schema.Attribute.RichText;
    documentacion: Schema.Attribute.Media<'files', true>;
    enlace_tour_360: Schema.Attribute.String;
    galeria_fotos: Schema.Attribute.Media<'images', true>;
    videos_walkthrough: Schema.Attribute.Media<'videos', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'proyecto.contenido-hito': ProyectoContenidoHito;
    }
  }
}
