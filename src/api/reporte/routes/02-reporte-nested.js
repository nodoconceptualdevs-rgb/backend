module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/obras/:obraId/reportes',
      handler: 'reporte-nested.getReportes',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/obras/:obraId/reportes',
      handler: 'reporte-nested.createReporte',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/obras/:obraId/reportes/:reporteId',
      handler: 'reporte-nested.deleteReporte',
      config: { auth: false },
    },
  ],
};
