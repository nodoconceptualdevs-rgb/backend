# 📋 Plan de Implementación: Backend Strapi - Módulo de Proyectos

## ✅ Análisis: Frontend vs Especificación MD

### **Frontend Implementado (100% completo):**

#### **Vista Cliente** (`/proyecto/[token]`)
- ✅ Autenticación por token NFC
- ✅ Header con info del proyecto y gerente
- ✅ Timeline de hitos con indicador de progreso
- ✅ HitoCard por cada hito mostrando:
  - Descripción del avance
  - Estado (completado/pendiente)
  - Tour 360° (botón especial)
  - Galería multimedia (fotos, videos, documentos)
- ✅ Sección de comentarios/consultas
- ✅ Footer con logo

#### **Panel Admin** (`/admin/proyectos`)
- ✅ Dashboard de proyectos con búsqueda
- ✅ Crear nuevo proyecto
- ✅ Editar proyecto (2 pestañas):
  - Info general del proyecto
  - Gestión de hitos
- ✅ HitoEditor con:
  - Campo nombre editable
  - Toggle completado/pendiente
  - Descripción del avance (textarea)
  - Campo URL para Tour 360°
  - Upload de fotos (múltiple)
  - Upload de videos
  - Upload de documentos PDF
  - Agregar/Eliminar hitos dinámicamente

---

## 🎯 Estructura del Backend en Strapi

Según el documento MD, necesitamos:

### **1. Component: `contenido-hito`**

**Ubicación:** `src/components/proyecto/contenido-hito.json`

**Campos:**
```json
{
  "collectionName": "components_proyecto_contenido_hitos",
  "info": {
    "displayName": "Contenido Hito",
    "description": "Contenido multimedia y documentación de un hito"
  },
  "attributes": {
    "descripcion_avance": {
      "type": "richtext",
      "required": false
    },
    "enlace_tour_360": {
      "type": "string",
      "required": false
    },
    "galeria_fotos": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["images"]
    },
    "videos_walkthrough": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["videos"]
    },
    "documentacion": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["files"]
    }
  }
}
```

---

### **2. Collection Type: `hito`**

**Ubicación:** `src/api/hito/content-types/hito/schema.json`

**Campos:**
```json
{
  "kind": "collectionType",
  "collectionName": "hitos",
  "info": {
    "singularName": "hito",
    "pluralName": "hitos",
    "displayName": "Hito",
    "description": "Hitos/Etapas de un proyecto de construcción"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "nombre": {
      "type": "string",
      "required": true
    },
    "orden": {
      "type": "integer",
      "required": true,
      "min": 1
    },
    "estado_completado": {
      "type": "boolean",
      "default": false
    },
    "fecha_actualizacion": {
      "type": "datetime",
      "required": false
    },
    "contenido": {
      "type": "component",
      "repeatable": false,
      "component": "proyecto.contenido-hito"
    },
    "proyecto": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::proyecto.proyecto",
      "inversedBy": "hitos"
    }
  }
}
```

---

### **3. Collection Type: `proyecto`**

**Ubicación:** `src/api/proyecto/content-types/proyecto/schema.json`

**Campos:**
```json
{
  "kind": "collectionType",
  "collectionName": "proyectos",
  "info": {
    "singularName": "proyecto",
    "pluralName": "proyectos",
    "displayName": "Proyecto",
    "description": "Proyectos de construcción/remodelación"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "nombre_proyecto": {
      "type": "string",
      "required": true
    },
    "token_nfc": {
      "type": "uid",
      "required": true,
      "unique": true
    },
    "estado_general": {
      "type": "enumeration",
      "enum": ["En Planificación", "En Ejecución", "Completado"],
      "default": "En Planificación"
    },
    "fecha_inicio": {
      "type": "date",
      "required": true
    },
    "ultimo_avance": {
      "type": "text",
      "required": false
    },
    "cliente": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "gerente_proyecto": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "hitos": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::hito.hito",
      "mappedBy": "proyecto"
    }
  }
}
```

---

### **4. Collection Type: `comentario-proyecto`**

**Ubicación:** `src/api/comentario-proyecto/content-types/comentario-proyecto/schema.json`

**Campos:**
```json
{
  "kind": "collectionType",
  "collectionName": "comentarios_proyecto",
  "info": {
    "singularName": "comentario-proyecto",
    "pluralName": "comentarios-proyecto",
    "displayName": "Comentario Proyecto"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "contenido": {
      "type": "text",
      "required": true
    },
    "autor": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "proyecto": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::proyecto.proyecto"
    },
    "es_privado": {
      "type": "boolean",
      "default": false
    }
  }
}
```

---

## 🔐 Autenticación NFC - Endpoint Personalizado

### **Endpoint:** `POST /api/proyectos/auth-nfc`

**Ubicación:** `src/api/proyecto/controllers/proyecto.js`

**Función:**
```javascript
async authNFC(ctx) {
  const { token } = ctx.request.body;

  if (!token) {
    return ctx.badRequest('Token NFC requerido');
  }

  try {
    // Buscar proyecto por token NFC
    const proyecto = await strapi.db.query('api::proyecto.proyecto').findOne({
      where: { token_nfc: token },
      populate: {
        cliente: {
          select: ['id', 'username', 'email']
        },
        gerente_proyecto: {
          select: ['id', 'username', 'email', 'nombre_completo', 'telefono']
        },
        hitos: {
          populate: {
            contenido: {
              populate: ['galeria_fotos', 'videos_walkthrough', 'documentacion']
            }
          },
          orderBy: { orden: 'desc' } // Más reciente primero
        }
      }
    });

    if (!proyecto) {
      return ctx.notFound('Proyecto no encontrado');
    }

    // Calcular progreso
    const totalHitos = proyecto.hitos.length;
    const hitosCompletados = proyecto.hitos.filter(h => h.estado_completado).length;
    const progreso = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 0;

    return {
      proyecto: {
        ...proyecto,
        progreso
      }
    };
  } catch (error) {
    ctx.throw(500, error);
  }
}
```

**Ruta:** `src/api/proyecto/routes/proyecto.js`
```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/proyectos/auth-nfc',
      handler: 'proyecto.authNFC',
      config: {
        auth: false, // Público con token
        policies: [],
        middlewares: [],
      }
    }
  ]
};
```

---

## 📡 Endpoints CRUD para Admin

### **Proyectos**
- `GET /api/proyectos` - Lista proyectos del gerente autenticado
- `POST /api/proyectos` - Crear proyecto (genera token NFC automático)
- `GET /api/proyectos/:id` - Obtener proyecto con hitos
- `PUT /api/proyectos/:id` - Actualizar proyecto
- `DELETE /api/proyectos/:id` - Eliminar proyecto

### **Hitos**
- `POST /api/hitos` - Crear hito
- `PUT /api/hitos/:id` - Actualizar hito
- `DELETE /api/hitos/:id` - Eliminar hito

### **Upload de Archivos**
- `POST /api/upload` - Upload de multimedia (Strapi nativo)

---

## 🔒 Permisos y Roles

### **Rol: Cliente**
- ✅ Acceso vía token NFC (sin autenticación tradicional)
- ✅ Solo puede ver SU proyecto
- ✅ Puede crear comentarios
- ❌ No puede editar nada

### **Rol: Gerente de Proyecto**
- ✅ Ver solo proyectos asignados a él
- ✅ Crear/Editar proyectos
- ✅ Crear/Editar/Eliminar hitos de sus proyectos
- ✅ Upload de archivos
- ✅ Responder comentarios
- ❌ No puede ver proyectos de otros gerentes

### **Rol: Admin**
- ✅ Acceso total a todo

---

## 🛠️ Políticas Personalizadas

### **Policy: `isProjectManager`**
**Ubicación:** `src/api/proyecto/policies/is-project-manager.js`

```javascript
module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const projectId = policyContext.params.id;

  if (!user) {
    return false;
  }

  // Admin puede todo
  if (user.role.type === 'admin') {
    return true;
  }

  // Verificar si es gerente del proyecto
  const proyecto = await strapi.db.query('api::proyecto.proyecto').findOne({
    where: { id: projectId },
    populate: ['gerente_proyecto']
  });

  return proyecto?.gerente_proyecto?.id === user.id;
};
```

---

## 📊 Lifecycles - Auto-generación Token NFC

### **Lifecycle: `beforeCreate` en Proyecto**
**Ubicación:** `src/api/proyecto/content-types/proyecto/lifecycles.js`

```javascript
const { nanoid } = require('nanoid');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Si no tiene token, generar uno único
    if (!data.token_nfc) {
      data.token_nfc = nanoid(16); // Ej: "xYz123AbC456DeFg"
    }
  },
  
  async afterCreate(event) {
    const { result } = event;
    
    // Crear 7 hitos predeterminados
    const hitosIniciales = [
      { nombre: 'Conceptualización (Diseño)', orden: 1 },
      { nombre: 'Planificación (Técnico)', orden: 2 },
      { nombre: 'Visualización 3D', orden: 3 },
      { nombre: 'Adquisición de Materiales', orden: 4 },
      { nombre: 'Ejecución (Obra Gris)', orden: 5 },
      { nombre: 'Acabados y Decoración', orden: 6 },
      { nombre: 'Entrega Final', orden: 7 }
    ];
    
    for (const hito of hitosIniciales) {
      await strapi.db.query('api::hito.hito').create({
        data: {
          ...hito,
          proyecto: result.id,
          estado_completado: false
        }
      });
    }
  }
};
```

---

## 📦 Dependencias Adicionales

```bash
npm install nanoid
```

---

## 🔄 Orden de Implementación

### **Fase 1: Estructura Base**
1. ✅ Crear componente `contenido-hito`
2. ✅ Crear collection `hito`
3. ✅ Crear collection `proyecto`
4. ✅ Crear collection `comentario-proyecto`

### **Fase 2: Lógica de Negocio**
5. ✅ Implementar lifecycle de auto-generación token + hitos
6. ✅ Crear endpoint `auth-nfc`
7. ✅ Crear policy `isProjectManager`

### **Fase 3: Permisos**
8. ✅ Configurar roles y permisos en Strapi Admin
9. ✅ Probar endpoints con diferentes roles

### **Fase 4: Integración Frontend**
10. ✅ Crear service de API en frontend
11. ✅ Conectar vista cliente con endpoint NFC
12. ✅ Conectar admin con CRUD de proyectos/hitos
13. ✅ Implementar upload de archivos

---

## 🎯 Próximos Pasos Inmediatos

1. **Crear el componente `contenido-hito`** vía Strapi Admin o CLI
2. **Crear las collections** `proyecto`, `hito`, `comentario-proyecto`
3. **Configurar relaciones** entre collections
4. **Implementar el endpoint de autenticación NFC**
5. **Configurar permisos** para los diferentes roles

---

## 📝 Notas Importantes

- **Token NFC único:** Usar `nanoid` para generar tokens seguros
- **Upload de archivos:** Strapi ya tiene provider integrado, solo configurar límites
- **Cloudinary/S3:** Recomendado para producción (configurar en `config/plugins.js`)
- **Progreso calculado:** No guardarlo en BD, calcularlo dinámicamente
- **Orden de hitos:** Siempre devolver ordenados DESC para que más reciente esté primero
- **Rich Text:** El campo `descripcion_avance` puede tener HTML básico

---

¿Empezamos con la creación de las collections en Strapi? 🚀
