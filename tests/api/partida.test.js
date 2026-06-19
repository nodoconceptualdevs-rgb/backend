const { setupStrapi, closeStrapi } = require('../helpers/strapi');

describe('Partida API', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await closeStrapi();
  });

  describe('POST /api/partidas', () => {
    it('should create a partida and auto-generate price history', async () => {
      const response = await strapi.request({
        method: 'POST',
        url: '/api/partidas',
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '01.01',
            descripcion: 'Excavación',
            precio_actual: 80000,
            es_extra: false
          }
        }
      });

      expect(response.status).toBe(201);
      expect(response.body.data.codigo).toBe('01.01');
      expect(response.body.data.precio_actual).toBe(80000);

      // Verify history record was created
      const historialResponse = await strapi.request({
        method: 'GET',
        url: `/api/partida-precio-historialsv?filters[partida][id][$eq]=${response.body.data.id}`,
        auth: { bearer: 'test-token' }
      });

      expect(historialResponse.body.data.length).toBe(1);
      expect(historialResponse.body.data[0].precio).toBe(80000);
      expect(historialResponse.body.data[0].fecha_fin).toBeNull();
    });
  });

  describe('PUT /api/partidas/:id/precio', () => {
    let partidaId;

    beforeEach(async () => {
      const response = await strapi.request({
        method: 'POST',
        url: '/api/partidas',
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '01.02',
            descripcion: 'Estructura',
            precio_actual: 120000,
            es_extra: false
          }
        }
      });
      partidaId = response.body.data.id;
    });

    it('should update precio and close old history record', async () => {
      const response = await strapi.request({
        method: 'PUT',
        url: `/api/partidas/${partidaId}/precio`,
        auth: { bearer: 'test-token' },
        payload: {
          precio_nuevo: 150000
        }
      });

      expect(response.status).toBe(200);
      expect(response.body.data.precio_actual).toBe(150000);

      // Verify old history record is closed
      const historialResponse = await strapi.request({
        method: 'GET',
        url: `/api/partida-precio-historialsv?filters[partida][id][$eq]=${partidaId}`,
        auth: { bearer: 'test-token' }
      });

      expect(historialResponse.body.data.length).toBe(2);
      expect(historialResponse.body.data[0].fecha_fin).not.toBeNull();
      expect(historialResponse.body.data[1].precio).toBe(150000);
      expect(historialResponse.body.data[1].fecha_fin).toBeNull();
    });

    it('should reject invalid precio values', async () => {
      const response = await strapi.request({
        method: 'PUT',
        url: `/api/partidas/${partidaId}/precio`,
        auth: { bearer: 'test-token' },
        payload: {
          precio_nuevo: -100
        }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/partida-precio-historialsv?filters[partida][id]=X', () => {
    let partidaId;

    beforeEach(async () => {
      const response = await strapi.request({
        method: 'POST',
        url: '/api/partidas',
        auth: { bearer: 'test-token' },
        payload: {
          data: {
            codigo: '01.03',
            descripcion: 'Muros',
            precio_actual: 40000,
            es_extra: false
          }
        }
      });
      partidaId = response.body.data.id;

      // Update price twice
      await strapi.request({
        method: 'PUT',
        url: `/api/partidas/${partidaId}/precio`,
        auth: { bearer: 'test-token' },
        payload: { precio_nuevo: 45000 }
      });

      await strapi.request({
        method: 'PUT',
        url: `/api/partidas/${partidaId}/precio`,
        auth: { bearer: 'test-token' },
        payload: { precio_nuevo: 50000 }
      });
    });

    it('should return complete price history with dates', async () => {
      const response = await strapi.request({
        method: 'GET',
        url: `/api/partida-precio-historialsv?filters[partida][id][$eq]=${partidaId}`,
        auth: { bearer: 'test-token' }
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0].precio).toBe(40000);
      expect(response.body.data[1].precio).toBe(45000);
      expect(response.body.data[2].precio).toBe(50000);
      expect(response.body.data[2].fecha_fin).toBeNull();
    });
  });
});
