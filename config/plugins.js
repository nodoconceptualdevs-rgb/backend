// Este middleware se ejecutará cuando ocurra cualquier error en el proceso de upload
const handleUploadError = (file) => {
  // Ignora errores específicos de borrado de archivos temporales (EPERMS)
  if (file?.error?.code === 'EPERMS' || file?.error?.code === 'ENOENT') {
    console.log('Error de permisos ignorado en archivo temporal:', file?.name);
    return true; // Devuelve true para continuar a pesar del error
  }
  return false; // Deja que otros errores sean manejados normalmente
};

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
        api_options: {
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          secure: true,
          timeout: 300000, // Aumentar timeout a 5 minutos
        },
      },
      actionOptions: {
        upload: {
          folder: env('CLOUDINARY_FOLDER', 'nodo-conceptual'),
          resource_type: 'auto', // Detecta automáticamente si es imagen, video u otro archivo
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        uploadStream: {
          folder: env('CLOUDINARY_FOLDER', 'nodo-conceptual'),
          resource_type: 'auto', // Importante para uploads por stream
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        delete: {},
      },
      // Desactivar transformaciones locales para evitar errores de archivo temporal
      sizeLimit: 100 * 1024 * 1024, // 100MB
      breakpoints: {
        large: 2000,
        medium: 1000,
        small: 500,
      },
      middleware: [handleUploadError], // Agregar el middleware de manejo de errores
    },
  },
});