'use strict';

/**
 * Compara dos objetos campo por campo y arma un resumen legible + un mapa
 * estructurado de lo que cambió. Se usa para construir la descripción de
 * las entradas EDITAR del historial sin tener que escribir a mano cada
 * combinación posible de campos que pudieron cambiar.
 */
function calcularCambios(anterior, nuevo, campos) {
  const cambios = {};
  const partes = [];

  for (const { key, label, formatear } of campos) {
    const valorAnterior = anterior ? anterior[key] : undefined;
    const valorNuevo = nuevo ? nuevo[key] : undefined;

    if (JSON.stringify(valorAnterior) === JSON.stringify(valorNuevo)) continue;

    const fmt = formatear || ((v) => (v === undefined || v === null ? '—' : String(v)));
    cambios[key] = { anterior: valorAnterior ?? null, nuevo: valorNuevo ?? null };
    partes.push(`${label}: ${fmt(valorAnterior)} → ${fmt(valorNuevo)}`);
  }

  return {
    cambios: Object.keys(cambios).length ? cambios : null,
    resumen: partes.join('; '),
  };
}

/**
 * Escribe una entrada de historial. Nunca lanza: si falla, se loguea y se
 * sigue — un error de auditoría no debe poder tumbar la acción principal
 * del usuario que la disparó.
 */
async function registrarHistorial({ obra, usuario, modulo, accion, descripcion, cambios }) {
  try {
    await strapi.entityService.create('api::historial-obra.historial-obra', {
      data: {
        obra: obra?.id ?? null,
        obraNombre: obra?.nombre ?? null,
        obraIdOriginal: obra?.id ?? null,
        usuario: usuario?.id ?? null,
        usuarioNombre: usuario?.name || usuario?.username || null,
        usuarioRol: usuario?.role?.type ?? null,
        modulo,
        accion,
        descripcion,
        cambios: cambios ?? null,
      },
    });
  } catch (error) {
    console.error('[HISTORIAL] Error registrando evento:', error);
  }
}

module.exports = { registrarHistorial, calcularCambios };
