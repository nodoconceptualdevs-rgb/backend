// Este middleware se ejecutará cuando ocurra cualquier error en el proceso de upload

const handleUploadError = (file) => {
  // Ignora errores específicos de borrado de archivos temporales (EPERMS)

  if (file?.error?.code === "EPERMS" || file?.error?.code === "ENOENT") {
    console.log("Error de permisos ignorado en archivo temporal:", file?.name);

    return true; // Devuelve true para continuar a pesar del error
  }

  return false; // Deja que otros errores sean manejados normalmente
};

module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "@strapi/provider-email-sendgrid",

      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },

      settings: {
        defaultFrom: env(
          "SENDGRID_DEFAULT_FROM",
          "nodoconceptualdevs@gmail.com",
        ),

        defaultReplyTo: env(
          "SENDGRID_DEFAULT_REPLY_TO",
          "nodoconceptualdevs@gmail.com",
        ),
      },
    },
  },

  upload: {
    config: {
      settings: {
        autoRotate: true,
      },

      provider: require.resolve(
        "../src/extensions/upload/strapi-provider-upload-bytescale",
      ),

      providerOptions: {
        apiKey: env("BYTESCALE_SECRET_KEY"),

        accountId: env("BYTESCALE_ACCOUNT_ID"),

        folder: env("BYTESCALE_FOLDER", "nodo-conceptual"),
      },

      actionOptions: {
        upload: {},

        uploadStream: {},

        delete: {},
      },

      // Límite de 100MB
      sizeLimit: 100 * 1024 * 1024,

      breakpoints: {
        large: 2000,

        medium: 1000,

        small: 500,
      },

      allowedTypes: ["images", "videos", "files"],

      // Extensiones específicas permitidas

      allowedExtensions: [
        // Imágenes

        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".svg",

        // Videos

        ".mp4",
        ".avi",
        ".mov",
        ".wmv",
        ".flv",
        ".webm",
        ".mkv",

        // Documentos

        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",

        // 3D Models

        ".glb",
        ".gltf",
        ".fbx",
        ".obj",
        ".dae",
        ".3ds",
        ".blend",

        // AutoCAD/SketchUp

        ".dwg",
        ".dxf",
        ".skp",
        ".step",
        ".stp",
        ".iges",
        ".igs",

        // Archivos comprimidos

        ".zip",
        ".rar",
        ".7z",
        ".tar",
        ".gz",
      ],

      middleware: [handleUploadError],
    },
  },
});
