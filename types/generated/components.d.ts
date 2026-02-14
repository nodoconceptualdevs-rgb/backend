import type { Schema, Struct } from '@strapi/strapi';

export interface ByNodoRestaurantesRestaurante extends Struct.ComponentSchema {
  collectionName: 'components_by_nodo_restaurantes_restaurantes';
  info: {
    displayName: 'Restaurante';
    icon: 'archive';
  };
  attributes: {
    Descripcion: Schema.Attribute.Text;
    Direccion: Schema.Attribute.String;
    Fotos_Restaurante: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    Horarios: Schema.Attribute.String;
    Instagram: Schema.Attribute.String;
    Nombre_Restaurante: Schema.Attribute.String;
    Num_Contacto: Schema.Attribute.String;
  };
}

export interface InfoClientesCliente extends Struct.ComponentSchema {
  collectionName: 'components_info_clientes_clientes';
  info: {
    displayName: 'cliente';
    icon: 'archive';
  };
  attributes: {
    Comentario: Schema.Attribute.String;
    Empresa: Schema.Attribute.String;
    Nombre: Schema.Attribute.String;
  };
}

export interface InfoProyectosItem extends Struct.ComponentSchema {
  collectionName: 'components_info_proyectos_items';
  info: {
    displayName: 'Proyecto';
    icon: 'archive';
  };
  attributes: {
    Descripcion: Schema.Attribute.Text;
    Render: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subtitulo: Schema.Attribute.String;
    Titulo: Schema.Attribute.String;
  };
}

export interface InfoTrabajadorTrabajador extends Struct.ComponentSchema {
  collectionName: 'components_info_trabajador_trabajadors';
  info: {
    displayName: 'Trabajador';
    icon: 'emotionHappy';
  };
  attributes: {
    Foto: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Nombre: Schema.Attribute.String;
    Puesto: Schema.Attribute.String;
  };
}

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
      'by-nodo-restaurantes.restaurante': ByNodoRestaurantesRestaurante;
      'info-clientes.cliente': InfoClientesCliente;
      'info-proyectos.item': InfoProyectosItem;
      'info-trabajador.trabajador': InfoTrabajadorTrabajador;
      'proyecto.contenido-hito': ProyectoContenidoHito;
    }
  }
}
