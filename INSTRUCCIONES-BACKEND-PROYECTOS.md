# 🚀 Backend Strapi - Módulo de Proyectos - Instrucciones de Instalación

## ✅ Archivos Creados

He creado toda la estructura del backend para el módulo de proyectos:

### **📂 Estructura Creada:**

```
backend-nodo/src/
├── components/
│   └── proyecto/
│       └── contenido-hito.json              ✅ Componente de contenido multimedia
│
├── api/
│   ├── proyecto/
│   │   ├── content-types/proyecto/
│   │   │   ├── schema.json                  ✅ Schema del proyecto
│   │   │   └── lifecycles.js                ✅ Auto-generación token + hitos
│   │   ├── controllers/
│   │   │   └── proyecto.js                  ✅ Controller con endpoint NFC
│   │   ├── routes/
│   │   │   └── proyecto.js                  ✅ Rutas + ruta personalizada NFC
│   │   └── services/
│   │       └── proyecto.js                  ✅ Service
│   │
│   ├── hito/
│   │   ├── content-types/hito/
│   │   │   └── schema.json                  ✅ Schema del hito
│   │   ├── controllers/
│   │   │   └── hito.js                      ✅ Controller
│   │   ├── routes/
│   │   │   └── hito.js                      ✅ Rutas
│   │   └── services/
│   │       └── hito.js                      ✅ Service
│   │
│   └── comentario-proyecto/
│       ├── content-types/comentario-proyecto/
│       │   └── schema.json                  ✅ Schema de comentarios
│       ├── controllers/
│       │   └── comentario-proyecto.js       ✅ Controller
│       ├── routes/
│       │   └── comentario-proyecto.js       ✅ Rutas
│       └── services/
│           └── comentario-proyecto.js       ✅ Service
```

---

## 📦 Paso 1: Instalar Dependencias

Abre terminal en la carpeta del backend y ejecuta:

\`\`\`bash
cd backend-nodo
npm install
\`\`\`

Esto instalará **nanoid** que es necesario para generar tokens NFC únicos.

---

## 🔥 Paso 2: Iniciar Strapi

\`\`\`bash
npm run develop
\`\`\`

Strapi debería:
1. ✅ Detectar los nuevos content-types
2. ✅ Crear las tablas en la base de datos
3. ✅ Abrir el admin en http://localhost:1337/admin

---

## 🎯 Paso 3: Configurar Permisos

### **A. Crear Rol "Gerente de Proyecto"**

1. Ve a **Settings → Users & Permissions Plugin → Roles**
2. Click **Add new role**
3. Nombre: `Gerente de Proyecto`
4. Descripción: `Gerente que administra proyectos`

**Permisos del Gerente:**

- **Proyecto:**
  - ✅ find (ver sus proyectos)
  - ✅ findOne (ver proyecto específico)
  - ✅ create (crear proyectos)
  - ✅ update (editar sus proyectos)
  - ✅ delete (eliminar sus proyectos)

- **Hito:**
  - ✅ create
  - ✅ update
  - ✅ delete

- **Comentario-proyecto:**
  - ✅ find
  - ✅ create (responder comentarios)

- **Upload:**
  - ✅ upload (subir archivos)

### **B. Configurar Rol "Authenticated" (Cliente)**

1. Ve a **Settings → Users & Permissions Plugin → Roles → Authenticated**

**Permisos del Cliente:**

- **Proyecto:**
  - ✅ find (ver sus proyectos)
  - ✅ findOne (ver su proyecto)
  - ❌ create, update, delete

- **Comentario-proyecto:**
  - ✅ find (ver comentarios)
  - ✅ create (crear comentarios)

### **C. Permisos Públicos (Para NFC)**

1. Ve a **Settings → Users & Permissions Plugin → Roles → Public**

**Permisos Públicos:**

- **Proyecto:**
  - ✅ auth-nfc (solo este endpoint)
  - ❌ Todo lo demás

---

## 🧪 Paso 4: Probar el Backend

### **A. Crear un Proyecto de Prueba**

1. Ve a **Content Manager → Proyecto**
2. Click **Create new entry**
3. Llenar campos:
   - **nombre_proyecto:** "Remodelación Test"
   - **estado_general:** "En Planificación"
   - **fecha_inicio:** Hoy
   - **cliente:** Seleccionar un usuario
   - **gerente_proyecto:** Seleccionar un usuario con rol Gerente

4. Click **Save**

✅ **Automáticamente se creará:**
- Token NFC único (ej: `xYz123AbC456DeFg`)
- 7 hitos predeterminados

### **B. Verificar Token Generado**

1. Abre el proyecto creado
2. Verás el campo **token_nfc** con un valor único
3. Copia ese token

### **C. Probar Endpoint de Autenticación NFC**

Usa Postman, Insomnia o curl:

\`\`\`bash
POST http://localhost:1337/api/proyectos/auth-nfc
Content-Type: application/json

{
  "token": "xYz123AbC456DeFg"  # El token generado
}
\`\`\`

**Respuesta esperada:**
\`\`\`json
{
  "data": {
    "id": 1,
    "nombre_proyecto": "Remodelación Test",
    "token_nfc": "xYz123AbC456DeFg",
    "estado_general": "En Planificación",
    "fecha_inicio": "2025-01-15",
    "ultimo_avance": null,
    "progreso": 0,
    "cliente": { ... },
    "gerente_proyecto": { ... },
    "hitos": [
      {
        "id": 1,
        "nombre": "Conceptualización (Diseño)",
        "orden": 1,
        "estado_completado": false,
        ...
      },
      ...
    ]
  }
}
\`\`\`

---

## 📝 Paso 5: Probar CRUD de Proyectos (Con Autenticación)

### **Login de Gerente:**

\`\`\`bash
POST http://localhost:1337/api/auth/local
Content-Type: application/json

{
  "identifier": "gerente@email.com",
  "password": "password123"
}
\`\`\`

Guarda el JWT token de la respuesta.

### **Listar Proyectos del Gerente:**

\`\`\`bash
GET http://localhost:1337/api/proyectos?populate=*
Authorization: Bearer TU_JWT_TOKEN
\`\`\`

### **Crear Nuevo Proyecto:**

\`\`\`bash
POST http://localhost:1337/api/proyectos
Authorization: Bearer TU_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "nombre_proyecto": "Casa Los Palos Grandes",
    "estado_general": "En Planificación",
    "fecha_inicio": "2025-02-01",
    "cliente": 2,
    "gerente_proyecto": 3
  }
}
\`\`\`

✅ Se auto-generará token NFC y 7 hitos.

### **Actualizar Hito:**

\`\`\`bash
PUT http://localhost:1337/api/hitos/1
Authorization: Bearer TU_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "estado_completado": true,
    "fecha_actualizacion": "2025-01-15T10:30:00.000Z",
    "contenido": {
      "descripcion_avance": "<p>Concepto inicial aprobado por el cliente.</p>",
      "enlace_tour_360": null
    }
  }
}
\`\`\`

### **Subir Archivos Multimedia:**

\`\`\`bash
POST http://localhost:1337/api/upload
Authorization: Bearer TU_JWT_TOKEN
Content-Type: multipart/form-data

files: [archivo1.jpg, archivo2.jpg]
ref: hito
refId: 1
field: contenido.galeria_fotos
\`\`\`

---

## 🔒 Seguridad Implementada

### **1. Autenticación NFC:**
- ✅ Endpoint público `/api/proyectos/auth-nfc`
- ✅ No requiere JWT
- ✅ Solo requiere token NFC válido
- ✅ Devuelve datos completos del proyecto

### **2. CRUD Protegido:**
- ✅ Gerente solo ve sus proyectos
- ✅ Cliente solo ve sus proyectos
- ✅ Admin ve todo

### **3. Validación de Acceso:**
- ✅ `findOne` verifica que el usuario tenga permiso
- ✅ No se pueden ver proyectos de otros

---

## 🎨 Estructura de Datos

### **Proyecto:**
\`\`\`javascript
{
  id: 1,
  nombre_proyecto: "Remodelación Apartamento",
  token_nfc: "xYz123AbC456DeFg", // Auto-generado
  estado_general: "En Planificación",
  fecha_inicio: "2025-01-15",
  ultimo_avance: "Planos aprobados",
  cliente: { ... },
  gerente_proyecto: { ... },
  hitos: [ ... ]
}
\`\`\`

### **Hito:**
\`\`\`javascript
{
  id: 1,
  nombre: "Conceptualización (Diseño)",
  orden: 1,
  estado_completado: false,
  fecha_actualizacion: null,
  contenido: {
    descripcion_avance: "<p>...</p>",
    enlace_tour_360: "https://matterport.com/...",
    galeria_fotos: [ ... ],
    videos_walkthrough: [ ... ],
    documentacion: [ ... ]
  },
  proyecto: 1
}
\`\`\`

---

## ⚙️ Funcionalidades Automáticas

### **Al crear proyecto:**
1. ✅ Genera token NFC único con nanoid
2. ✅ Crea 7 hitos predeterminados:
   - Conceptualización (Diseño)
   - Planificación (Técnico)
   - Visualización 3D
   - Adquisición de Materiales
   - Ejecución (Obra Gris)
   - Acabados y Decoración
   - Entrega Final

### **Al consultar proyecto:**
1. ✅ Calcula progreso dinámicamente
2. ✅ Ordena hitos DESC (más reciente primero)
3. ✅ Populate completo de relaciones
4. ✅ Incluye multimedia

---

## 🐛 Troubleshooting

### **Error: nanoid not found**
\`\`\`bash
npm install nanoid
\`\`\`

### **Error: Content-type not found**
- Reinicia Strapi: `npm run develop`
- Strapi auto-detecta los schemas

### **Error: Permission denied**
- Verifica permisos en Settings → Roles
- Asegúrate que el rol tenga acceso

### **Error: No token generated**
- Verifica que el lifecycle esté en la ruta correcta
- Revisa logs de consola

---

## 🎯 Próximos Pasos

1. ✅ **Backend completo**
2. ⏳ **Conectar frontend con backend**
3. ⏳ **Probar flujo completo end-to-end**
4. ⏳ **Configurar Cloudinary para archivos (opcional)**

---

## 📞 Endpoints Disponibles

### **Públicos:**
- `POST /api/proyectos/auth-nfc` - Autenticación NFC

### **Autenticados (JWT):**
- `GET /api/proyectos` - Lista proyectos
- `POST /api/proyectos` - Crear proyecto
- `GET /api/proyectos/:id` - Ver proyecto
- `PUT /api/proyectos/:id` - Actualizar proyecto
- `DELETE /api/proyectos/:id` - Eliminar proyecto

- `POST /api/hitos` - Crear hito
- `PUT /api/hitos/:id` - Actualizar hito
- `DELETE /api/hitos/:id` - Eliminar hito

- `POST /api/comentario-proyectos` - Crear comentario
- `GET /api/comentario-proyectos` - Listar comentarios

- `POST /api/upload` - Subir archivos

---

**🎉 ¡Backend listo para usar!**
