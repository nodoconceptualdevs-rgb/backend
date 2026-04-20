"use strict";

/**
 * Strapi Upload Provider para Bytescale
 * Reemplaza @strapi/provider-upload-cloudinary
 * Compatible con Strapi v5
 */

const { Readable } = require("stream");

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

module.exports = {
  init(config) {
    const { apiKey, accountId, folder } = config;
    const baseUrl = `https://api.bytescale.com/v2/accounts/${accountId}`;

    console.log(
      "[Bytescale Provider] Inicializado con accountId:",
      accountId,
      "folder:",
      folder,
    );

    return {
      uploadStream(file) {
        console.log(
          "[Bytescale Provider] uploadStream llamado para:",
          file.name || file.hash,
        );
        return new Promise(async (resolve, reject) => {
          try {
            let buffer;
            if (file.stream) {
              buffer = await streamToBuffer(file.stream);
            } else if (file.buffer) {
              buffer = file.buffer;
            } else {
              return reject(
                new Error("No se encontró stream ni buffer del archivo"),
              );
            }

            const filePath = folder
              ? `/${folder}/${file.hash}${file.ext}`
              : `/${file.hash}${file.ext}`;

            const uploadUrl = `${baseUrl}/uploads/binary?filePath=${encodeURIComponent(filePath)}`;

            console.log(
              "[Bytescale Provider] Subiendo a:",
              uploadUrl,
              "size:",
              buffer.length,
            );

            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": file.mime || "application/octet-stream",
              },
              body: buffer,
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                "[Bytescale Provider] Error:",
                response.status,
                errorText,
              );
              return reject(
                new Error(
                  `Bytescale upload failed (${response.status}): ${errorText}`,
                ),
              );
            }

            const result = await response.json();
            console.log(
              "[Bytescale Provider] Upload exitoso:",
              result.fileUrl || result.filePath,
            );

            file.url =
              result.fileUrl || `https://upcdn.io/${accountId}/raw${filePath}`;

            file.provider_metadata = {
              filePath: result.filePath || filePath,
              accountId: accountId,
            };

            // Generar formatos/thumbnails para imágenes
            if (file.mime && file.mime.startsWith("image/")) {
              const formats = {};
              const sizes = {
                thumbnail: 245,
                small: 500,
                medium: 750,
                large: 1000,
              };
              for (const [name, width] of Object.entries(sizes)) {
                formats[name] = {
                  url: `https://upcdn.io/${accountId}/image${filePath}?w=${width}&fit=max`,
                  width: width,
                };
              }
              file.formats = formats;
            }

            resolve();
          } catch (err) {
            console.error("[Bytescale Provider] Error en uploadStream:", err);
            reject(err);
          }
        });
      },

      upload(file) {
        console.log(
          "[Bytescale Provider] upload llamado para:",
          file.name || file.hash,
        );
        return new Promise(async (resolve, reject) => {
          try {
            let buffer;
            if (file.buffer) {
              buffer = file.buffer;
            } else if (file.stream) {
              buffer = await streamToBuffer(file.stream);
            } else if (file.path) {
              const fs = require("fs");
              buffer = fs.readFileSync(file.path);
            } else {
              return reject(
                new Error("No se encontró contenido del archivo para subir"),
              );
            }

            const filePath = folder
              ? `/${folder}/${file.hash}${file.ext}`
              : `/${file.hash}${file.ext}`;

            const uploadUrl = `${baseUrl}/uploads/binary?filePath=${encodeURIComponent(filePath)}`;

            console.log(
              "[Bytescale Provider] Subiendo a:",
              uploadUrl,
              "size:",
              buffer.length,
            );

            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": file.mime || "application/octet-stream",
              },
              body: buffer,
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                "[Bytescale Provider] Error:",
                response.status,
                errorText,
              );
              return reject(
                new Error(
                  `Bytescale upload failed (${response.status}): ${errorText}`,
                ),
              );
            }

            const result = await response.json();
            console.log(
              "[Bytescale Provider] Upload exitoso:",
              result.fileUrl || result.filePath,
            );

            file.url =
              result.fileUrl || `https://upcdn.io/${accountId}/raw${filePath}`;

            file.provider_metadata = {
              filePath: result.filePath || filePath,
              accountId: accountId,
            };

            if (file.mime && file.mime.startsWith("image/")) {
              const formats = {};
              const sizes = {
                thumbnail: 245,
                small: 500,
                medium: 750,
                large: 1000,
              };
              for (const [name, width] of Object.entries(sizes)) {
                formats[name] = {
                  url: `https://upcdn.io/${accountId}/image${filePath}?w=${width}&fit=max`,
                  width: width,
                };
              }
              file.formats = formats;
            }

            resolve();
          } catch (err) {
            console.error("[Bytescale Provider] Error en upload:", err);
            reject(err);
          }
        });
      },

      delete(file) {
        return new Promise(async (resolve, reject) => {
          try {
            let filePath;

            if (file.provider_metadata && file.provider_metadata.filePath) {
              filePath = file.provider_metadata.filePath;
            } else {
              const url = file.url;
              if (url && url.includes("upcdn.io")) {
                const match = url.match(/\/raw(\/.*)/);
                if (match) filePath = match[1];
              }
              if (!filePath) {
                filePath = folder
                  ? `/${folder}/${file.hash}${file.ext}`
                  : `/${file.hash}${file.ext}`;
              }
            }

            console.log("[Bytescale Provider] Eliminando:", filePath);

            const deleteUrl = `${baseUrl}/files?filePath=${encodeURIComponent(filePath)}`;

            const response = await fetch(deleteUrl, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            });

            if (!response.ok && response.status !== 404) {
              const errorText = await response.text();
              console.warn(
                `[Bytescale Provider] Delete warning (${response.status}): ${errorText}`,
              );
            }

            resolve();
          } catch (err) {
            console.error("[Bytescale Provider] Error en delete:", err);
            // No rechazar en delete para no bloquear operaciones
            resolve();
          }
        });
      },
    };
  },
};
