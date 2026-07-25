# Fase 1 — Requerimientos (Core + CLI)

## Objetivo: CLI funcional en terminal que genere commits con IA

---

### Requerimientos Funcionales

#### RF-01: Inicialización del proyecto
```
Como: Usuario
Quiero: Ejecutar aigit init en mi repositorio
Para: Que se cree el archivo .aigit.json con configuración por defecto

Criterios de aceptación:
- Crea .aigit.json en la raíz del proyecto
- Pregunta al usuario: proveedor IA (gemini/groq/ollama), idioma, estilo de commit
- Valida que el directorio sea un repositorio git válido
- Si ya existe .aigit.json, preguntar si sobrescribe
```

#### RF-02: Detectar cambios Git
```
Como: Usuario
Quiero: Que la herramienta detecte archivos modificados, staged y no staged
Para: Saber qué cambios se van a commitear

Criterios de aceptación:
- Obtener diff de archivos staged (git diff --cached)
- Si no hay staged, obtener diff de archivos modificados (git diff)
- Mostrar resumen: N archivos modificados, N archivos nuevos, N eliminados
- Ignorar archivos en .gitignore
```

#### RF-03: Generar commit con IA (Gemini/Groq/Ollama)
```
Como: Usuario
Quiero: Ejecutar aigit commit y que la IA genere un mensaje de commit
Para: No escribir commits genéricos

Criterios de aceptación:
- Construye prompt con: diff, tipo de proyecto, historial de últimos 5 commits
- Envía a proveedor IA configurado
- Soporta: Gemini API, Groq API, Ollama local
- Muestra el commit sugerido al usuario
- Permite: aceptar (ejecuta git commit), editar (abre editor), rechazar
- Si se rechaza, no ejecuta nada
```

#### RF-04: Modo pre-commit hook
```
Como: Usuario
Quiero: Ejecutar aigit hook --install para instalar un hook de git
Para: Que se genere commit automáticamente en cada "git commit"

Criterios de aceptación:
- Instala hook en .git/hooks/prepare-commit-msg
- El hook ejecuta aigit commit --hook
- Si la IA falla, permite escribir commit manual
```

#### RF-05: Manejo de errores
```
Como: Usuario
Quiero: Mensajes claros cuando algo falla
Para: Saber qué pasó y cómo solucionarlo

Criterios de aceptación:
- Sin conexión a internet → mensaje claro, sugiere modo offline (Ollama)
- API key inválida → mensaje con instrucciones
- No hay cambios → "No hay cambios para comitear"
- Error de git → muestra el error original de git
- Rate limit excedido → espera y reintenta automáticamente
```

---

### Requerimientos No Funcionales

| Código | Requisito |
|---|---|
| RNF-01 | El CLI debe responder en < 5s (sin contar tiempo de IA) |
| RNF-02 | El CLI debe funcionar en Windows, macOS, Linux |
| RNF-03 | Sin dependencias externas que requieran compilación nativa |
| RNF-04 | Config portable: .aigit.json se puede versionar en git |
| RNF-05 | API key se guarda en ~/.aigit/config.json (no se versiona) |
| RNF-06 | Toda llamada a IA tiene timeout configurable (default 30s) |

---

### Estructura del prompt (versión inicial)

```
Eres un asistente que genera mensajes de commit en git.
Sigue Conventional Commits (feat:, fix:, chore:, docs:, refactor:, test:).

Contexto del proyecto:
- Tipo: {tipo_detectado: Node.js, Python, Rust, etc}
- Framework: {framework detectado}
- Últimos commits:
  {historial_5_commits}

Diff de archivos modificados:
{diff}

Genera SOLO el mensaje de commit, sin explicaciones adicionales.
El mensaje debe ser en {idioma}, máximo 72 caracteres el título.
Si hay múltiples cambios, usa un título corto y cuerpo con viñetas.
```

---

### Comandos de la Fase 1

```
aigit init                    → Configuración inicial
aigit commit                  → Genera y aplica commit
aigit commit --stage          → Usa solo staged changes
aigit commit --message "..."  → Provee contexto adicional
aigit commit --hook           → Modo hook (sin prompts interactivos)
aigit hook --install          → Instala pre-commit hook
aigit hook --uninstall        → Remueve pre-commit hook
aigit config                  → Muestra configuración actual
aigit config set <key> <val>  → Cambia un valor de configuración
```

---

### Dependencias específicas (package.json de cada paquete)

#### @aigit/core
```
dependencies:
  isomorphic-git    # Operaciones git en Node
  @google/generative-ai  # Gemini API
  groq-sdk          # Groq API (compatible OpenAI SDK)
  ollama            # Ollama client (o fetch directo)
  zod               # Validación de schemas

devDependencies:
  vitest
  typescript
```

#### @aigit/cli
```
dependencies:
  @aigit/core       # Nuestro core
  commander         # CLI framework
  @clack/prompts    # Prompts interactivos bonitos
  picocolors        # Colores en terminal (ligero)
  conf              # Manejo de config en ~/.aigit/

devDependencies:
  vitest
  typescript
  tsup              # Build para CLI (empaquetar en un solo archivo)
```

---

### Criterios de "Done" para Fase 1

- [ ] `pnpm build` compila ambos paquetes sin errores
- [ ] `aigit init` funciona en cualquier repo git
- [ ] `aigit commit` genera commit con Gemini (gratis)
- [ ] `aigit commit` genera commit con Groq (fallback)
- [ ] `aigit commit` genera commit con Ollama local (offline)
- [ ] `aigit hook --install` + `git commit` genera commit automático
- [ ] Tests unitarios para core (mínimo 80% coverage)
- [ ] Funciona en Windows (nuestro entorno actual)