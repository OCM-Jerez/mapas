# Mapas - Modern Angular 20 Application

A modern, optimized Angular 20 application for visualizing population data and census sections with interactive maps using Leaflet.js.

## 🚀 Key Optimizations Implemented

### ✨ Modern Angular 20 Features
- **Signals**: Implemented reactive signals throughout the application for better performance and change detection
- **Zoneless Change Detection**: Enabled `provideZonelessChangeDetection()` for optimal performance
- **New Control Flow**: Using `@if`, `@else` instead of `*ngIf`, `*ngFor` 
- **Standalone Components**: All components are standalone with proper imports
- **Injectable Services**: Using `inject()` function instead of constructor injection

### 🏗️ Architecture Improvements
- **Path Aliases**: Added TypeScript path mapping for cleaner imports (`@app/*`, `@services/*`, etc.)
- **Service Layer**: Created dedicated services for state management and data processing
- **Interface Definitions**: Strong typing with comprehensive TypeScript interfaces
- **Component Structure**: Organized components into logical directories (`commons`, `pages`, `layouts`)

### 📊 State Management
- **Signal-based State**: `MapStateService` using signals for reactive state management
- **Computed Signals**: Derived state using `computed()` for optimal reactivity
- **Immutable Updates**: Using `signal.update()` for state changes

### 🎯 Performance Optimizations
- **Lazy Loading**: Routes configured with lazy-loaded components
- **Tree Shaking**: Optimized imports and standalone components for smaller bundles
- **Data Processing**: Centralized data processing in services with memoization
- **Memory Management**: Proper cleanup and reference management for map instances

### 🛠️ Code Quality
- **Modern Syntax**: Using arrow functions, destructuring, and modern ES6+ features
- **Type Safety**: Comprehensive TypeScript interfaces and strict typing
- **Separation of Concerns**: Clear separation between presentation and business logic
- **DRY Principle**: Reusable components and utilities

## 📁 Project Structure

```
src/
├── app/
│   ├── commons/           # Reusable components
│   │   └── components/    # Shared UI components
│   ├── interfaces/        # TypeScript interfaces
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── services/          # Business logic services
│   ├── map*/              # Map-related components
│   └── styles/            # Global styles with Sass
├── assets/
│   ├── data/              # JSON data files
│   └── img/               # Images and icons
└── styles/                # Sass stylesheets
```

## 🔧 Technologies Used

- **Angular 20** - Latest version with modern features
- **TypeScript 5.8** - Strong typing and modern JavaScript
- **Leaflet.js** - Interactive maps
- **RxJS 7.8** - Reactive programming
- **Sass/SCSS** - Advanced styling
- **ESLint + Prettier** - Code quality and formatting

## 📋 Key Components

### MapStateService
Central state management using signals:
```typescript
readonly currentMap = this._currentMap.asReadonly();
readonly isVariationMap = computed(() => this._currentMap() === 'variation');
```

### MapDataService  
Data processing and management:
```typescript
createVariationMap(): Record<string, VariationData>
filterValidFeatures(): SectionFeature[]
```

### Modern Component Pattern
```typescript
@Component({
  selector: 'app-example',
  template: `@if (showContent()) { <div>Content</div> }`,
  imports: [CommonModule]
})
export class ExampleComponent {
  readonly showContent = signal(true);
}
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development server:**
   ```bash
   npm run start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Linting and formatting:**
   ```bash
   npm run lint
   npm run format
   ```

## 🎯 Features

- **Interactive Maps**: Multiple map views with Leaflet.js integration
- **Population Data Visualization**: Census section analysis with population variations
- **Responsive Design**: Mobile-first responsive layout
- **Performance Optimized**: Fast loading and smooth interactions
- **Type Safe**: Comprehensive TypeScript coverage
- **Modern Architecture**: Following Angular best practices

## 📈 Performance Benefits

- ⚡ **Faster Change Detection**: Zoneless architecture reduces overhead
- 🎯 **Smaller Bundle Size**: Tree-shaking and lazy loading
- 🔄 **Better Reactivity**: Signals provide fine-grained updates  
- 💾 **Memory Efficiency**: Proper cleanup and reference management
- 🚀 **Improved Developer Experience**: Better tooling and type safety

## 📝 Development Notes

The application has been fully optimized following Angular 20 best practices:
- All components converted to use signals
- Zoneless change detection enabled
- Path aliases configured for cleaner imports
- Service layer architecture implemented
- Modern control flow syntax adopted
- TypeScript interfaces for all data structures

## 🤝 Contributing

When contributing to this project, please maintain the established patterns:
- Use signals for reactive state
- Implement proper TypeScript typing
- Follow the established folder structure
- Use the `inject()` function for dependency injection
- Write standalone components with explicit imports
