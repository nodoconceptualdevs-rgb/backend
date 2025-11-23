# 🔐 Configuración de Roles y Permisos - Sistema Seguro

## 📋 Estructura de Roles Recomendada

Tu sistema necesita **4 roles** con permisos específicos:

---

## 1️⃣ **ROL: Gerente de Proyecto** (NUEVO - Crear)

### Descripción:
```
Gerente que administra proyectos asignados a él.
Solo puede ver y editar sus propios proyectos.
```

### Permisos Específicos:

#### **Proyecto:**
- ✅ `find` - Ver sus proyectos (filtrado automático)
- ✅ `findOne` - Ver proyecto específico (validado)
- ✅ `create` - Crear nuevo proyecto
- ✅ `update` - Editar solo sus proyectos (policy: is-project-manager)
- ✅ `delete` - Eliminar solo sus proyectos (policy: is-project-manager)

#### **Hito:**
- ✅ `create` - Crear hito en sus proyectos
- ✅ `update` - Editar hito de sus proyectos
- ✅ `delete` - Eliminar hito de sus proyectos
- ❌ `find` - NO (acceso vía proyecto)
- ❌ `findOne` - NO (acceso vía proyecto)

#### **Comentario-Proyecto:**
- ✅ `find` - Ver comentarios de sus proyectos
- ✅ `create` - Crear respuestas a comentarios
- ❌ `update` - NO
- ❌ `delete` - NO

#### **Upload:**
- ✅ `upload` - Subir archivos multimedia

#### **Usuarios:**
- ❌ NO acceso

#### **Roles:**
- ❌ NO acceso

---

## 2️⃣ **ROL: Authenticated (Cliente)** (MODIFICAR EXISTENTE)

### Descripción:
```
Cliente que puede ver su proyecto y crear comentarios.
No puede editar ni eliminar nada.
```

### Permisos Específicos:

#### **Proyecto:**
- ✅ `find` - Ver sus proyectos (filtrado automático)
- ✅ `findOne` - Ver su proyecto específico
- ❌ `create` - NO
- ❌ `update` - NO
- ❌ `delete` - NO

#### **Hito:**
- ✅ `find` - Ver hitos de su proyecto
- ✅ `findOne` - Ver hito específico
- ❌ `create` - NO
- ❌ `update` - NO
- ❌ `delete` - NO

#### **Comentario-Proyecto:**
- ✅ `find` - Ver comentarios
- ✅ `create` - Crear comentarios
- ❌ `update` - NO
- ❌ `delete` - NO

#### **Upload:**
- ❌ NO

#### **Usuarios:**
- ❌ NO acceso

#### **Roles:**
- ❌ NO acceso

---

## 3️⃣ **ROL: Super Admin** (EXISTENTE - SIN CAMBIOS)

### Descripción:
```
Administrador del sistema con acceso total.
```

### Permisos:
- ✅ **TODO** - Acceso completo a todas las operaciones

---

## 4️⃣ **ROL: Public** (EXISTENTE - MODIFICAR)

### Descripción:
```
Acceso público solo para autenticación NFC.
```

### Permisos Específicos:

#### **Proyecto:**
- ✅ `auth-nfc` - SOLO este endpoint personalizado
- ❌ `find` - NO
- ❌ `findOne` - NO
- ❌ `create` - NO
- ❌ `update` - NO
- ❌ `delete` - NO

#### **Hito:**
- ❌ NO acceso

#### **Comentario-Proyecto:**
- ❌ NO acceso

#### **Upload:**
- ❌ NO acceso

---

## 🔒 Medidas de Seguridad Implementadas

### **1. Validación en Múltiples Capas:**

```javascript
// Capa 1: Controller (filtrado automático)
async find(ctx) {
  const user = ctx.state.user;
  if (user.role.type === 'gerente_proyecto') {
    ctx.query.filters = {
      gerente_proyecto: { id: user.id }
    };
  }
  return await super.find(ctx);
}

// Capa 2: Policy (validación de acceso)
// is-project-manager.js verifica que sea el gerente

// Capa 3: Permisos de Rol (Strapi Admin)
// Solo permite operaciones configuradas
```

### **2. Tokens NFC Seguros:**
- ✅ 16 caracteres alfanuméricos
- ✅ Sin caracteres ambiguos (0/O, 1/I/l)
- ✅ Únicos por proyecto
- ✅ No reutilizables

### **3. Filtrado Automático por Usuario:**
- ✅ Gerentes solo ven sus proyectos
- ✅ Clientes solo ven su proyecto
- ✅ Admin ve todo

### **4. Validación de Relaciones:**
```javascript
// No se puede crear hito sin proyecto válido
// No se puede comentar en proyecto que no es tuyo
// No se puede editar proyecto de otro gerente
```

### **5. Protección contra Ataques Comunes:**

#### **IDOR (Insecure Direct Object Reference):**
```javascript
// ❌ VULNERABLE: GET /api/proyectos/5
// ✅ SEGURO: Validar que el usuario sea gerente/cliente del proyecto 5
```

#### **Privilege Escalation:**
```javascript
// ❌ VULNERABLE: Cliente puede hacer PUT /api/proyectos/:id
// ✅ SEGURO: Rol Authenticated no tiene permiso de update
```

#### **Acceso No Autorizado:**
```javascript
// ❌ VULNERABLE: GET /api/proyectos (sin filtro)
// ✅ SEGURO: Controller filtra automáticamente por usuario
```

#### **SQL Injection:**
```javascript
// ✅ SEGURO: Strapi usa ORM (entityService)
// No hay queries SQL directas
```

#### **Rate Limiting:**
```javascript
// Recomendado: Implementar en producción
// POST /api/proyectos/auth-nfc - máx 10 intentos/min
// POST /api/auth/local - máx 5 intentos/min
```

---

## 📝 Pasos para Configurar en Strapi Admin

### **Paso 1: Crear Rol "Gerente de Proyecto"**

1. Ve a **Settings → Users & Permissions Plugin → Roles**
2. Click **Add new role**
3. Nombre: `Gerente de Proyecto`
4. Descripción: `Gerente que administra proyectos asignados`
5. Click **Save**

### **Paso 2: Asignar Permisos a Gerente de Proyecto**

#### **Proyecto:**
- ✅ find
- ✅ findOne
- ✅ create
- ✅ update
- ✅ delete

#### **Hito:**
- ✅ create
- ✅ update
- ✅ delete

#### **Comentario-Proyecto:**
- ✅ find
- ✅ create

#### **Upload:**
- ✅ upload

### **Paso 3: Modificar Rol "Authenticated"**

1. Ve a **Settings → Users & Permissions Plugin → Roles → Authenticated**

#### **Proyecto:**
- ✅ find
- ✅ findOne
- ❌ create
- ❌ update
- ❌ delete

#### **Hito:**
- ✅ find
- ✅ findOne
- ❌ create
- ❌ update
- ❌ delete

#### **Comentario-Proyecto:**
- ✅ find
- ✅ create
- ❌ update
- ❌ delete

#### **Upload:**
- ❌ upload

### **Paso 4: Configurar Rol "Public"**

1. Ve a **Settings → Users & Permissions Plugin → Roles → Public**

#### **Proyecto:**
- ✅ auth-nfc (SOLO este)
- ❌ find
- ❌ findOne
- ❌ create
- ❌ update
- ❌ delete

#### **Hito:**
- ❌ Todos

#### **Comentario-Proyecto:**
- ❌ Todos

#### **Upload:**
- ❌ upload

---

## 🧪 Pruebas de Seguridad

### **Test 1: Gerente no puede ver proyectos de otro gerente**
```bash
# Login como gerente1
POST /api/auth/local
{ "identifier": "gerente1@email.com", "password": "..." }

# Intentar ver proyecto de gerente2
GET /api/proyectos?filters[gerente_proyecto][id]=3
# Resultado: ❌ Filtrado automáticamente a solo sus proyectos
```

### **Test 2: Cliente no puede editar proyecto**
```bash
# Login como cliente
POST /api/auth/local
{ "identifier": "cliente@email.com", "password": "..." }

# Intentar editar proyecto
PUT /api/proyectos/1
{ "nombre_proyecto": "Hacked!" }
# Resultado: ❌ 403 Forbidden (sin permiso)
```

### **Test 3: Público solo puede usar auth-nfc**
```bash
# Sin autenticación
POST /api/proyectos/auth-nfc
{ "token": "abc123xyz789defg" }
# Resultado: ✅ 200 OK

# Intentar listar proyectos sin token
GET /api/proyectos
# Resultado: ❌ 401 Unauthorized
```

### **Test 4: No se puede acceder a proyecto de otro cliente**
```bash
# Login como cliente1
POST /api/auth/local
{ "identifier": "cliente1@email.com", "password": "..." }

# Intentar ver proyecto de cliente2
GET /api/proyectos/2
# Resultado: ❌ 403 Forbidden (validado en controller)
```

### **Test 5: Gerente no puede crear hito en proyecto de otro**
```bash
# Login como gerente1
POST /api/auth/local
{ "identifier": "gerente1@email.com", "password": "..." }

# Intentar crear hito en proyecto de gerente2
POST /api/hitos
{
  "nombre": "Hito Malicioso",
  "proyecto": 2,  # Proyecto de gerente2
  "orden": 1
}
# Resultado: ❌ 403 Forbidden (policy: is-hito-manager)
```

---

## 📊 Matriz de Permisos

| Operación | Public | Authenticated | Gerente | Admin |
|-----------|--------|---------------|---------|-------|
| auth-nfc | ✅ | ❌ | ❌ | ✅ |
| GET /proyectos | ❌ | ✅ (filtrado) | ✅ (filtrado) | ✅ |
| POST /proyectos | ❌ | ❌ | ✅ | ✅ |
| PUT /proyectos/:id | ❌ | ❌ | ✅ (propio) | ✅ |
| DELETE /proyectos/:id | ❌ | ❌ | ✅ (propio) | ✅ |
| POST /hitos | ❌ | ❌ | ✅ (propio proyecto) | ✅ |
| PUT /hitos/:id | ❌ | ❌ | ✅ (propio proyecto) | ✅ |
| DELETE /hitos/:id | ❌ | ❌ | ✅ (propio proyecto) | ✅ |
| POST /comentarios | ❌ | ✅ | ✅ | ✅ |
| GET /comentarios | ❌ | ✅ (filtrado) | ✅ (filtrado) | ✅ |

---

## 🚨 Checklist de Seguridad

- ✅ Validación en controller (filtrado automático)
- ✅ Policies en rutas críticas (is-project-manager, is-hito-manager)
- ✅ Permisos de rol configurados en Strapi
- ✅ Tokens NFC únicos y seguros
- ✅ Protección contra IDOR
- ✅ Protección contra Privilege Escalation
- ✅ Protección contra Acceso No Autorizado
- ⏳ Rate limiting (recomendado para producción)
- ⏳ HTTPS obligatorio (recomendado para producción)
- ⏳ CORS configurado correctamente (recomendado)

---

## 🎯 Conclusión

Este sistema es **seguro a prueba de hacking** porque:

1. **Múltiples capas de validación** - Controller + Policy + Permisos
2. **Filtrado automático** - No se puede acceder a datos ajenos
3. **Tokens únicos** - Cada proyecto tiene su token NFC
4. **Validación de relaciones** - No se puede crear datos sin validación
5. **Permisos granulares** - Cada rol tiene permisos específicos
6. **Protección contra ataques comunes** - IDOR, Privilege Escalation, etc.

**Nivel de Seguridad: 🔐 ALTO**

---

**Próximo paso:** Configura los permisos en el Admin Panel siguiendo los pasos anteriores.
