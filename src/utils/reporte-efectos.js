'use strict';

// Efectos secundarios que un reporte diario aplica al registrarse, y que hay
// que revertir exactamente igual (con delta negativo) al eliminarlo — ya sea
// de forma individual o en cascada al eliminar la valuación que lo agrupa.

// Ajusta el progreso de una partida (cantidadEjecutada/montoEjecutado/avancePorcentaje)
// aplicando un delta en $ — positivo al registrar/aumentar un reporte, negativo al
// eliminarlo o revertir su monto anterior antes de aplicar uno nuevo (edición).
async function ajustarPartidaPorMonto(partidaId, deltaMonto) {
  if (!partidaId || !deltaMonto) return null;
  const partida = await strapi.entityService.findOne('api::partida.partida', partidaId);
  if (!partida) return null;

  const precioUnit = partida.precioUnitario || 0;
  const deltaCantidad = precioUnit > 0 ? deltaMonto / precioUnit : 0;
  const cantidadPresupuestada = partida.cantidadPresupuestada || 0;
  const nuevaCantidad = Math.min(
    Math.max((partida.cantidadEjecutada || 0) + deltaCantidad, 0),
    cantidadPresupuestada
  );
  const nuevoMonto = nuevaCantidad * precioUnit;
  const nuevoAvance = cantidadPresupuestada > 0
    ? Math.min((nuevaCantidad / cantidadPresupuestada) * 100, 100)
    : 0;

  return strapi.entityService.update('api::partida.partida', partidaId, {
    data: {
      cantidadEjecutada: nuevaCantidad,
      montoEjecutado: nuevoMonto,
      avancePorcentaje: nuevoAvance,
    },
  });
}

// Ajusta obra.presupuesto_consumido aplicando un delta (positivo o negativo).
async function ajustarPresupuestoConsumido(obraId, deltaCosto) {
  if (!obraId || !deltaCosto) return;
  const obra = await strapi.entityService.findOne('api::obra.obra', obraId);
  if (!obra) return;
  const nuevo = Math.max((obra.presupuesto_consumido || 0) + deltaCosto, 0);
  await strapi.entityService.update('api::obra.obra', obraId, {
    data: { presupuesto_consumido: nuevo },
  });
}

// Revierte por completo los efectos de un reporte (partida + presupuesto de obra)
// sin borrarlo — el llamador decide si además lo elimina.
async function revertirEfectosReporte(obraId, reporte) {
  if (reporte.partida?.id) {
    await ajustarPartidaPorMonto(reporte.partida.id, -(reporte.montoAplicado || 0));
  }
  await ajustarPresupuestoConsumido(obraId, -(reporte.costoTotal || 0));
}

module.exports = { ajustarPartidaPorMonto, ajustarPresupuestoConsumido, revertirEfectosReporte };
