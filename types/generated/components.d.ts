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
    Render: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.SetPluginOptions<{
        upload: {
          allowedExtensions: [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.webp',
            '.svg',
            '.mp4',
            '.avi',
            '.mov',
            '.wmv',
            '.flv',
            '.webm',
            '.mkv',
            '.glb',
            '.gltf',
            '.fbx',
            '.obj',
            '.dae',
            '.3ds',
            '.blend',
            '.dwg',
            '.dxf',
            '.skp',
            '.step',
            '.stp',
            '.iges',
            '.igs',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
            '.zip',
            '.rar',
            '.7z',
            '.tar',
            '.gz',
          ];
        };
      }>;
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
    documentacion: Schema.Attribute.Media<'files' | 'images' | 'videos', true> &
      Schema.Attribute.SetPluginOptions<{
        upload: {
          allowedExtensions: [
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
            '.glb',
            '.gltf',
            '.fbx',
            '.obj',
            '.dae',
            '.3ds',
            '.blend',
            '.dwg',
            '.dxf',
            '.skp',
            '.step',
            '.stp',
            '.iges',
            '.igs',
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.webp',
            '.svg',
            '.mp4',
            '.avi',
            '.mov',
            '.wmv',
            '.flv',
            '.webm',
            '.mkv',
            '.zip',
            '.rar',
            '.7z',
            '.tar',
            '.gz',
          ];
        };
      }>;
    enlace_tour_360: Schema.Attribute.String;
    galeria_fotos: Schema.Attribute.Media<'images' | 'files' | 'videos', true> &
      Schema.Attribute.SetPluginOptions<{
        upload: {
          allowedExtensions: [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.webp',
            '.svg',
            '.mp4',
            '.avi',
            '.mov',
            '.wmv',
            '.flv',
            '.webm',
            '.mkv',
            '.glb',
            '.gltf',
            '.fbx',
            '.obj',
            '.dae',
            '.3ds',
            '.blend',
            '.dwg',
            '.dxf',
            '.skp',
            '.step',
            '.stp',
            '.iges',
            '.igs',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
            '.zip',
            '.rar',
            '.7z',
            '.tar',
            '.gz',
          ];
        };
      }>;
    videos_walkthrough: Schema.Attribute.Media<
      'videos' | 'files' | 'images',
      true
    > &
      Schema.Attribute.SetPluginOptions<{
        upload: {
          allowedExtensions: [
            '.mp4',
            '.avi',
            '.mov',
            '.wmv',
            '.flv',
            '.webm',
            '.mkv',
            '.glb',
            '.gltf',
            '.fbx',
            '.obj',
            '.dae',
            '.3ds',
            '.blend',
            '.dwg',
            '.dxf',
            '.skp',
            '.step',
            '.stp',
            '.iges',
            '.igs',
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.webp',
            '.svg',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
            '.zip',
            '.rar',
            '.7z',
            '.tar',
            '.gz',
          ];
        };
      }>;
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
