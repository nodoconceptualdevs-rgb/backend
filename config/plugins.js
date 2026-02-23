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
      settings: {
        autoRotate: true, 
      },
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
          // Permitir formatos 3D y CAD específicos
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 
                           'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
                           'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
                           'glb', 'gltf', 'fbx', 'obj', 'dae', '3ds', 'blend',
                           'dwg', 'dxf', 'skp', 'step', 'stp', 'iges', 'igs',
                           'zip', 'rar', '7z', 'tar', 'gz'],
        },
        uploadStream: {
          folder: env('CLOUDINARY_FOLDER', 'nodo-conceptual'),
          resource_type: 'auto', // Importante para uploads por stream
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          // Permitir formatos 3D y CAD específicos
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 
                           'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
                           'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
                           'glb', 'gltf', 'fbx', 'obj', 'dae', '3ds', 'blend',
                           'dwg', 'dxf', 'skp', 'step', 'stp', 'iges', 'igs',
                           'zip', 'rar', '7z', 'tar', 'gz'],
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
      // Agregar formatos 3D y CAD permitidos
      allowedTypes: [
        'images',
        'videos',
        'files'
      ],
      // Extenciones específicas permitidas
      allowedExtensions: [
        // Imágenes
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos  
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
        // Documentos
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        // 3D Models
        '.glb', '.gltf', '.fbx', '.obj', '.dae', '.3ds', '.blend',
        // AutoCAD/SketchUp
        '.dwg', '.dxf', '.skp', '.step', '.stp', '.iges', '.igs',
        // Archivos comprimidos
        '.zip', '.rar', '.7z', '.tar', '.gz'
      ],
      middleware: [handleUploadError], // Agregar el middleware de manejo de errores
    },
  },
});