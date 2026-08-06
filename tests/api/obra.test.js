const { setupStrapi, closeStrapi } = require('../helpers/strapi');

describe('Obra API - relación opcional con Proyecto y gerentes', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await closeStrapi();
  });

  it('should create an obra without a proyecto', async () => {
    const response = await strapi.request({
      method: 'POST',
      url: '/api/obras',
      auth: { bearer: 'test-token' },
      payload: {
        data: {
          nombre: 'Obra Independiente',
          estado: 'PREPARACION',
          fecha_inicio: new Date().toISOString(),
          fecha_fin_planificada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          presupuesto_total: 10000000
        }
      }
    });

    expect(response.status).toBe(201);
    expect(response.body.data.proyecto).toBeFalsy();
  });

  it('should accept an empty gerentes array on create', async () => {
    const response = await strapi.request({
      method: 'POST',
      url: '/api/obras',
      auth: { bearer: 'test-token' },
      payload: {
        data: {
          nombre: 'Obra Con Gerentes Vacíos',
          estado: 'PREPARACION',
          fecha_inicio: new Date().toISOString(),
          fecha_fin_planificada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          presupuesto_total: 1000000,
          gerentes: []
        }
      }
    });

    expect(response.status).toBe(201);
    expect(Array.isArray(response.body.data.gerentes)).toBe(true);
  });

  it('should link and then unlink a proyecto on an existing obra', async () => {
    const proyectoResponse = await strapi.request({
      method: 'POST',
      url: '/api/proyectos',
      auth: { bearer: 'test-token' },
      payload: {
        data: {
          nombre_proyecto: 'Proyecto Para Vincular',
          fecha_inicio: new Date().toISOString().split('T')[0]
        }
      }
    });
    const proyectoId = proyectoResponse.body.data.id;

    const obraResponse = await strapi.request({
      method: 'POST',
      url: '/api/obras',
      auth: { bearer: 'test-token' },
      payload: {
        data: {
          nombre: 'Obra a Vincular',
          estado: 'PREPARACION',
          fecha_inicio: new Date().toISOString(),
          fecha_fin_planificada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          presupuesto_total: 5000000
        }
      }
    });
    const obraDocumentId = obraResponse.body.data.documentId;

    const linkResponse = await strapi.request({
      method: 'PUT',
      url: `/api/obras/${obraDocumentId}`,
      auth: { bearer: 'test-token' },
      payload: { data: { proyecto: proyectoId } }
    });
    expect(linkResponse.status).toBe(200);

    const unlinkResponse = await strapi.request({
      method: 'PUT',
      url: `/api/obras/${obraDocumentId}`,
      auth: { bearer: 'test-token' },
      payload: { data: { proyecto: null } }
    });
    expect(unlinkResponse.status).toBe(200);
    expect(unlinkResponse.body.data.proyecto).toBeFalsy();
  });
});
