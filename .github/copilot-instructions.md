# Copilot Instructions for OCM Angular Project

You are an expert in TypeScript, Angular 20, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Overview

- This is a large Angular 20+ monorepo using modern Angular features (signals, `input()`, injectors, standalone components).
- The main app is under `src/app/` with a strong separation between commons (reusable components), layouts, pages, and services.
- Data flows through Angular services, many of which use signals and RxJS for reactivity.
- The project uses strict TypeScript and SCSS for styles.

## Key Architectural Patterns

- **Signals & Modern Inputs:** Most components use `input<T>()` and signals instead of classic `@Input()`. Prefer signals and computed signals for state and derived values.
- **Dependency Injection:** Use `inject(Service)` for service access, not constructor injection.
- **Standalone Components:** Many components are declared as `standalone: true` for modularity and lazy loading.
- **Service Boundaries:** Business/data logic is in `src/app/services/`. UI logic is in `commons/components/` and `pages/`.
- **Routing:** Uses Angular Router with feature modules and route-based code splitting.

## Developer Workflows

- **Start Dev Server:** `ng serve` (see README)
- **Build:** `ng build`
- **Unit Tests:** `ng test`
- **Lint:** Run `npx eslint .` (uses `eslint.config.js`)
- **Format:** Use Prettier for code formatting (if configured)

## Project-Specific Conventions

- **Inputs:** Use `input<T>()` and signals for all new components. Only use `@Input()` for legacy compatibility.
- **State:** Prefer signals and computed signals for all local and derived state.
- **Services:** Always inject with `inject(Service)`.
- **SCSS:** Styles are modular, with shared variables/mixins in `src/styles/`.
- **Testing:** Unit tests are colocated with components/services (if present).
- **Assets:** Static assets are under `src/assets/`.

## Integration & Communication

- **Cross-component communication:** Use Angular services and signals, not event emitters or outputs, for shared state.
- **External APIs:** Some services (e.g., `SupabaseService`) handle API/data access.
- **Guards/Resolvers:** Use for route protection and data preloading.

## Examples

- See `src/app/commons/components/card-menu/card-menu.component.ts` for a modern signal-based component.
- See `src/app/services/` for service patterns and cross-component state.

## Key Files/Directories

- `src/app/commons/components/` — Reusable UI components
- `src/app/services/` — Data/business logic
- `src/styles/` — Shared SCSS
- `angular.json`, `tsconfig.json`, `eslint.config.js` — Project config
- Siempre usaré los paths de alias definidos en tu tsconfig.json (por ejemplo, @interfaces, @commons, etc.) para los imports en el proyecto

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the any type; use unknown when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Don't use explicit standalone: true (it is implied by default)
- Use signals for state management
- Implement lazy loading for feature routes
- Use NgOptimizedImage for all static images.

## Components

- Keep components small and focused on a single responsibility
- Use input() and output() functions instead of decorators
- Use computed() for derived state
<!-- - Set changeDetection: ChangeDetectionStrategy.OnPush in @Component decorator -->
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use ngClass, use class bindings instead
- DO NOT use ngStyle, use style bindings instead

## State Management

- Use signals for local component state
- Use computed() for derived state
- Keep state transformations pure and predictable

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (@if, @for, @switch) instead of *ngIf, *ngFor, \*ngSwitch
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the providedIn: 'root' option for singleton services
- Use the inject() function instead of constructor injection

## Zoneless

visita [Zoneless Angular](https://angular.io/guide/zoneless) para más información sobre cómo trabajar sin Zone.js.

---

For more details, see the [README.md](../README.md).

> If you are an AI agent, always use signals and `input()` for new code, prefer injectors, and follow the modular/standalone component pattern. When in doubt, look for examples in `commons/components/` and `services/`.
