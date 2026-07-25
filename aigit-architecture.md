# AI-Git — Arquitectura del Sistema

## Analogía Web → Nuestro Sistema

| Web (tú conoces) | AI-Git |
|---|---|
| Frontend React | **CLI** + **VSCode Extension** (interfaces de usuario) |
| Backend API REST | **@aigit/core** (lógica de negocio compartida) |
| Base de datos | Archivos **JSON** en `~/.aigit/` + `.aigit.json` |
| Servicios externos | **OpenAI / Claude / Ollama** (IA) |

## Estructura del Monorepo

```
aigit/
├── package.json              # Monorepo root (workspaces)
├── turbo.json                # Build orchestrator (Turborepo)
├── packages/
│   ├── core/                 # @aigit/core — Núcleo compartido
│   │   ├── src/
│   │   │   ├── git/          # Operaciones git (diff, log, status)
│   │   │   ├── ai/           # Proveedores de IA (OpenAI, Claude, Ollama)
│   │   │   ├── analyzer/     # Analizador AST del repositorio
│   │   │   ├── documentator/ # Generador/actualizador de README
│   │   │   ├── commit/       # Generador de commits
│   │   │   ├── config/       # Manejo de configuración
│   │   │   ├── memory/       # Memoria de contexto del proyecto
│   │   │   └── utils/        # Utilidades compartidas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/                  # @aigit/cli — Interfaz de línea de comandos
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── commit.ts       # aigit commit
│   │   │   │   ├── doc.ts          # aigit doc
│   │   │   │   ├── init.ts         # aigit init
│   │   │   │   └── hook.ts         # aigit hook (instalar pre-commit)
│   │   │   ├── prompts/           # Prompts interactivos (input del usuario)
│   │   │   ├── output/            # Formateo de salida (colores, tablas)
│   │   │   └── index.ts           # Entry point (comander)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── vscode/               # @aigit/vscode — Extensión de VSCode
│       ├── src/
│       │   ├── extension.ts       # Entry point (activate/deactivate)
│       │   ├── commands/          # Comandos VSCode
│       │   ├── views/             # WebViews (dashboard, doc preview)
│       │   ├── git/               # Integración con vscode.git API
│       │   └── treeView/          # Actividad en árbol (Source Control view)
│       ├── media/                 # Assets (HTML/CSS para WebViews)
│       ├── package.json           # Manifiesto de extensión VSCode
│       └── tsconfig.json
```

## ¿Por qué 3 paquetes?

### @aigit/core
- **Todo lo que no depende de la interfaz de usuario** vive aquí.
- Lógica de git, comunicación con IA, análisis de código, generación de documentos.
- Es una librería pura: sin IO de terminal, sin APIs de VSCode.
- **Se prueba con tests unitarios** (Vitest).
- **Se reutiliza** en CLI y VSCode extension — esto es CLAVE para no duplicar código.

### @aigit/cli
- **Capa delgada** que envuelve core con una interfaz de terminal.
- Usa `commander` (como Express para rutas, pero para comandos).
- Comandos planos: `aigit commit`, `aigit doc`, `aigit init`.
- Ideal para CI/CD, hooks de git (pre-commit), devs que no usan VSCode.

### @aigit/vscode
- **Capa delgada** que envuelve core con APIs de VSCode.
- Se publica en **VS Code Marketplace**.
- Comandos desde la paleta (`Ctrl+Shift+P`), botones en Source Control, WebViews.
- Ideal para devs que usan VSCode (la mayoría).

## ¿Cómo se relacionan?

```
CLI (@aigit/cli) ─────▶ @aigit/core ◀───── VSCode Extension (@aigit/vscode)
                              │
                              ▼
                    OpenAI / Claude / Ollama
```

`core` no sabe si lo está llamando un terminal o una extensión. Solo recibe datos y devuelve datos.

## Flujo: Generación de Commit

```
1. Usuario hace cambios en archivos
2. Usuario ejecuta: aigit commit  (o botón en VSCode)
3. CLI/Extensión llama a core.getDiff()
4. core usa isomorphic-git para obtener el diff
5. core construye un prompt contextual:
     - Diff de archivos modificados
     - Tipo de proyecto (detectado por package.json, Cargo.toml, etc.)
     - Historial de últimos commits (para mantener estilo)
     - Variables de entorno detectadas
6. core envía prompt a OpenAI/Claude
7. core recibe respuesta y la parsea
8. CLI/Extensión muestra al usuario el commit sugerido
9. Usuario acepta, edita o rechaza
10. Si acepta: core ejecuta git commit -m "..."
```

## Flujo: AI Documentator

```
1. Usuario ejecuta: aigit doc  (o botón en VSCode)
2. CLI/Extensión llama a core.analyzeRepository()
3. core recorre el repositorio y ejecuta analizadores:
     - package.json → detecta dependencias, scripts, framework
     - tsconfig.json / .babelrc / vite.config → configuración
     - .env.example / .env → variables de entorno
     - src/**/*.ts → AST con ts-morph → entidades, servicios, endpoints
     - Prisma/schema → modelos de base de datos
     - Dockerfile, docker-compose → infraestructura
     - CI/CD configs → pipelines
4. core construye un árbol de conocimiento del proyecto
5. core lee README.md existente (si hay)
6. core construye prompt:
     - Árbol de conocimiento
     - README actual (si existe)
     - Instrucciones de formato
7. core envía a IA y recibe el README generado/actualizado
8. core escribe README.md y guarda metadatos en .aigit/memory.json
9. La memoria guarda qué secciones generó para respetarlas en futuras actualizaciones
```

## ¿Qué es un "WebView" en VSCode?

Es como un **iframe** dentro de VSCode. Puedes meter HTML/CSS/JS puro. Para un dev web:

```
WebView = React app tiny que corre dentro de VSCode
         → se comunica con la extensión via postMessage
         → la extensión se comunica con core
```

Así que podrías incluso construir la UI del dashboard con React si te sientes más cómodo.

## Configuración

```
~/.aigit/config.json           → Config global del usuario
  { "aiProvider": "openai",
    "apiKey": "...",
    "model": "gpt-4",
    "language": "es",
    "commitStyle": "conventional" }

~/proyecto/.aigit.json        → Config por proyecto
  { "commitScopes": ["api", "ui", "db"],
    "generateDocumentation": true,
    "sections": ["instalacion", "uso", "api"] }

~/proyecto/.aigit/memory.json  → Memoria del proyecto (autogenerado)
  { "lastDocumentationUpdate": "2026-07-24",
    "documentedSections": ["instalacion", "api"],
    "omittedSections": ["deploy"],
    "commitHistory": ["feat: ...", "fix: ..."] }
```

## Stack concreto

```
Runtime:          Node.js 20+ (LTS)
Language:         TypeScript 5.x
Monorepo:         pnpm workspaces + Turborepo
CLI Framework:    commander + inquirer + chalk
Git:              isomorphic-git (CLI) / vscode.git API (extension)
IA:               OpenAI SDK + Anthropic SDK + Ollama (langchain como wrapper opcional)
AST:              ts-morph + @babel/parser + tree-sitter
Testing:          Vitest
Build:            tsup (CLI) / esbuild (extension via vscode-test)
Lint:             Biome (antes ESLint + Prettier)
Package:          npm + vsce
```

## ¿Por qué este stack?

1. **TypeScript** — tipado evita errores, mismo lenguaje que web
2. **pnpm + Turborepo** — builds paralelos, caching inteligente
3. **isomorphic-git** — funciona en Node y browser (para WebViews si es necesario)
4. **commander** — como Express pero para CLI, declarativo, fácil
5. **inquirer** — prompts interactivos en terminal (como formularios)
6. **chalk** — colores en terminal
7. **ts-morph** — wrapper tipado sobre el compilador de TS, fácil de usar
8. **biome** — todo en uno (formatter + linter), más rápido que ESLint

## Plan de desarrollo progresivo para un dev web

### Fase 1: Core + CLI (solo terminal)
1. `pnpm init` monorepo
2. Crear `@aigit/core`: solo `getDiff()` + `generateCommit()` con OpenAI mock
3. Crear `@aigit/cli`: solo `aigit commit` que llama a core
4. Probar manualmente en cualquier repo

### Fase 2: IA real
5. Conectar OpenAI real
6. Implementar multi-proveedor (Claude, Ollama)
7. Prompt engineering fino

### Fase 3: Documentator
8. `analyzeRepository()` — analiza estructura del proyecto
9. `generateReadme()` — prompt + parseo
10. `updateReadme()` — merge con README existente + memoria

### Fase 4: VSCode Extension
11. Crear extensión mínima que ejecuta comandos del CLI
12. WebView dashboard
13. Integración con Source Control (git panel)

### Fase 5: Pulir
14. Pre-commit hook (husky)
15. CI/CD action (GitHub Actions)
16. Publicar en npm + Marketplace