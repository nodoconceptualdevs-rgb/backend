const { setupStrapi, closeStrapi } = require('../helpers/strapi');

describe('Partida Nested Routes (by Obra)', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await closeStrapi();
  });

  let obraId;

  beforeEach(async () => {
    // Create test obra first
    const obraResponse = await strapi.request({
      method: 'POST',
      url: '/api/obras',
      auth: { bearer: 'test-token' },
      payload: {
        data: {
          nombre: 'Test Obra',
          estado: 'PREPARACION',
          fecha_inicio: new Date().toISOString(),
          fecha_fin_planificada: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          presupuesto_total: 50000000
        }
      }
    });
    obraId = obraResponse.body.data.id;
  });

  describe('GET /obras/:obraId/partidas', () => {
    it('should retrieve all partidas for an obra', async () => {
      // Create 2 partidas
      await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '01.01',
            descripcion: 'Excavación',
            unidad: 'm³',
            cantidadPresupuestada: 100,
            precioUnitario: 80000
          }
        }
      });

      await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '01.02',
            descripcion: 'Estructura',
            unidad: 'ton',
            cantidadPresupuestada: 50,
            precioUnitario: 120000
          }
        }
      });

      const response = await strapi.request({
        method: 'GET',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' }
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].codigo).toBe('01.01');
    });
  });

  describe('POST /obras/:obraId/partidas', () => {
    it('should create a partida and link to obra', async () => {
      const response = await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '02.01',
            descripcion: 'Mampostería',
            unidad: 'm²',
            cantidadPresupuestada: 200,
            precioUnitario: 40000,
            esExtra: false
          }
        }
      });

      expect(response.status).toBe(201);
      expect(response.body.data.codigo).toBe('02.01');
      expect(response.body.data.montoPresupuestado).toBe(8000000);
      expect(response.body.data.obra).toBe(obraId);
    });

    it('should reject negative prices', async () => {
      const response = await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '02.02',
            descripcion: 'Invalid',
            unidad: 'ud',
            cantidadPresupuestada: 10,
            precioUnitario: -5000
          }
        }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /obras/:obraId/partidas/:partidaId', () => {
    it('should update a partida', async () => {
      // Create partida
      const createResponse = await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '03.01',
            descripcion: 'Original',
            unidad: 'ud',
            cantidadPresupuestada: 10,
            precioUnitario: 5000
          }
        }
      });
      const partidaId = createResponse.body.data.id;

      // Update
      const updateResponse = await strapi.request({
        method: 'PUT',
        url: `/api/obras/${obraId}/partidas/${partidaId}`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            descripcion: 'Updated',
            precioUnitario: 6000
          }
        }
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.descripcion).toBe('Updated');
      expect(updateResponse.body.data.montoPresupuestado).toBe(60000);
    });
  });

  describe('DELETE /obras/:obraId/partidas/:partidaId', () => {
    it('should delete a partida', async () => {
      // Create partida
      const createResponse = await strapi.request({
        method: 'POST',
        url: `/api/obras/${obraId}/partidas`,
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '04.01',
            descripcion: 'To Delete',
            unidad: 'ud',
            cantidadPresupuestada: 5,
            precioUnitario: 1000
          }
        }
      });
      const partidaId = createResponse.body.data.id;

      // Delete
      const deleteResponse = await strapi.request({
        method: 'DELETE',
        url: `/api/obras/${obraId}/partidas/${partidaId}`,
        auth: { bearer: 'test-token' }
      });

      expect(deleteResponse.status).toBe(200);

      // Verify deleted
      const getResponse = await strapi.request({
        method: 'GET',
        url: `/api/obras/${obraId}/partidas/${partidaId}`,
        auth: { bearer: 'test-token' }
      });

      expect(getResponse.status).toBe(404);
    });
  });
});
