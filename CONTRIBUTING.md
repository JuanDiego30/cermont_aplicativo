# 🤝 Guía de Contribución - CERMONT ATG

¡Gracias por tu interés en contribuir a CERMONT ATG! Esta guía te ayudará a entender cómo puedes aportar al proyecto.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Reportar Bugs](#reportar-bugs)
4. [Solicitar Features](#solicitar-features)
5. [Pull Requests](#pull-requests)
6. [Estándares de Código](#estándares-de-código)
7. [Commits](#commits)
8. [Review Process](#review-process)

---

## 📜 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en este proyecto una experiencia libre de acoso para todos, independientemente de la edad, tamaño corporal, discapacidad, etnia, identidad y expresión de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Respetar los diferentes puntos de vista
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad

---

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/cermont_aplicativo.git
cd cermont_aplicativo

# Añade el repositorio original como upstream
git remote add upstream https://github.com/JuanDiego30/cermont_aplicativo.git
```

### 2. Configurar Entorno

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env

# Inicializar base de datos
npm run db:seed

# Verificar que todo funciona
npm run dev
```

### 3. Crear Branch

```bash
# Actualizar develop
git checkout develop
git pull upstream develop

# Crear branch para tu feature/fix
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Busca en los issues existentes para ver si ya fue reportado
2. Verifica que estás usando la última versión
3. Intenta reproducir el bug en un entorno limpio

### Cómo Reportar

Abre un issue con la plantilla de bug y proporciona:

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver el error

## Comportamiento Esperado
Qué esperabas que sucediera.

## Comportamiento Actual
Qué sucedió realmente.

## Screenshots
Si aplica, añade capturas de pantalla.

## Entorno
- OS: [ej. Windows 11]
- Browser: [ej. Chrome 120]
- Node.js: [ej. 20.10.0]
- Versión del proyecto: [ej. 1.2.0]

## Logs
```
Pega cualquier log relevante aquí
```
```

---

## 💡 Solicitar Features

### Antes de Solicitar

1. Busca en los issues para ver si ya fue solicitado
2. Considera si la feature encaja con el alcance del proyecto

### Cómo Solicitar

```markdown
## Resumen
Descripción breve de la feature.

## Motivación
¿Por qué es necesaria esta feature?

## Solución Propuesta
Cómo crees que debería implementarse.

## Alternativas Consideradas
Otras soluciones que consideraste.

## Contexto Adicional
Cualquier otra información relevante.
```

---

## 🔀 Pull Requests

### Proceso

1. **Actualiza tu fork**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Haz tus cambios**
   - Sigue los [estándares de código](#estándares-de-código)
   - Añade tests si es necesario
   - Actualiza documentación si aplica

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: añadir nueva funcionalidad"
   ```

4. **Push**
   ```bash
   git push origin feature/tu-feature
   ```

5. **Abre Pull Request**
   - Usa la plantilla de PR
   - Describe los cambios claramente
   - Referencia cualquier issue relacionado

### Plantilla de PR

```markdown
## Descripción
Resumen de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación
- [ ] Refactoring

## ¿Cómo se ha probado?
Describe las pruebas que realizaste.

## Checklist
- [ ] Mi código sigue las guías de estilo del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He añadido tests que prueban que mi fix/feature funciona
- [ ] Los tests existentes pasan localmente

## Screenshots (si aplica)
```

---

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Bien
interface UserProps {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

function createUser(props: UserProps): User {
  // ...
}

// ❌ Mal
function createUser(props: any) {
  // ...
}
```

### React Components

```tsx
// ✅ Bien - Componente funcional con tipos
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ Mal - Sin tipos, lógica mezclada
export default function Button(props) {
  const data = fetch('/api/something'); // No mezclar fetching con UI
  return <button {...props} />;
}
```

### CSS/Tailwind

```tsx
// ✅ Bien - Clases organizadas
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  hover:shadow-md transition-shadow
">

// ❌ Mal - Clases desordenadas
<div className="border-gray-200 p-4 flex hover:shadow-md bg-white items-center dark:bg-gray-900">
```

### Backend

```typescript
// ✅ Bien - Separación de responsabilidades
// Controller
getAll = asyncHandler(async (req: Request, res: Response) => {
  const users = await this.userService.findAll();
  res.json({ success: true, data: users });
});

// Service
async findAll(): Promise<User[]> {
  return this.userRepository.findAll();
}

// ❌ Mal - Todo mezclado en controller
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

---

## 📝 Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[notas de pie opcionales]
```

### Tipos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formateo, espacios, etc. (no afecta código) |
| `refactor` | Refactorización de código |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de rendimiento |

### Ejemplos

```bash
feat(orders): añadir filtro por estado

fix(auth): corregir validación de token expirado

docs: actualizar guía de instalación

refactor(dashboard): extraer métricas a componente separado

test(users): añadir tests para UserService.create

chore: actualizar dependencias
```

---

## 👀 Review Process

### Para Reviewers

1. **Funcionalidad**: ¿El código hace lo que dice?
2. **Tests**: ¿Hay tests adecuados?
3. **Documentación**: ¿Está documentado?
4. **Estilo**: ¿Sigue las convenciones?
5. **Performance**: ¿Hay problemas de rendimiento?
6. **Seguridad**: ¿Hay vulnerabilidades?

### Comentarios

- Sé constructivo y respetuoso
- Explica el "por qué" de tus sugerencias
- Usa "nit:" para sugerencias menores opcionales
- Aprueba cuando esté listo, no busques la perfección

### Timeline

- PRs serán revisados en 1-3 días hábiles
- Cambios menores: merge rápido
- Cambios grandes: pueden requerir múltiples reviews

---

## 🎉 ¡Gracias!

Tu contribución hace que CERMONT ATG sea mejor para todos. ¡Gracias por ser parte de la comunidad!

---

*¿Preguntas? Abre un issue o contacta al equipo de desarrollo.*
