'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

module.exports = {
  /**
   * POST /api/email-auth/forgot-password
   * Envía un email con link para restablecer contraseña
   */
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email es requerido');
    }

    try {
      // Buscar usuario por email
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // No revelar si el usuario existe o no (seguridad)
        return ctx.send({
          ok: true,
          message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
        });
      }

      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Guardar token en el usuario
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken },
      });

      const frontendUrl = strapi.config.get('server.frontendUrl', process.env.FRONTEND_URL || 'http://localhost:3000');
      const resetLink = `${frontendUrl}/restablecer-contrasena?code=${resetToken}`;

      // Enviar email
      await strapi.plugins['email'].services.email.send({
        to: user.email,
        subject: 'Restablecer tu contraseña - Conceptual Nodo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; font-size: 24px;">Conceptual Nodo</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Restablecer contraseña</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hola <strong>${user.name || user.username}</strong>,
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #f5b940; color: #222; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">
              Si no solicitaste este cambio, puedes ignorar este correo. El enlace expira en 1 hora.
            </p>
            <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      });

      console.log(`[EMAIL] Reset password enviado a: ${user.email}`);

      return ctx.send({
        ok: true,
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
      });
    } catch (error) {
      console.error('[ERROR] forgot-password:', error);
      ctx.throw(500, 'Error procesando la solicitud');
    }
  },

  /**
   * POST /api/email-auth/reset-password
   * Restablece la contraseña usando el token
   */
  async resetPassword(ctx) {
    const { code, password, passwordConfirmation } = ctx.request.body;

    if (!code || !password) {
      return ctx.badRequest('Código y contraseña son requeridos');
    }

    if (password !== passwordConfirmation) {
      return ctx.badRequest('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return ctx.badRequest('La contraseña debe tener al menos 6 caracteres');
    }

    try {
      // Buscar usuario con el token
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { resetPasswordToken: code },
      });

      if (!user) {
        return ctx.badRequest('Token inválido o expirado');
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Actualizar contraseña y limpiar token
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
        },
      });

      console.log(`[EMAIL] Contraseña restablecida para: ${user.email}`);

      return ctx.send({
        ok: true,
        message: 'Contraseña restablecida exitosamente.',
      });
    } catch (error) {
      console.error('[ERROR] reset-password:', error);
      ctx.throw(500, 'Error restableciendo la contraseña');
    }
  },

  /**
   * POST /api/email-auth/admin-create-user
   * Admin crea usuario y envía credenciales por email
   */
  async adminCreateUser(ctx) {
    const adminUser = ctx.state.user;

    if (!adminUser || adminUser.role.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden usar esta función');
    }

    const { username, email, name, role, sendEmail } = ctx.request.body;

    if (!username || !email || !role) {
      return ctx.badRequest('Username, email y rol son requeridos');
    }

    try {
      // Generar contraseña temporal
      const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10);

      // Crear usuario confirmado directamente
      const newUser = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username,
          email: email.toLowerCase(),
          name: name || username,
          password: await bcrypt.hash(tempPassword, 10),
          role,
          confirmed: true,
          blocked: false,
          provider: 'local',
        },
      });

      // Enviar email con credenciales si se solicita
      if (sendEmail !== false) {
        const frontendUrl = strapi.config.get('server.frontendUrl', process.env.FRONTEND_URL || 'http://localhost:3000');

        await strapi.plugins['email'].services.email.send({
          to: newUser.email,
          subject: 'Bienvenido a Conceptual Nodo - Tus credenciales de acceso',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px;">Conceptual Nodo</h1>
              </div>
              <h2 style="color: #333; font-size: 20px;">Bienvenido/a</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Hola <strong>${name || username}</strong>,
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Se ha creado una cuenta para ti en Conceptual Nodo. A continuación tus credenciales de acceso:
              </p>
              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 8px 0; font-size: 15px;"><strong>Email:</strong> ${newUser.email}</p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Contraseña temporal:</strong> ${tempPassword}</p>
              </div>
              <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">
                Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/login" 
                   style="background-color: #f5b940; color: #222; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Iniciar sesión
                </a>
              </div>
              <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          `,
        });

        console.log(`[EMAIL] Credenciales enviadas a: ${newUser.email}`);
      }

      // Obtener usuario con rol poblado
      const userWithRole = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: newUser.id },
        populate: ['role'],
      });

      return ctx.send({
        data: userWithRole,
        message: sendEmail !== false ? 'Usuario creado y credenciales enviadas por email' : 'Usuario creado exitosamente',
      });
    } catch (error) {
      console.error('[ERROR] admin-create-user:', error);
      
      // Error de duplicado
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        return ctx.badRequest('Ya existe un usuario con ese email o username');
      }
      
      ctx.throw(500, 'Error creando usuario');
    }
  },

  /**
   * POST /api/email-auth/admin-reset-password
   * Admin restablece contraseña de un usuario y envía email con contraseña temporal
   */
  async adminResetPassword(ctx) {
    const adminUser = ctx.state.user;

    if (!adminUser || adminUser.role.type !== 'admin') {
      return ctx.forbidden('Solo administradores pueden usar esta función');
    }

    const { userId } = ctx.request.body;

    if (!userId) {
      return ctx.badRequest('ID del usuario es requerido');
    }

    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
      });

      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }

      // Generar contraseña temporal
      const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10);

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Enviar email
      const frontendUrl = strapi.config.get('server.frontendUrl', process.env.FRONTEND_URL || 'http://localhost:3000');

      await strapi.plugins['email'].services.email.send({
        to: user.email,
        subject: 'Tu contraseña ha sido restablecida - Conceptual Nodo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; font-size: 24px;">Conceptual Nodo</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Contraseña restablecida</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hola <strong>${user.name || user.username}</strong>,
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Un administrador ha restablecido tu contraseña. Tu nueva contraseña temporal es:
            </p>
            <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #333;">${tempPassword}</p>
            </div>
            <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">
              Por seguridad, cambia tu contraseña después de iniciar sesión.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/login" 
                 style="background-color: #f5b940; color: #222; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Iniciar sesión
              </a>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      });

      console.log(`[EMAIL] Contraseña restablecida por admin para: ${user.email}`);

      return ctx.send({
        ok: true,
        message: 'Contraseña restablecida y enviada por email',
      });
    } catch (error) {
      console.error('[ERROR] admin-reset-password:', error);
      ctx.throw(500, 'Error restableciendo contraseña');
    }
  },

  /**
   * POST /api/email-auth/send-confirmation
   * Envía email de confirmación al registrarse
   */
  async sendConfirmation(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email es requerido');
    }

    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return ctx.send({ ok: true, message: 'Si el correo existe, recibirás un enlace de confirmación.' });
      }

      if (user.confirmed) {
        return ctx.send({ ok: true, message: 'Tu cuenta ya está confirmada.' });
      }

      // Generar token de confirmación
      const confirmationToken = crypto.randomBytes(32).toString('hex');

      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { confirmationToken },
      });

      const frontendUrl = strapi.config.get('server.frontendUrl', process.env.FRONTEND_URL || 'http://localhost:3000');
      const confirmLink = `${frontendUrl}/confirmar-email?token=${confirmationToken}`;

      await strapi.plugins['email'].services.email.send({
        to: user.email,
        subject: 'Confirma tu cuenta - Conceptual Nodo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; font-size: 24px;">Conceptual Nodo</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Confirma tu cuenta</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hola <strong>${user.name || user.username}</strong>,
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Gracias por registrarte en Conceptual Nodo. Haz clic en el botón para confirmar tu correo:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="background-color: #f5b940; color: #222; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Confirmar mi cuenta
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">
              Si no creaste esta cuenta, puedes ignorar este correo.
            </p>
            <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      });

      console.log(`[EMAIL] Confirmación enviada a: ${user.email}`);

      return ctx.send({
        ok: true,
        message: 'Email de confirmación enviado.',
      });
    } catch (error) {
      console.error('[ERROR] send-confirmation:', error);
      ctx.throw(500, 'Error enviando confirmación');
    }
  },

  /**
   * GET /api/email-auth/confirm-email?token=xxx
   * Confirma el email del usuario
   */
  async confirmEmail(ctx) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest('Token de confirmación requerido');
    }

    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { confirmationToken: token },
      });

      if (!user) {
        return ctx.badRequest('Token inválido o ya utilizado');
      }

      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          confirmed: true,
          confirmationToken: null,
        },
      });

      console.log(`[EMAIL] Email confirmado para: ${user.email}`);

      return ctx.send({
        ok: true,
        message: 'Email confirmado exitosamente. Ya puedes iniciar sesión.',
      });
    } catch (error) {
      console.error('[ERROR] confirm-email:', error);
      ctx.throw(500, 'Error confirmando email');
    }
  },
};
