# 📚 Documentación API - Swagger y Postman

## 🎯 Opciones de Documentación

Tu backend tiene **2 formas de documentar y probar** los endpoints:

### **1. Swagger/OpenAPI (Integrado en Strapi)**
### **2. Postman Collection (Colección completa)**

---

## 📖 OPCIÓN 1: Swagger/OpenAPI (Recomendado para Desarrollo)

### ✅ Acceder a Swagger

Strapi v5 incluye Swagger automáticamente. Accede en:

```
http://localhost:1337/documentation
```

### 📋 Qué Verás en Swagger

- ✅ Todos los endpoints documentados
- ✅ Parámetros de cada endpoint
- ✅ Modelos de datos
- ✅ Ejemplos de respuesta
- ✅ Botón "Try it out" para probar

### 🔑 Características de Swagger

```
✅ Documentación automática
✅ Interfaz visual
✅ Pruebas directas en el navegador
✅ Validación de esquemas
✅ Historial de solicitudes
```

### 📸 Estructura en Swagger

```
Swagger UI
├── 🔐 Authentication
│   ├── POST /auth/local
│   └── POST /auth/logout
├── 📦 Proyectos
│   ├── GET /proyectos
│   ├── POST /proyectos
│   ├── GET /proyectos/{id}
│   ├── PUT /proyectos/{id}
│   └── DELETE /proyectos/{id}
├── 🎯 Hitos
│   ├── GET /hitos
│   ├── POST /hitos
│   ├── GET /hitos/{id}
│   ├── PUT /hitos/{id}
│   └── DELETE /hitos/{id}
├── 💬 Comentarios
│   ├── GET /comentario-proyectos
│   ├── POST /comentario-proyectos
│   └── GET /comentario-proyectos/{id}
└── 📤 Upload
    └── POST /upload
```

---

## 🚀 OPCIÓN 2: Postman Collection (Recomendado para Testing)

### ✅ Importar Colección en Postman

#### **Paso 1: Descargar Postman**
```
https://www.postman.com/downloads/
```

#### **Paso 2: Importar Colección**
1. Abre Postman
2. Click en **Import** (arriba a la izquierda)
3. Selecciona **Upload Files**
4. Elige el archivo: `Postman-Collection.json`
5. Click **Import**

#### **Paso 3: Configurar Variables**

Después de importar, configura las variables:

1. En Postman, ve a **Environments**
2. Click **Create New Environment**
3. Nombre: `Nodo Conceptual - Local`
4. Agrega variables:

```
base_url = http://localhost:1337
gerente_token = (se llena después del login)
cliente_token = (se llena después del login)
nfc_token = (se copia del proyecto)
proyecto_id = 1
hito_id = 1
```

5. Click **Save**

### 📋 Estructura de la Colección

```
Nodo Conceptual - Backend API
├── 🔐 Autenticación
│   ├── Login - Gerente
│   ├── Login - Cliente
│   └── Auth NFC - Público
├── 📦 Proyectos
│   ├── Listar Proyectos (Gerente)
│   ├── Listar Proyectos (Cliente)
│   ├── Ver Proyecto Específico
│   ├── Crear Proyecto
│   ├── Editar Proyecto (Gerente)
│   ├── ❌ Editar Proyecto (Cliente - Debe Fallar)
│   └── Eliminar Proyecto
├── 🎯 Hitos
│   ├── Listar Hitos de Proyecto
│   ├── Ver Hito Específico
│   ├── Crear Hito
│   ├── Actualizar Hito - Marcar Completado
│   ├── Actualizar Hito - Con Descripción
│   └── Eliminar Hito
├── 💬 Comentarios
│   ├── Listar Comentarios del Proyecto
│   ├── Crear Comentario (Cliente)
│   └── Crear Comentario (Gerente - Respuesta)
├── 📤 Upload de Archivos
│   ├── Subir Foto
│   ├── Subir Video
│   └── Subir Documento PDF
└── 🔒 Pruebas de Seguridad
    ├── ❌ Acceder sin Token JWT
    ├── ❌ Cliente Intenta Editar Proyecto
    ├── ❌ Token NFC Inválido
    ├── ❌ Token NFC Inexistente
    └── ❌ Gerente Intenta Ver Proyecto de Otro
```

---

## 🧪 FLUJO DE PRUEBAS RECOMENDADO

### **Paso 1: Autenticación**

1. Ejecuta: **Login - Gerente**
   - Copia el JWT de la respuesta
   - Pégalo en la variable `gerente_token`

2. Ejecuta: **Login - Cliente**
   - Copia el JWT de la respuesta
   - Pégalo en la variable `cliente_token`

### **Paso 2: Crear Proyecto**

1. Ejecuta: **Crear Proyecto**
   - Reemplaza `cliente` y `gerente_proyecto` con IDs reales
   - Copia el `token_nfc` de la respuesta
   - Pégalo en la variable `nfc_token`
   - Copia el `id` del proyecto
   - Pégalo en la variable `proyecto_id`

### **Paso 3: Probar Proyectos**

1. Ejecuta: **Listar Proyectos (Gerente)**
   - ✅ Debe ver solo sus proyectos

2. Ejecuta: **Listar Proyectos (Cliente)**
   - ✅ Debe ver solo su proyecto

3. Ejecuta: **Ver Proyecto Específico**
   - ✅ Debe ver todos los datos

### **Paso 4: Probar Hitos**

1. Ejecuta: **Listar Hitos de Proyecto**
   - ✅ Debe ver los 7 hitos predeterminados

2. Ejecuta: **Actualizar Hito - Marcar Completado**
   - ✅ Debe marcar un hito como completado

3. Ejecuta: **Actualizar Hito - Con Descripción**
   - ✅ Debe agregar descripción y tour 360

### **Paso 5: Probar Comentarios**

1. Ejecuta: **Crear Comentario (Cliente)**
   - ✅ Cliente crea comentario

2. Ejecuta: **Crear Comentario (Gerente - Respuesta)**
   - ✅ Gerente responde

3. Ejecuta: **Listar Comentarios del Proyecto**
   - ✅ Debe ver ambos comentarios

### **Paso 6: Probar Seguridad**

1. Ejecuta: **❌ Cliente Intenta Editar Proyecto**
   - ❌ Debe fallar con 403 Forbidden

2. Ejecuta: **❌ Acceder sin Token JWT**
   - ❌ Debe fallar con 401 Unauthorized

3. Ejecuta: **❌ Token NFC Inválido**
   - ❌ Debe fallar con 400 Bad Request

4. Ejecuta: **Auth NFC - Público (Sin Token)**
   - ✅ Debe funcionar sin JWT
   - ✅ Debe devolver datos del proyecto

---

## 📊 Comparación: Swagger vs Postman

| Característica | Swagger | Postman |
|---|---|---|
| **Documentación** | ✅ Automática | ✅ Manual |
| **Pruebas** | ✅ Básicas | ✅✅ Avanzadas |
| **Automatización** | ❌ No | ✅ Sí (Tests) |
| **Historial** | ❌ No | ✅ Sí |
| **Colaboración** | ❌ No | ✅ Sí (Cloud) |
| **Variables** | ❌ No | ✅ Sí |
| **Entornos** | ❌ No | ✅ Sí |
| **Scripting** | ❌ No | ✅ Sí (JavaScript) |

---

## 💡 Casos de Uso

### **Usa Swagger cuando:**
- ✅ Necesitas documentación rápida
- ✅ Quieres ver la estructura de la API
- ✅ Haces pruebas simples
- ✅ Necesitas compartir documentación

### **Usa Postman cuando:**
- ✅ Haces testing exhaustivo
- ✅ Necesitas automatizar pruebas
- ✅ Quieres guardar historiales
- ✅ Trabajas en equipo
- ✅ Necesitas scripts personalizados

---

## 🔑 Variables en Postman

### **Variables Globales**

```
base_url = http://localhost:1337
```

### **Variables de Autenticación**

```
gerente_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
cliente_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Variables de Datos**

```
nfc_token = abc123xyz789defg
proyecto_id = 1
hito_id = 1
```

### **Cómo Usar Variables**

En cualquier campo, usa: `{{variable_name}}`

```
GET {{base_url}}/api/proyectos/{{proyecto_id}}
Authorization: Bearer {{gerente_token}}
```

---

## 🧪 Pruebas Automatizadas en Postman

### **Agregar Test a una Solicitud**

1. Abre una solicitud
2. Ve a la pestaña **Tests**
3. Agrega código JavaScript:

```javascript
// Verificar que la respuesta es 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Verificar que existe el campo nombre_proyecto
pm.test("Response has nombre_proyecto", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('nombre_proyecto');
});

// Guardar token en variable
var jsonData = pm.response.json();
pm.environment.set("gerente_token", jsonData.jwt);
```

### **Ejecutar Colección Completa**

1. Click en los **3 puntos** junto a la colección
2. Selecciona **Run**
3. Click **Run Nodo Conceptual - Backend API**
4. Verás todos los tests ejecutándose

---

## 📤 Exportar Resultados

### **Exportar Colección**

1. Click en los **3 puntos** junto a la colección
2. Selecciona **Export**
3. Elige formato: **Collection v2.1**
4. Click **Export**

### **Exportar Resultados de Tests**

1. Después de ejecutar la colección
2. Click **Export Results**
3. Elige formato: **JSON**
4. Guarda el archivo

---

## 🚀 Recomendaciones

### **Para Desarrollo:**
```
1. Usa Swagger para entender la API
2. Usa Postman para testing detallado
3. Guarda variables en Postman
4. Crea tests automatizados
```

### **Para Producción:**
```
1. Documenta con Swagger
2. Usa Postman para testing final
3. Automatiza pruebas en CI/CD
4. Mantén colecciones actualizadas
```

---

## 📞 Troubleshooting

### **Error: "Cannot GET /documentation"**
```
Solución: Asegúrate que Strapi está corriendo
npm run develop
```

### **Error: "401 Unauthorized"**
```
Solución: Copia el JWT correcto en la variable gerente_token
```

### **Error: "403 Forbidden"**
```
Solución: Verifica que tienes permisos para esa operación
```

### **Error: "404 Not Found"**
```
Solución: Verifica que el ID existe (proyecto_id, hito_id)
```

---

## ✅ Checklist

- [ ] Acceder a Swagger en http://localhost:1337/documentation
- [ ] Importar Postman Collection
- [ ] Configurar variables en Postman
- [ ] Ejecutar Login - Gerente
- [ ] Ejecutar Login - Cliente
- [ ] Crear proyecto de prueba
- [ ] Probar CRUD de proyectos
- [ ] Probar CRUD de hitos
- [ ] Probar comentarios
- [ ] Probar seguridad (fallos esperados)
- [ ] Ejecutar colección completa
- [ ] Guardar resultados

---

## 🎉 ¡Listo!

Tienes 2 formas completas de documentar y probar tu API:

1. **Swagger** - Documentación visual
2. **Postman** - Testing exhaustivo

**Próximo paso:** Integrar con el frontend

---

**Documentos relacionados:**
- `PASOS-CONFIGURAR-ROLES.md` - Configuración de roles
- `GUIA-SEGURIDAD-COMPLETA.md` - Detalles de seguridad
- `RESUMEN-IMPLEMENTACION.md` - Estado del backend
