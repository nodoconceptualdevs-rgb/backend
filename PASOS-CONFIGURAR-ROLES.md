# 📋 Pasos Exactos para Configurar Roles en Strapi Admin

## 🎯 Objetivo
Configurar 4 roles con permisos específicos para un sistema seguro de proyectos.

---

## ✅ PASO 1: Crear Rol "Gerente de Proyecto"

### Ubicación en Admin:
**Settings → Users & Permissions Plugin → Roles**

### Acciones:
1. Click en **"+ Add new role"** (botón azul arriba a la derecha)
2. Llenar formulario:
   - **Name:** `Gerente de Proyecto`
   - **Description:** `Gerente que administra proyectos asignados a él`
3. Click **Save**

### Configurar Permisos del Gerente:

Después de crear el rol, aparecerá una sección de permisos. Configura así:

#### **Proyecto:**
```
✅ find      (Ver sus proyectos)
✅ findOne   (Ver proyecto específico)
✅ create    (Crear proyecto)
✅ update    (Editar sus proyectos)
✅ delete    (Eliminar sus proyectos)
```

#### **Hito:**
```
✅ create    (Crear hito)
✅ update    (Editar hito)
✅ delete    (Eliminar hito)
```

#### **Comentario-Proyecto:**
```
✅ find      (Ver comentarios)
✅ create    (Crear comentarios)
```

#### **Upload:**
```
✅ upload    (Subir archivos)
```

#### **Usuarios:**
```
❌ (No marcar nada)
```

#### **Roles:**
```
❌ (No marcar nada)
```

---

## ✅ PASO 2: Modificar Rol "Authenticated" (Cliente)

### Ubicación en Admin:
**Settings → Users & Permissions Plugin → Roles → Authenticated**

### Configurar Permisos del Cliente:

#### **Proyecto:**
```
✅ find      (Ver sus proyectos)
✅ findOne   (Ver proyecto específico)
❌ create    (NO crear)
❌ update    (NO editar)
❌ delete    (NO eliminar)
```

#### **Hito:**
```
✅ find      (Ver hitos)
✅ findOne   (Ver hito específico)
❌ create    (NO crear)
❌ update    (NO editar)
❌ delete    (NO eliminar)
```

#### **Comentario-Proyecto:**
```
✅ find      (Ver comentarios)
✅ create    (Crear comentarios)
❌ update    (NO editar)
❌ delete    (NO eliminar)
```

#### **Upload:**
```
❌ upload    (NO subir archivos)
```

#### **Usuarios:**
```
❌ (No marcar nada)
```

#### **Roles:**
```
❌ (No marcar nada)
```

---

## ✅ PASO 3: Configurar Rol "Public" (Acceso Público)

### Ubicación en Admin:
**Settings → Users & Permissions Plugin → Roles → Public**

### Configurar Permisos Públicos:

#### **Proyecto:**
```
✅ auth-nfc  (SOLO este endpoint)
❌ find      (NO)
❌ findOne   (NO)
❌ create    (NO)
❌ update    (NO)
❌ delete    (NO)
```

#### **Hito:**
```
❌ (No marcar nada)
```

#### **Comentario-Proyecto:**
```
❌ (No marcar nada)
```

#### **Upload:**
```
❌ upload    (NO)
```

#### **Usuarios:**
```
❌ (No marcar nada)
```

#### **Roles:**
```
❌ (No marcar nada)
```

---

## ✅ PASO 4: Verificar Rol "Super Admin"

### Ubicación en Admin:
**Settings → Users & Permissions Plugin → Roles → Super Admin**

### Verificación:
- ✅ Debe tener acceso a TODO
- ✅ No necesita cambios
- ✅ Dejar como está

---

## 🧪 PASO 5: Crear Usuario de Prueba

### Crear Gerente de Prueba:

1. Ve a **Content Manager → Users**
2. Click **Create new entry**
3. Llenar:
   - **Username:** `gerente1`
   - **Email:** `gerente1@example.com`
   - **Password:** `Gerente123!`
   - **Confirm Password:** `Gerente123!`
   - **Role:** `Gerente de Proyecto`
4. Click **Save**

### Crear Cliente de Prueba:

1. Ve a **Content Manager → Users**
2. Click **Create new entry**
3. Llenar:
   - **Username:** `cliente1`
   - **Email:** `cliente1@example.com`
   - **Password:** `Cliente123!`
   - **Confirm Password:** `Cliente123!`
   - **Role:** `Authenticated`
4. Click **Save**

---

## 🧪 PASO 6: Crear Proyecto de Prueba

### Crear Proyecto:

1. Ve a **Content Manager → Proyecto**
2. Click **Create new entry**
3. Llenar:
   - **nombre_proyecto:** `Casa Los Palos Grandes`
   - **estado_general:** `En Planificación`
   - **fecha_inicio:** Hoy (ej: 2025-11-18)
   - **cliente:** Seleccionar `cliente1`
   - **gerente_proyecto:** Seleccionar `gerente1`
4. Click **Save**

### Resultado Automático:
- ✅ Se genera token NFC único (ej: `abc123xyz789defg`)
- ✅ Se crean 7 hitos predeterminados
- ✅ Proyecto listo para usar

---

## 🧪 PASO 7: Probar Endpoint de Autenticación NFC

### Copiar Token NFC:

1. Abre el proyecto creado
2. Copia el valor del campo **token_nfc**

### Probar con Postman/Insomnia:

```bash
POST http://localhost:1337/api/proyectos/auth-nfc
Content-Type: application/json

{
  "token": "abc123xyz789defg"  # Tu token copiado
}
```

### Respuesta Esperada:
```json
{
  "data": {
    "id": 1,
    "nombre_proyecto": "Casa Los Palos Grandes",
    "token_nfc": "abc123xyz789defg",
    "estado_general": "En Planificación",
    "fecha_inicio": "2025-11-18",
    "progreso": 0,
    "cliente": {
      "id": 2,
      "username": "cliente1",
      "email": "cliente1@example.com"
    },
    "gerente_proyecto": {
      "id": 3,
      "username": "gerente1",
      "email": "gerente1@example.com"
    },
    "hitos": [
      {
        "id": 7,
        "nombre": "Entrega Final",
        "orden": 7,
        "estado_completado": false
      },
      // ... más hitos
    ]
  }
}
```

---

## 🧪 PASO 8: Probar CRUD con Autenticación JWT

### Login como Gerente:

```bash
POST http://localhost:1337/api/auth/local
Content-Type: application/json

{
  "identifier": "gerente1@example.com",
  "password": "Gerente123!"
}
```

### Respuesta:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "gerente1",
    "email": "gerente1@example.com",
    "role": {
      "id": 4,
      "name": "Gerente de Proyecto"
    }
  }
}
```

### Guardar JWT para próximas solicitudes

### Listar Proyectos del Gerente:

```bash
GET http://localhost:1337/api/proyectos?populate=*
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Resultado:
- ✅ Solo ve sus proyectos (filtrado automático)

### Intentar Ver Proyecto de Otro Gerente:

```bash
GET http://localhost:1337/api/proyectos/999
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Resultado:
- ❌ 403 Forbidden (no tiene permiso)

---

## 🧪 PASO 9: Probar Seguridad - Cliente Intenta Editar

### Login como Cliente:

```bash
POST http://localhost:1337/api/auth/local
Content-Type: application/json

{
  "identifier": "cliente1@example.com",
  "password": "Cliente123!"
}
```

### Intentar Editar Proyecto:

```bash
PUT http://localhost:1337/api/proyectos/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre_proyecto": "Hacked!"
}
```

### Resultado:
- ❌ 403 Forbidden
- ✅ Seguridad funcionando

---

## 🧪 PASO 10: Probar Seguridad - Acceso Público

### Intentar Listar Proyectos sin Token:

```bash
GET http://localhost:1337/api/proyectos
```

### Resultado:
- ❌ 401 Unauthorized
- ✅ Seguridad funcionando

### Usar Endpoint Público (auth-nfc):

```bash
POST http://localhost:1337/api/proyectos/auth-nfc
Content-Type: application/json

{
  "token": "abc123xyz789defg"
}
```

### Resultado:
- ✅ 200 OK
- ✅ Devuelve datos del proyecto

---

## 📊 Resumen de Configuración

| Rol | find | findOne | create | update | delete | auth-nfc |
|-----|------|---------|--------|--------|--------|----------|
| **Public** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Authenticated** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Gerente** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ✅ Checklist Final

- [ ] Crear rol "Gerente de Proyecto"
- [ ] Configurar permisos del Gerente
- [ ] Modificar rol "Authenticated"
- [ ] Configurar permisos del Cliente
- [ ] Configurar rol "Public"
- [ ] Crear usuario gerente de prueba
- [ ] Crear usuario cliente de prueba
- [ ] Crear proyecto de prueba
- [ ] Copiar token NFC
- [ ] Probar endpoint auth-nfc
- [ ] Probar login JWT
- [ ] Probar CRUD con JWT
- [ ] Probar seguridad (cliente intenta editar)
- [ ] Probar acceso público

---

## 🎉 ¡Listo!

Tu sistema está completamente configurado y seguro.

**Próximo paso:** Conectar el frontend con estos endpoints.

---

**Documentación:** 
- `CONFIGURACION-ROLES-SEGURIDAD.md` - Detalles de seguridad
- `GUIA-SEGURIDAD-COMPLETA.md` - Protecciones implementadas
- `CORRECCIONES-APLICADAS.md` - Cambios técnicos realizados
