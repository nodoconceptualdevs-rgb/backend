import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiBynodorestauranteBynodorestaurante
  extends Struct.SingleTypeSchema {
  collectionName: 'bynodorestaurantes';
  info: {
    displayName: 'by nodo';
    pluralName: 'bynodorestaurantes';
    singularName: 'bynodorestaurante';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::bynodorestaurante.bynodorestaurante'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    Restaurantes: Schema.Attribute.Component<
      'by-nodo-restaurantes.restaurante',
      true
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCarrouselCarrousel extends Struct.SingleTypeSchema {
  collectionName: 'carrousels';
  info: {
    displayName: 'carrousel';
    pluralName: 'carrousels';
    singularName: 'carrousel';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    contenido1: Schema.Attribute.Text;
    contenido2: Schema.Attribute.Text;
    contenido3: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    foto1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    foto2: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    foto3: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::carrousel.carrousel'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    titulo1: Schema.Attribute.String;
    titulo2: Schema.Attribute.String;
    titulo3: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaHerramientaCategoriaHerramienta
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_herramientas';
  info: {
    description: 'Categor\u00EDas para clasificar herramientas y equipos';
    displayName: 'Categor\u00EDa de Herramienta';
    pluralName: 'categoria-herramientas';
    singularName: 'categoria-herramienta';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-herramienta.categoria-herramienta'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaMaterialCategoriaMaterial
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_materiales';
  info: {
    description: 'Categor\u00EDas para clasificar materiales de construcci\u00F3n';
    displayName: 'Categor\u00EDa de Material';
    pluralName: 'categoria-materiales';
    singularName: 'categoria-material';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-material.categoria-material'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiComentarioProyectoComentarioProyecto
  extends Struct.CollectionTypeSchema {
  collectionName: 'comentarios_proyecto';
  info: {
    description: 'Comentarios y consultas de los clientes en sus proyectos';
    displayName: 'Comentario Proyecto';
    pluralName: 'comentarios-proyecto';
    singularName: 'comentario-proyecto';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    autor: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    contenido: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    es_privado: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::comentario-proyecto.comentario-proyecto'
    > &
      Schema.Attribute.Private;
    proyecto: Schema.Attribute.Relation<'manyToOne', 'api::proyecto.proyecto'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiComentarioTareaComentarioTarea
  extends Struct.CollectionTypeSchema {
  collectionName: 'comentario_tareas';
  info: {
    description: 'Comentarios asociados a tareas de dise\u00F1o';
    displayName: 'Comentario Tarea';
    pluralName: 'comentario-tareas';
    singularName: 'comentario-tarea';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    autor: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    contenido: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    es_privado: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::comentario-tarea.comentario-tarea'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    registradoEn: Schema.Attribute.DateTime;
    tarea: Schema.Attribute.Relation<
      'manyToOne',
      'api::tarea-diseno.tarea-diseno'
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCommentComment extends Struct.CollectionTypeSchema {
  collectionName: 'comments';
  info: {
    description: 'Comentarios en videos de cursos';
    displayName: 'Comentarios';
    pluralName: 'comments';
    singularName: 'comment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    content_course: Schema.Attribute.Relation<
      'manyToOne',
      'api::content-course.content-course'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    is_admin_reply: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::comment.comment'
    > &
      Schema.Attribute.Private;
    parent_comment: Schema.Attribute.Relation<
      'manyToOne',
      'api::comment.comment'
    >;
    publishedAt: Schema.Attribute.DateTime;
    replies: Schema.Attribute.Relation<'oneToMany', 'api::comment.comment'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiContentCourseContentCourse
  extends Struct.CollectionTypeSchema {
  collectionName: 'content_courses';
  info: {
    displayName: 'Contenidos';
    pluralName: 'content-courses';
    singularName: 'content-course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    comments: Schema.Attribute.Relation<'oneToMany', 'api::comment.comment'>;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    lesson_title: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::content-course.content-course'
    > &
      Schema.Attribute.Private;
    order: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    video_duration: Schema.Attribute.Integer;
    video_lesson_url: Schema.Attribute.Media<'files' | 'videos'>;
    video_url: Schema.Attribute.String;
  };
}

export interface ApiCourseCourse extends Struct.CollectionTypeSchema {
  collectionName: 'courses';
  info: {
    displayName: 'Cursos';
    pluralName: 'courses';
    singularName: 'course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content_courses: Schema.Attribute.Relation<
      'oneToMany',
      'api::content-course.content-course'
    >;
    cover: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::course.course'
    > &
      Schema.Attribute.Private;
    number_lessons: Schema.Attribute.Integer;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    transactions: Schema.Attribute.Relation<
      'oneToMany',
      'api::transaction.transaction'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFacturaCompraFacturaCompra
  extends Struct.CollectionTypeSchema {
  collectionName: 'factura_compras';
  info: {
    description: 'Facturas de compra de materiales para obras';
    displayName: 'Factura de Compra';
    pluralName: 'factura-compras';
    singularName: 'factura-compra';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    archivoPdf: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    estado: Schema.Attribute.Enumeration<['APROBADA', 'PAGADA', 'ANULADA']> &
      Schema.Attribute.DefaultTo<'APROBADA'>;
    fecha: Schema.Attribute.Date & Schema.Attribute.Required;
    fechaRecepcion: Schema.Attribute.Date;
    impuesto: Schema.Attribute.Decimal;
    inhabilitada: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'inventario.linea-factura', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::factura-compra.factura-compra'
    > &
      Schema.Attribute.Private;
    notas: Schema.Attribute.Text;
    numero: Schema.Attribute.String & Schema.Attribute.Required;
    obra: Schema.Attribute.Relation<'manyToOne', 'api::obra.obra'>;
    obraId: Schema.Attribute.Integer;
    obraNombre: Schema.Attribute.String;
    proveedor: Schema.Attribute.Relation<
      'manyToOne',
      'api::proveedor.proveedor'
    >;
    proveedorNombre: Schema.Attribute.String;
    proveedorRut: Schema.Attribute.String;
    proyectoId: Schema.Attribute.Integer;
    proyectoNombre: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    subtotal: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    total: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHerramientaHerramienta extends Struct.CollectionTypeSchema {
  collectionName: 'herramientas';
  info: {
    description: 'Herramientas y equipos de construcci\u00F3n disponibles para obras';
    displayName: 'Herramienta';
    pluralName: 'herramientas';
    singularName: 'herramienta';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cantidad: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    categoria: Schema.Attribute.String & Schema.Attribute.Required;
    codigo: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descripcion: Schema.Attribute.Text;
    estado: Schema.Attribute.Enumeration<
      ['DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'DESCARTADA']
    > &
      Schema.Attribute.DefaultTo<'DISPONIBLE'>;
    fechaAdquisicion: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::herramienta.herramienta'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    ultimoUsoFecha: Schema.Attribute.DateTime;
    ultimoUsoObraId: Schema.Attribute.Integer;
    ultimoUsoObraNombre: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHitoHito extends Struct.CollectionTypeSchema {
  collectionName: 'hitos';
  info: {
    description: 'Hitos/Etapas de un proyecto';
    displayName: 'Hito';
    pluralName: 'hitos';
    singularName: 'hito';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    contenido: Schema.Attribute.Component<'proyecto.contenido-hito', false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    estado_completado: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    fecha_actualizacion: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::hito.hito'> &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    orden: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    proyecto: Schema.Attribute.Relation<'manyToOne', 'api::proyecto.proyecto'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMaterialCatalogoMaterialCatalogo
  extends Struct.CollectionTypeSchema {
  collectionName: 'material_catalogos';
  info: {
    description: 'Cat\u00E1logo de materiales de construcci\u00F3n con control de stock';
    displayName: 'Material Cat\u00E1logo';
    pluralName: 'material-catalogos';
    singularName: 'material-catalogo';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    categoria: Schema.Attribute.String & Schema.Attribute.Required;
    codigo: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    historialPrecios: Schema.Attribute.Component<
      'inventario.historial-precio',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::material-catalogo.material-catalogo'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    obraId: Schema.Attribute.Integer;
    obraNombre: Schema.Attribute.String;
    precioPromedio: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    proyectoId: Schema.Attribute.Integer;
    proyectoNombre: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    stockActual: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    stockMinimo: Schema.Attribute.Decimal;
    ultimaCompra: Schema.Attribute.DateTime;
    unidad: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMediaTagMediaTag extends Struct.CollectionTypeSchema {
  collectionName: 'media_tags';
  info: {
    description: 'Tags para organizar archivos de la media library';
    displayName: 'Media Tag';
    pluralName: 'media-tags';
    singularName: 'media-tag';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::media-tag.media-tag'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiObraObra extends Struct.CollectionTypeSchema {
  collectionName: 'obras';
  info: {
    displayName: 'Obra';
    pluralName: 'obras';
    singularName: 'obra';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    estado: Schema.Attribute.Enumeration<
      ['PREPARACION', 'EN_CURSO', 'PAUSADA', 'COMPLETADA']
    > &
      Schema.Attribute.DefaultTo<'PREPARACION'>;
    fecha_fin_planificada: Schema.Attribute.DateTime &
      Schema.Attribute.Required;
    fecha_fin_real: Schema.Attribute.DateTime;
    fecha_inicio: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::obra.obra'> &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    notas: Schema.Attribute.Text;
    presupuesto_consumido: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<0>;
    presupuesto_total: Schema.Attribute.Decimal & Schema.Attribute.Required;
    proyecto: Schema.Attribute.Relation<'manyToOne', 'api::proyecto.proyecto'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartidaPrecioHistorialPartidaPrecioHistorial
  extends Struct.CollectionTypeSchema {
  collectionName: 'partida_precio_historialsv';
  info: {
    description: 'Immutable price history for partidas';
    displayName: 'Partida Precio Historial';
    pluralName: 'partida-precio-historialsv';
    singularName: 'partida-precio-historial';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fecha_fin: Schema.Attribute.DateTime;
    fecha_inicio: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partida-precio-historial.partida-precio-historial'
    > &
      Schema.Attribute.Private;
    partida: Schema.Attribute.Relation<'manyToOne', 'api::partida.partida'>;
    precio: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartidaPartida extends Struct.CollectionTypeSchema {
  collectionName: 'partidas';
  info: {
    description: 'Budget line items for construction works';
    displayName: 'Partida';
    pluralName: 'partidas';
    singularName: 'partida';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avancePorcentaje: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    cantidadEjecutada: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    cantidadPresupuestada: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    codigo: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descripcion: Schema.Attribute.Text & Schema.Attribute.Required;
    esExtra: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    historial_precios: Schema.Attribute.Relation<
      'oneToMany',
      'api::partida-precio-historial.partida-precio-historial'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partida.partida'
    > &
      Schema.Attribute.Private;
    montoEjecutado: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    montoPresupuestado: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    obra: Schema.Attribute.Relation<'manyToOne', 'api::obra.obra'>;
    partidaOriginalId: Schema.Attribute.Integer;
    precioUnitario: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    unidad: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPersonalPersonal extends Struct.CollectionTypeSchema {
  collectionName: 'personals';
  info: {
    displayName: 'Personal';
    pluralName: 'personals';
    singularName: 'personal';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cargo: Schema.Attribute.String & Schema.Attribute.Required;
    costoPorHora: Schema.Attribute.Decimal & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::personal.personal'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    obra: Schema.Attribute.Relation<'manyToOne', 'api::obra.obra'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProveedorProveedor extends Struct.CollectionTypeSchema {
  collectionName: 'proveedores';
  info: {
    description: 'Proveedores de materiales y servicios para obras';
    displayName: 'Proveedor';
    pluralName: 'proveedores';
    singularName: 'proveedor';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activo: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    contacto: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::proveedor.proveedor'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    notas: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    rut: Schema.Attribute.String;
    telefono: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProyectoProyecto extends Struct.CollectionTypeSchema {
  collectionName: 'proyectos';
  info: {
    description: 'Proyectos de construcci\u00F3n y remodelaci\u00F3n';
    displayName: 'Proyecto';
    pluralName: 'proyectos';
    singularName: 'proyecto';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    biblioteca: Schema.Attribute.Media<'images' | 'files' | 'videos', true>;
    clientes: Schema.Attribute.Relation<
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    comentarios: Schema.Attribute.Relation<
      'oneToMany',
      'api::comentario-proyecto.comentario-proyecto'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    es_publico: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    estado_general: Schema.Attribute.Enumeration<
      ['En Planificaci\u00F3n', 'En Ejecuci\u00F3n', 'Completado']
    > &
      Schema.Attribute.DefaultTo<'En Planificaci\u00F3n'>;
    fecha_inicio: Schema.Attribute.Date & Schema.Attribute.Required;
    gerentes: Schema.Attribute.Relation<
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    hitos: Schema.Attribute.Relation<'oneToMany', 'api::hito.hito'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::proyecto.proyecto'
    > &
      Schema.Attribute.Private;
    nombre_proyecto: Schema.Attribute.String & Schema.Attribute.Required;
    obras: Schema.Attribute.Relation<'oneToMany', 'api::obra.obra'>;
    publishedAt: Schema.Attribute.DateTime;
    token_nfc: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    ultimo_avance: Schema.Attribute.Text;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRechazoTareaRechazoTarea
  extends Struct.CollectionTypeSchema {
  collectionName: 'rechazo_tareas';
  info: {
    description: 'Registro de rechazos y retrabajos en tareas';
    displayName: 'Rechazo Tarea';
    pluralName: 'rechazo-tareas';
    singularName: 'rechazo-tarea';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    categoria: Schema.Attribute.Enumeration<
      ['BRIEF_POCO_CLARO', 'NO_CUMPLE_EXPECTATIVAS', 'OTRO']
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::rechazo-tarea.rechazo-tarea'
    > &
      Schema.Attribute.Private;
    motivo: Schema.Attribute.Text & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    registradoEn: Schema.Attribute.DateTime;
    tarea: Schema.Attribute.Relation<
      'manyToOne',
      'api::tarea-diseno.tarea-diseno'
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiReporteReporte extends Struct.CollectionTypeSchema {
  collectionName: 'reportes';
  info: {
    displayName: 'Reporte Diario';
    pluralName: 'reportes';
    singularName: 'reporte';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avanceLogrado: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    costoManoObra: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    costoMateriales: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    costoTotal: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fecha: Schema.Attribute.Date & Schema.Attribute.Required;
    imagenes: Schema.Attribute.Media<undefined, true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::reporte.reporte'
    > &
      Schema.Attribute.Private;
    materiales: Schema.Attribute.JSON;
    montoAplicado: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    obra: Schema.Attribute.Relation<'manyToOne', 'api::obra.obra'>;
    obraNombre: Schema.Attribute.String;
    observaciones: Schema.Attribute.Text;
    partida: Schema.Attribute.Relation<'manyToOne', 'api::partida.partida'>;
    partidaCodigo: Schema.Attribute.String;
    partidaDescripcion: Schema.Attribute.Text;
    personal: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    valuacionId: Schema.Attribute.Integer;
  };
}

export interface ApiReprogramacionTareaReprogramacionTarea
  extends Struct.CollectionTypeSchema {
  collectionName: 'reprogramacion_tareas';
  info: {
    description: 'Registro de cambios en fechas de entrega de tareas';
    displayName: 'Reprogramacion Tarea';
    pluralName: 'reprogramacion-tareas';
    singularName: 'reprogramacion-tarea';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fechaAnterior: Schema.Attribute.DateTime;
    fechaNueva: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::reprogramacion-tarea.reprogramacion-tarea'
    > &
      Schema.Attribute.Private;
    motivo: Schema.Attribute.Text & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    registradoEn: Schema.Attribute.DateTime;
    tarea: Schema.Attribute.Relation<
      'manyToOne',
      'api::tarea-diseno.tarea-diseno'
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiResenaResena extends Struct.SingleTypeSchema {
  collectionName: 'resenas';
  info: {
    displayName: 'rese\u00F1as';
    pluralName: 'resenas';
    singularName: 'resena';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    comentarios: Schema.Attribute.Component<'info-clientes.cliente', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::resena.resena'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiServicioServicio extends Struct.SingleTypeSchema {
  collectionName: 'servicios';
  info: {
    displayName: 'servicios';
    pluralName: 'servicios';
    singularName: 'servicio';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    icono1: Schema.Attribute.Media<'images' | 'files'>;
    icono2: Schema.Attribute.Media<'images' | 'files'>;
    icono3: Schema.Attribute.Media<'images' | 'files'>;
    icono4: Schema.Attribute.Media<'images' | 'files', true>;
    imagen1: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    imagen2: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    imagen3: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagen4: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::servicio.servicio'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    titulo1: Schema.Attribute.String;
    titulo2: Schema.Attribute.String;
    titulo3: Schema.Attribute.String;
    Titulo4: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTareaDisenoTareaDiseno extends Struct.CollectionTypeSchema {
  collectionName: 'tareas_diseno';
  info: {
    description: 'Tareas de dise\u00F1o para KPI y productividad';
    displayName: 'Tarea Dise\u00F1o';
    pluralName: 'tareas-diseno';
    singularName: 'tarea-diseno';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    archivos: Schema.Attribute.Media<undefined, true>;
    arquitectos: Schema.Attribute.Relation<
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    cliente: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    comentarios: Schema.Attribute.Relation<
      'oneToMany',
      'api::comentario-tarea.comentario-tarea'
    >;
    contadorRechazos: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descripcion: Schema.Attribute.Text;
    estado: Schema.Attribute.Enumeration<
      ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'PENDIENTE'>;
    fechaCompletacion: Schema.Attribute.DateTime;
    fechaEntregaEstimada: Schema.Attribute.DateTime;
    fechaEntregaOriginal: Schema.Attribute.DateTime;
    fechaInicio: Schema.Attribute.DateTime;
    fechaRequerimiento: Schema.Attribute.DateTime;
    hito: Schema.Attribute.Relation<'manyToOne', 'api::hito.hito'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::tarea-diseno.tarea-diseno'
    > &
      Schema.Attribute.Private;
    notasInternas: Schema.Attribute.Text;
    orden: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    proyecto: Schema.Attribute.Relation<'manyToOne', 'api::proyecto.proyecto'>;
    publicacion: Schema.Attribute.Component<'kpi.publicacion-hito', false>;
    publishedAt: Schema.Attribute.DateTime;
    rechazos: Schema.Attribute.Relation<
      'oneToMany',
      'api::rechazo-tarea.rechazo-tarea'
    >;
    reprogramaciones: Schema.Attribute.Relation<
      'oneToMany',
      'api::reprogramacion-tarea.reprogramacion-tarea'
    >;
    tipo: Schema.Attribute.Enumeration<['CLIENTE', 'INDEPENDIENTE']> &
      Schema.Attribute.Required;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTrabajadoreTrabajadore extends Struct.SingleTypeSchema {
  collectionName: 'trabajadores';
  info: {
    displayName: 'trabajadores';
    pluralName: 'trabajadores';
    singularName: 'trabajadore';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::trabajadore.trabajadore'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    trabajadores: Schema.Attribute.Component<
      'info-trabajador.trabajador',
      true
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTrabajosrealizadoTrabajosrealizado
  extends Struct.SingleTypeSchema {
  collectionName: 'trabajosrealizados';
  info: {
    displayName: 'trabajos realizados';
    pluralName: 'trabajosrealizados';
    singularName: 'trabajosrealizado';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::trabajosrealizado.trabajosrealizado'
    > &
      Schema.Attribute.Private;
    proyectos: Schema.Attribute.Component<'info-proyectos.item', true>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTransactionTransaction extends Struct.CollectionTypeSchema {
  collectionName: 'transactions';
  info: {
    displayName: 'Transacciones';
    pluralName: 'transactions';
    singularName: 'transaction';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::transaction.transaction'
    > &
      Schema.Attribute.Private;
    payment_method: Schema.Attribute.Enumeration<
      ['Paypal', 'Stripe', 'Pago movil']
    >;
    publishedAt: Schema.Attribute.DateTime;
    purchase_date: Schema.Attribute.Date & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUnidadMedidaUnidadMedida
  extends Struct.CollectionTypeSchema {
  collectionName: 'unidad_medidas';
  info: {
    description: 'Unidades de medida para materiales de construcci\u00F3n';
    displayName: 'Unidad de Medida';
    pluralName: 'unidad-medidas';
    singularName: 'unidad-medida';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    abreviatura: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::unidad-medida.unidad-medida'
    > &
      Schema.Attribute.Private;
    nombre: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiValuacionValuacion extends Struct.CollectionTypeSchema {
  collectionName: 'valuaciones';
  info: {
    displayName: 'Valuacion';
    pluralName: 'valuaciones';
    singularName: 'valuacion';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    costoManoObra: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    costoMateriales: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    costoTotal: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fecha: Schema.Attribute.Date & Schema.Attribute.Required;
    lineas: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::valuacion.valuacion'
    > &
      Schema.Attribute.Private;
    notas: Schema.Attribute.Text;
    numero: Schema.Attribute.Integer & Schema.Attribute.Required;
    obra: Schema.Attribute.Relation<'manyToOne', 'api::obra.obra'>;
    presupuestoModificado: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    totalAumentos: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    totalDisminuciones: Schema.Attribute.Decimal &
      Schema.Attribute.DefaultTo<0>;
    totalEjecutado: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    totalExtras: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    totalPresupuesto: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    proyectos_como_cliente: Schema.Attribute.Relation<
      'manyToMany',
      'api::proyecto.proyecto'
    >;
    proyectos_como_gerente: Schema.Attribute.Relation<
      'manyToMany',
      'api::proyecto.proyecto'
    >;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    tareas_como_arquitecto: Schema.Attribute.Relation<
      'manyToMany',
      'api::tarea-diseno.tarea-diseno'
    >;
    tareas_como_cliente: Schema.Attribute.Relation<
      'oneToMany',
      'api::tarea-diseno.tarea-diseno'
    >;
    transactions: Schema.Attribute.Relation<
      'oneToMany',
      'api::transaction.transaction'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::bynodorestaurante.bynodorestaurante': ApiBynodorestauranteBynodorestaurante;
      'api::carrousel.carrousel': ApiCarrouselCarrousel;
      'api::categoria-herramienta.categoria-herramienta': ApiCategoriaHerramientaCategoriaHerramienta;
      'api::categoria-material.categoria-material': ApiCategoriaMaterialCategoriaMaterial;
      'api::comentario-proyecto.comentario-proyecto': ApiComentarioProyectoComentarioProyecto;
      'api::comentario-tarea.comentario-tarea': ApiComentarioTareaComentarioTarea;
      'api::comment.comment': ApiCommentComment;
      'api::content-course.content-course': ApiContentCourseContentCourse;
      'api::course.course': ApiCourseCourse;
      'api::factura-compra.factura-compra': ApiFacturaCompraFacturaCompra;
      'api::herramienta.herramienta': ApiHerramientaHerramienta;
      'api::hito.hito': ApiHitoHito;
      'api::material-catalogo.material-catalogo': ApiMaterialCatalogoMaterialCatalogo;
      'api::media-tag.media-tag': ApiMediaTagMediaTag;
      'api::obra.obra': ApiObraObra;
      'api::partida-precio-historial.partida-precio-historial': ApiPartidaPrecioHistorialPartidaPrecioHistorial;
      'api::partida.partida': ApiPartidaPartida;
      'api::personal.personal': ApiPersonalPersonal;
      'api::proveedor.proveedor': ApiProveedorProveedor;
      'api::proyecto.proyecto': ApiProyectoProyecto;
      'api::rechazo-tarea.rechazo-tarea': ApiRechazoTareaRechazoTarea;
      'api::reporte.reporte': ApiReporteReporte;
      'api::reprogramacion-tarea.reprogramacion-tarea': ApiReprogramacionTareaReprogramacionTarea;
      'api::resena.resena': ApiResenaResena;
      'api::servicio.servicio': ApiServicioServicio;
      'api::tarea-diseno.tarea-diseno': ApiTareaDisenoTareaDiseno;
      'api::trabajadore.trabajadore': ApiTrabajadoreTrabajadore;
      'api::trabajosrealizado.trabajosrealizado': ApiTrabajosrealizadoTrabajosrealizado;
      'api::transaction.transaction': ApiTransactionTransaction;
      'api::unidad-medida.unidad-medida': ApiUnidadMedidaUnidadMedida;
      'api::valuacion.valuacion': ApiValuacionValuacion;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
