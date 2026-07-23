const http = require('http');
const { createStrapi } = require('@strapi/strapi');

let instance;
let server;
let testUserJwt;

const TEST_ADMIN_EMAIL = 'test-admin@test.local';

/**
 * Makes a raw HTTP request against the mounted Strapi Koa app.
 * Returns { status, body } where body is the parsed JSON (or raw text).
 */
function rawRequest({ method, path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const payload = body !== undefined ? JSON.stringify(body) : undefined;

    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        method,
        path,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : undefined;
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Ensures a confirmed users-permissions user with the "admin" role type
 * exists, and issues a JWT for it. This is what the `test-token` bearer maps to.
 */
async function ensureTestUser() {
  const adminRole = await instance.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'admin' } });

  if (!adminRole) {
    throw new Error('No existe un rol con type "admin" en users-permissions');
  }

  let user = await instance.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email: TEST_ADMIN_EMAIL } });

  if (!user) {
    user = await instance.db.query('plugin::users-permissions.user').create({
      data: {
        username: 'test-admin',
        email: TEST_ADMIN_EMAIL,
        name: 'Test Admin',
        provider: 'local',
        password: 'TestAdmin123!',
        confirmed: true,
        blocked: false,
        role: adminRole.id,
      },
    });
  }

  testUserJwt = instance.plugins['users-permissions'].services.jwt.issue({ id: user.id });
}

async function setupStrapi() {
  if (!instance) {
    instance = await createStrapi().load();
    instance.server.mount();
    global.strapi = instance;

    await ensureTestUser();

    server = http.createServer(instance.server.app.callback());
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    /**
     * Test request helper: strapi.request({ method, url, auth, payload }).
     * `auth: { bearer: 'test-token' }` authenticates as the test admin user.
     */
    instance.request = async ({ method, url, auth, payload }) => {
      const headers = {};
      if (auth && auth.bearer) {
        const token = auth.bearer === 'test-token' ? testUserJwt : auth.bearer;
        headers.Authorization = `Bearer ${token}`;
      }
      return rawRequest({ method, path: url, headers, body: payload });
    };
  }
  return instance;
}

async function closeStrapi() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}

module.exports = { setupStrapi, closeStrapi };
