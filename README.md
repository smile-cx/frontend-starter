# SmileCX Frontend Starter

A minimal, production-ready starter template for building SmileCX-compatible frontend applications with **Stencil**, **Inversify DI**, and **RxJS**. This template demonstrates core patterns used in the SmileCX monorepo and provides a clean foundation for external developers to build custom applications.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Core Patterns](#core-patterns)
  - [Dependency Injection](#dependency-injection)
  - [Reactive State Management](#reactive-state-management)
  - [API Communication](#api-communication)
  - [Logging](#logging)
  - [Internationalization (i18n)](#internationalization-i18n)
  - [Shell vs Application Layer](#shell-vs-application-layer)
- [Building Your Own App](#building-your-own-app)
  - [Step 1: Create Service Module](#step-1-create-service-module)
  - [Step 2: Register Module in Container](#step-2-register-module-in-container)
  - [Step 3: Create App Component](#step-3-create-app-component)
  - [Step 4: Use Service via Container](#step-4-use-service-via-container)
  - [Step 5: Subscribe to Observables](#step-5-subscribe-to-observables)
  - [Step 6: Include App in scx-root](#step-6-include-app-in-scx-root)
- [Testing](#testing)
  - [Writing Tests](#writing-tests)
  - [Test Examples](#test-examples)
  - [Running Tests](#running-tests)
- [Development Workflow](#development-workflow)
  - [Available Scripts](#available-scripts)
  - [Git Hooks](#git-hooks)
  - [Commit Conventions](#commit-conventions)
- [Design System Guide](#design-system-guide)
- [Delivery Workflow for External Developers](#delivery-workflow-for-external-developers)
- [Integrating External Code into Monorepo](#integrating-external-code-into-monorepo)
- [Code Style and Standards](#code-style-and-standards)
  - [TypeScript Configuration](#typescript-configuration)
  - [ESLint Rules](#eslint-rules)
  - [Key Conventions](#key-conventions)
- [FAQ](#faq)

---

## Quick Start

> **For External Developers:** You should **fork** this repository first. See [Delivery Workflow](#delivery-workflow-for-external-developers) for the complete process.

Get up and running in less than 2 minutes:

```bash
# Fork the repository (via GitHub UI or CLI)
gh repo fork smile-cx/smilecx-frontend-starter --clone=true

# Or clone your existing fork
git clone https://github.com/your-org/smilecx-frontend-starter
cd smilecx-frontend-starter

# Install dependencies (requires Node.js 20+ and pnpm 9+)
pnpm install

# Start development server (http://localhost:3336)
pnpm dev
```

Open your browser to `http://localhost:3336` and you'll see the **Outbound Manager** demo application running.

**What you'll see:**

- Container initialization with dependency injection
- Reactive state management with RxJS BehaviorSubjects
- API communication patterns (currently using mock data)
- i18n translation system
- Component lifecycle management

---

## Architecture Overview

This starter uses **Stencil** for web components, **Inversify** for dependency injection, and **RxJS** for reactive state management. It demonstrates SmileCX patterns through a complete example application (Outbound Manager) that shows proper DI container setup, service architecture, and component integration.

### Core Technologies

| Technology     | Version | Purpose                                                       |
| -------------- | ------- | ------------------------------------------------------------- |
| **Stencil**    | 4.38+   | Web Components framework with TypeScript, JSX, and Shadow DOM |
| **Inversify**  | 7.10+   | Dependency Injection container for loose coupling             |
| **RxJS**       | 7.8+    | Reactive state management with BehaviorSubjects               |
| **TypeScript** | 5.9+    | Strict type checking with ES2024 target                       |
| **Sass**       | 3.0+    | CSS preprocessing with BEM methodology                        |
| **debuggo**    | 1.4+    | Namespaced logging for development                            |

**For detailed architectural rationale, design principles, and trade-offs, see [ARCHITECTURE.md](./ARCHITECTURE.md).**

---

## Project Structure

```
smilecx-frontend-starter/
├── src/
│   ├── app-shell/                    # Shell layer (initialization)
│   │   └── scx-root/                 # Root component
│   │       ├── scx-root.tsx          # Container init, app mounting
│   │       ├── scx-root.scss         # Root styles
│   │       ├── scx-root.spec.ts      # Root tests
│   │       └── readme.md             # Component documentation
│   │
│   ├── apps/                         # Application layer (business logic)
│   │   └── outbound-manager/         # Demo app: Outbound campaigns
│   │       ├── outbound.interface.ts # Service interface + types
│   │       ├── outbound.module.ts    # DI module registration
│   │       ├── outbound.service.ts   # Business logic service
│   │       ├── outbound.service.spec.ts  # Service tests
│   │       ├── outbound.types.ts     # DI symbols
│   │       ├── smilecx-outbound-manager.tsx  # UI component
│   │       ├── smilecx-outbound-manager.scss # Component styles
│   │       ├── smilecx-outbound-manager.spec.ts  # Component tests
│   │       └── readme.md             # App documentation
│   │
│   ├── di/                           # Dependency Injection setup
│   │   ├── containers.ts             # Singleton container instance
│   │   ├── starter-container.ts      # Container class with init()
│   │   └── types.ts                  # Shared DI symbols
│   │
│   ├── libs/                         # Shared libraries
│   │   ├── api/                      # HTTP client
│   │   │   ├── api-conf.interface.ts # API configuration
│   │   │   ├── api-fetch.interface.ts # HTTP client interface
│   │   │   ├── api-fetch.ts          # Fetch implementation
│   │   │   ├── api-response.interface.ts # Response type
│   │   │   ├── api.module.ts         # DI module
│   │   │   └── index.ts
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── tt.ts                 # Translation function
│   │   │   └── index.ts
│   │   │
│   │   └── logger/                   # Logging
│   │       ├── logger.interface.ts   # Logger interface + namespaces
│   │       ├── logger.service.ts     # Logger implementation
│   │       ├── logger.module.ts      # DI module
│   │       └── index.ts
│   │
│   ├── global/                       # Global configuration
│   │   ├── global.ts                 # Reflect metadata import
│   │   └── global.scss               # Global styles
│   │
│   ├── pages/                        # HTML pages
│   │   └── index.html                # Dev server entry point
│   │
│   └── components.d.ts               # Generated Stencil types
│
├── .husky/                           # Git hooks
├── commitlint.config.js              # Commit message rules
├── eslint.config.mjs                 # ESLint configuration
├── package.json                      # Dependencies + scripts
├── stencil.config.ts                 # Stencil build configuration
├── tsconfig.json                     # TypeScript configuration
├── .prettierrc.json                  # Prettier configuration
├── .lintstagedrc.js                  # Pre-commit checks
└── README.md                         # This file
```

### Directory Guidelines

- **`app-shell/`**: Contains ONLY the root component (`scx-root`) responsible for container initialization. No business logic.
- **`apps/`**: Each subdirectory represents a complete application with service + component + tests.
- **`di/`**: Centralized DI configuration. Container setup, shared symbols, singleton instance.
- **`libs/`**: Reusable libraries (API client, logging, i18n) that can be shared across apps.
- **`global/`**: Application-wide configuration (Reflect metadata, global styles).

---

## Core Patterns

### Dependency Injection

Inversify provides a powerful DI container for managing service dependencies. All services are registered in **modules** and accessed via the **container**.

#### **DI Symbols**

Use `Symbol.for()` to create unique identifiers for service bindings:

```typescript
// src/di/types.ts (shared symbols)
export const LOGGER_TYPES = {
  Logger: Symbol.for('Logger'),
};

export const API_TYPES = {
  ApiConf: Symbol.for('ApiConf'),
  ApiFetch: Symbol.for('ApiFetch'),
};

// src/apps/outbound-manager/outbound.types.ts (app-specific symbols)
export const OUTBOUND_TYPES = {
  OutboundService: Symbol.for('OutboundService'),
};
```

**IMPORTANT:** Always use `Symbol.for()`, never strings. This enables proper type inference and prevents collisions.

#### **Service Definition**

Mark services with `@injectable()` decorator and inject dependencies via constructor:

```typescript
import { inject, injectable } from 'inversify';
import { API_TYPES, LOGGER_TYPES } from '../../di/types';
import type { IApiFetch } from '../../libs/api';
import type { ILogger } from '../../libs/logger';

@injectable()
export class OutboundService implements IOutboundService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);

  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    this.logger.log('OutboundService initialized');
  }

  async loadCampaigns(): Promise<void> {
    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');
    // ... handle response
  }
}
```

#### **Module Registration**

Create a module to register services with the container:

```typescript
// src/apps/outbound-manager/outbound.module.ts
import { ContainerModule } from 'inversify';
import type { IOutboundService } from './outbound.interface';
import { OutboundService } from './outbound.service';
import { OUTBOUND_TYPES } from './outbound.types';

export const outboundModule = new ContainerModule((bind) => {
  bind<IOutboundService>(OUTBOUND_TYPES.OutboundService).to(OutboundService).inSingletonScope();
});
```

#### **Container Setup**

The `StarterContainer` class loads modules in dependency order:

```typescript
// src/di/starter-container.ts
export class StarterContainer extends Container {
  async init(options: { apiBaseUrl: string }): Promise<void> {
    // 1. Load Logger module (no dependencies)
    this.load(loggerModule);

    // 2. Load API module with configuration
    const apiModule = createApiModule({ apiUrl: options.apiBaseUrl });
    this.load(apiModule);

    // 3. Load Outbound module (depends on Logger + API)
    this.load(outboundModule);

    this.initialized = true;
  }

  // Convenience getter for type-safe access
  get outbound(): IOutboundService {
    return this.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
  }
}
```

#### **Container Usage in Components**

Access services via container getters, **NEVER** via `@Prop()` injection:

```typescript
import { starter } from '../../di/containers';

@Component({ tag: 'smilecx-outbound-manager' })
export class SmilecxOutboundManager implements ComponentInterface {
  componentWillLoad() {
    // ✅ CORRECT: Access service via container getter
    const service = starter.outbound;
    service.loadCampaigns();
  }
}
```

**Anti-pattern (DO NOT USE):**

```typescript
// ❌ WRONG: Never inject services as @Prop()
@Prop() service!: IOutboundService; // This breaks encapsulation
```

---

### Reactive State Management

RxJS `BehaviorSubject` is the primary state container. Services expose observables, components subscribe and update local `@State`.

#### **Service Side: Expose BehaviorSubjects**

```typescript
import { BehaviorSubject } from 'rxjs';

@injectable()
export class OutboundService implements IOutboundService {
  // Public observables for component subscriptions
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  selectedCampaign$ = new BehaviorSubject<Campaign | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);

  async loadCampaigns(): Promise<void> {
    this.loading$.next(true); // Emit loading state

    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data); // Emit new data
    } else {
      this.campaigns$.next([]); // Emit empty array on error
    }

    this.loading$.next(false); // Clear loading state
  }

  selectCampaign(id: string): void {
    const campaign = this.campaigns$.value.find((c) => c.id === id);
    this.selectedCampaign$.next(campaign || null); // Emit selected campaign
  }
}
```

#### **Component Side: Subscribe to Observables**

```typescript
import { Component, State, h } from '@stencil/core';
import type { ComponentInterface } from '@stencil/core';
import { Subscription } from 'rxjs';
import { starter } from '../../di/containers';

@Component({ tag: 'smilecx-outbound-manager' })
export class SmilecxOutboundManager implements ComponentInterface {
  // Local state mirrors observable values
  @State() campaigns: Campaign[] = [];
  @State() selectedCampaign: Campaign | null = null;
  @State() loading = false;

  // Track subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    const service = starter.outbound;

    // Subscribe to campaigns
    this.subscriptions.push(
      service.campaigns$.subscribe(campaigns => {
        this.campaigns = campaigns; // Update @State → triggers re-render
      })
    );

    // Subscribe to selected campaign
    this.subscriptions.push(
      service.selectedCampaign$.subscribe(campaign => {
        this.selectedCampaign = campaign;
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      service.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    // Trigger initial load
    service.loadCampaigns();
  }

  // CRITICAL: Unsubscribe to prevent memory leaks
  disconnectedCallback() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  render() {
    return (
      <Host>
        {this.loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {this.campaigns.map(campaign => (
              <div key={campaign.id}>{campaign.name}</div>
            ))}
          </div>
        )}
      </Host>
    );
  }
}
```

#### **Why BehaviorSubject?**

- **Initial value**: Unlike `Subject`, `BehaviorSubject` always has a current value (e.g., `[]` for empty campaigns).
- **Immediate emission**: New subscribers receive the latest value immediately.
- **Synchronous access**: Use `.value` to read current state without subscribing.

---

### API Communication

The `ApiFetch` service provides standardized HTTP methods with a **non-throwing** promise pattern.

#### **IApiResponse Pattern**

All API methods resolve to `IApiResponse<T>`:

```typescript
export interface IApiResponse<T> {
  ok: boolean; // Success indicator
  status?: number; // HTTP status code
  data?: T; // Response data (on success)
  error?: {
    // Error details (on failure)
    message: string;
    status?: number;
    statusText?: string;
  };
  total?: number; // Pagination: total count
  skipped?: number; // Pagination: offset
  link?: string; // Pagination: next page URL
  serverDateDiff?: number; // Server time difference
}
```

#### **Making API Requests**

```typescript
@injectable()
export class MyService {
  constructor(@inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch) {}

  // GET request
  async loadData(): Promise<void> {
    const response = await this.apiFetch.doGet<MyData[]>('/data');

    if (response.ok && response.data) {
      // Success path
      console.log('Data:', response.data);
    } else {
      // Error path
      console.error('Failed:', response.error?.message);
    }
  }

  // POST request
  async createItem(item: CreateItemDto): Promise<boolean> {
    const response = await this.apiFetch.doPost<MyData>('/data', item);

    if (response.ok && response.data) {
      console.log('Created:', response.data);
      return true;
    } else {
      console.error('Failed:', response.error?.message);
      return false;
    }
  }

  // PUT request
  async updateItem(id: string, updates: Partial<MyData>): Promise<boolean> {
    const response = await this.apiFetch.doPut<MyData>(`/data/${id}`, updates);
    return response.ok;
  }

  // DELETE request
  async deleteItem(id: string): Promise<boolean> {
    const response = await this.apiFetch.doDelete(`/data/${id}`);
    return response.ok;
  }

  // PATCH request (JSON Patch)
  async patchItem(id: string, patches: JSONPatch): Promise<boolean> {
    const response = await this.apiFetch.doPatch<MyData>(`/data/${id}`, patches);
    return response.ok;
  }

  // File upload
  async uploadFile(file: File): Promise<boolean> {
    const response = await this.apiFetch.doPostFile<UploadResult>('/upload', file);
    return response.ok;
  }
}
```

#### **Available Methods**

| Method          | Signature                                                                | Description                   |
| --------------- | ------------------------------------------------------------------------ | ----------------------------- |
| `doGet<T>`      | `(endpoint: string, options?) => Promise<IApiResponse<T>>`               | HTTP GET returning JSON       |
| `doPost<T>`     | `(endpoint: string, body: unknown, signal?) => Promise<IApiResponse<T>>` | HTTP POST with JSON body      |
| `doPut<T>`      | `(endpoint: string, body: unknown) => Promise<IApiResponse<T>>`          | HTTP PUT with JSON body       |
| `doDelete<T>`   | `(endpoint: string) => Promise<IApiResponse<T>>`                         | HTTP DELETE                   |
| `doPatch<T>`    | `(endpoint: string, patches: JSONPatch) => Promise<IApiResponse<T>>`     | HTTP PATCH with JSON Patch    |
| `doPostFile<T>` | `(endpoint: string, file: File) => Promise<IApiResponse<T>>`             | HTTP POST with file upload    |
| `doGetText`     | `(endpoint: string) => Promise<IApiResponse<string>>`                    | HTTP GET returning plain text |

#### **Request Cancellation**

Use `AbortSignal` to cancel requests:

```typescript
const controller = new AbortController();

// Start request
this.apiFetch.doGet<MyData[]>('/data', { signal: controller.signal });

// Cancel request
controller.abort();
```

Auto-cancellation for search/autocomplete:

```typescript
// Use useAbort: true to auto-cancel previous requests
this.apiFetch.doGet<SearchResult[]>('/search?q=query', { useAbort: true });
```

#### **API Configuration**

API base URL is configured during container initialization:

```typescript
// src/app-shell/scx-root/scx-root.tsx
await starter.init({ apiBaseUrl: 'http://localhost:3001/t/acme-corp/v1' });
```

The `ApiFetch` service automatically composes full URLs:

```typescript
// Request: /campaigns
// Full URL: http://localhost:3001/t/acme-corp/v1/campaigns
```

---

### Logging

The `LoggerService` wraps `debuggo` to provide namespaced, filterable logging.

#### **Debug Namespaces**

Define namespaces in `logger.interface.ts`:

```typescript
export enum StarterDebugNamespaces {
  Core = 'core',
  Api = 'api',
  Outbound = 'outbound',
  MyFeature = 'my-feature', // Add your namespace here
}
```

#### **Using Logger in Services**

```typescript
import { inject, injectable } from 'inversify';
import { LOGGER_TYPES } from '../../di/types';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';

@injectable()
export class MyService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.MyFeature);

  constructor(@inject(LOGGER_TYPES.Logger) private loggerService: ILogger) {
    this.logger.log('MyService initialized');
  }

  async doSomething(): Promise<void> {
    this.logger.debug('Starting operation...');

    try {
      // ... operation
      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed:', error);
    }
  }
}
```

#### **Logger Levels**

| Method    | Usage                    | When to Use                             |
| --------- | ------------------------ | --------------------------------------- |
| `debug()` | Detailed diagnostic info | Trace execution flow, log parameters    |
| `log()`   | General information      | Log major operations, state changes     |
| `warn()`  | Warning conditions       | Deprecated features, recoverable errors |
| `error()` | Error conditions         | Unrecoverable errors, exceptions        |

#### **Enabling Logs in Browser**

Open browser console and set `localStorage.debug`:

```javascript
// Enable all SmileCX logs
localStorage.debug = 'smilecx-*';

// Enable specific namespaces
localStorage.debug = 'smilecx-api,smilecx-outbound';

// Enable specific feature
localStorage.debug = 'smilecx-my-feature';

// Disable all logs
localStorage.debug = '';
```

Logs are prefixed with namespace and color-coded for readability:

```
smilecx-api:     GET /campaigns → 200 OK
smilecx-outbound: Loaded 5 campaigns
smilecx-core:    Container initialized
```

---

### Internationalization (i18n)

The `tt()` function provides simple i18n with mustache interpolation.

#### **Adding Translations**

Edit `src/libs/i18n/tt.ts`:

```typescript
const translations: Record<string, Record<string, string>> = {
  en: {
    'SM.MY_FEATURE.TITLE': 'My Feature',
    'SM.MY_FEATURE.WELCOME': 'Welcome, {{name}}!',
    'SM.MY_FEATURE.COUNT': 'You have {{count}} items',
  },
  it: {
    'SM.MY_FEATURE.TITLE': 'La Mia Funzione',
    'SM.MY_FEATURE.WELCOME': 'Benvenuto, {{name}}!',
    'SM.MY_FEATURE.COUNT': 'Hai {{count}} elementi',
  },
};
```

#### **Using Translations**

```typescript
import { tt } from '../../libs/i18n';

@Component({ tag: 'my-feature' })
export class MyFeature {
  @State() userName = 'John';
  @State() itemCount = 5;

  render() {
    return (
      <Host>
        {/* Simple translation */}
        <h1>{tt('SM.MY_FEATURE.TITLE')}</h1>

        {/* Translation with interpolation */}
        <p>{tt('SM.MY_FEATURE.WELCOME', { name: this.userName })}</p>
        <p>{tt('SM.MY_FEATURE.COUNT', { count: this.itemCount.toString() })}</p>
      </Host>
    );
  }
}
```

**Output (English):**

```
My Feature
Welcome, John!
You have 5 items
```

#### **Changing Language**

```typescript
import { getAvailableLanguages, getCurrentLanguage, setLanguage } from '../../libs/i18n';

// Change to Italian
setLanguage('it');

// Get current language
const lang = getCurrentLanguage(); // 'it'

// Get available languages
const langs = getAvailableLanguages(); // ['en', 'it']
```

#### **Translation Key Conventions**

- Prefix with `SM.` (SmileCX)
- Use dot-separated hierarchy: `SM.FEATURE.SECTION.KEY`
- All uppercase for keys (by convention)
- Example: `SM.OUTBOUND.CAMPAIGN.STATUS`

---

### Shell vs Application Layer

The starter template separates **container initialization** (shell) from **business logic** (application).

#### **Shell Layer: scx-root**

**Responsibilities:**

- Initialize DI container with runtime config
- Render loading state during initialization
- Mount application component(s) after initialization

**What it does NOT do:**

- Subscribe to services
- Contain business logic
- Manage application state

```typescript
// src/app-shell/scx-root/scx-root.tsx
@Component({ tag: 'scx-root' })
export class ScxRoot implements ComponentInterface {
  @Prop() apiUrl = '';
  @State() initialized = false;

  async componentWillLoad() {
    // ONLY initialize container
    await starter.init({ apiBaseUrl: this.apiUrl });
    this.initialized = true;
  }

  render() {
    return (
      <Host>
        {this.initialized ? (
          <smilecx-outbound-manager></smilecx-outbound-manager>
        ) : (
          <div class="loading">{tt('SM.SHELL.INITIALIZING')}</div>
        )}
      </Host>
    );
  }
}
```

#### **Application Layer: App Components**

**Responsibilities:**

- Access services via container getters
- Subscribe to service observables
- Manage local component state
- Handle user interactions
- Render UI

```typescript
// src/apps/outbound-manager/smilecx-outbound-manager.tsx
@Component({ tag: 'smilecx-outbound-manager' })
export class SmilecxOutboundManager implements ComponentInterface {
  @State() campaigns: Campaign[] = [];
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    // Access service via container
    const service = starter.outbound;

    // Subscribe to observables
    this.subscriptions.push(
      service.campaigns$.subscribe(campaigns => {
        this.campaigns = campaigns;
      })
    );

    // Load data
    service.loadCampaigns();
  }

  disconnectedCallback() {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  render() {
    return (
      <Host>
        <div class="campaigns">
          {this.campaigns.map(campaign => (
            <div key={campaign.id}>{campaign.name}</div>
          ))}
        </div>
      </Host>
    );
  }
}
```

#### **Why This Separation?**

1. **Single Responsibility**: Shell handles init, apps handle logic.
2. **Testability**: Apps can be tested without full container setup.
3. **Reusability**: Apps can be mounted in different shells (iframe, dialog, etc.).
4. **Clarity**: Clear boundary between infrastructure and business logic.

---

## Building Your Own App

Follow this step-by-step guide to create a new application from scratch. We'll build a **Task Manager** app as an example.

### Step 1: Create Service Module

Create a new directory under `src/apps/` with service files:

```bash
mkdir -p src/apps/task-manager
cd src/apps/task-manager
```

**1.1: Define Types and Interface**

Create `task.interface.ts`:

```typescript
import type { BehaviorSubject } from 'rxjs';

/**
 * Task data model
 */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Task Service Interface
 */
export interface ITaskService {
  // Observables
  tasks$: BehaviorSubject<Task[]>;
  loading$: BehaviorSubject<boolean>;

  // Methods
  loadTasks(): Promise<void>;
  createTask(title: string): Promise<boolean>;
  toggleTask(id: string): Promise<boolean>;
  deleteTask(id: string): Promise<boolean>;
}
```

**1.2: Define DI Symbols**

Create `task.types.ts`:

```typescript
/**
 * Task Module DI Symbols
 */
export const TASK_TYPES = {
  TaskService: Symbol.for('TaskService'),
};
```

**1.3: Implement Service**

Create `task.service.ts`:

```typescript
import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { API_TYPES, LOGGER_TYPES } from '../../di/types';
import type { IApiFetch } from '../../libs/api';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';
import type { ITaskService, Task } from './task.interface';

@injectable()
export class TaskService implements ITaskService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Core);

  // Reactive state
  tasks$ = new BehaviorSubject<Task[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    this.logger.log('TaskService initialized');
  }

  async loadTasks(): Promise<void> {
    this.logger.debug('Loading tasks...');
    this.loading$.next(true);

    try {
      const response = await this.apiFetch.doGet<Task[]>('/tasks');

      if (response.ok && response.data) {
        this.tasks$.next(response.data);
        this.logger.log(`Loaded ${response.data.length} tasks`);
      } else {
        this.logger.error('Failed to load tasks:', response.error?.message);
        this.tasks$.next([]);
      }
    } catch (error) {
      this.logger.error('Unexpected error loading tasks:', error);
      this.tasks$.next([]);
    } finally {
      this.loading$.next(false);
    }
  }

  async createTask(title: string): Promise<boolean> {
    this.logger.debug('Creating task:', title);

    const response = await this.apiFetch.doPost<Task>('/tasks', { title });

    if (response.ok && response.data) {
      const tasks = [...this.tasks$.value, response.data];
      this.tasks$.next(tasks);
      this.logger.log('Task created:', response.data.id);
      return true;
    } else {
      this.logger.error('Failed to create task:', response.error?.message);
      return false;
    }
  }

  async toggleTask(id: string): Promise<boolean> {
    this.logger.debug('Toggling task:', id);

    const task = this.tasks$.value.find((t) => t.id === id);
    if (!task) {
      this.logger.error('Task not found:', id);
      return false;
    }

    const response = await this.apiFetch.doPut<Task>(`/tasks/${id}`, {
      completed: !task.completed,
    });

    if (response.ok && response.data) {
      const tasks = this.tasks$.value.map((t) => (t.id === id ? response.data! : t));
      this.tasks$.next(tasks);
      this.logger.log('Task toggled:', id);
      return true;
    } else {
      this.logger.error('Failed to toggle task:', response.error?.message);
      return false;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    this.logger.debug('Deleting task:', id);

    const response = await this.apiFetch.doDelete(`/tasks/${id}`);

    if (response.ok) {
      const tasks = this.tasks$.value.filter((t) => t.id !== id);
      this.tasks$.next(tasks);
      this.logger.log('Task deleted:', id);
      return true;
    } else {
      this.logger.error('Failed to delete task:', response.error?.message);
      return false;
    }
  }
}
```

**1.4: Create DI Module**

Create `task.module.ts`:

```typescript
import { ContainerModule } from 'inversify';
import type { ITaskService } from './task.interface';
import { TaskService } from './task.service';
import { TASK_TYPES } from './task.types';

/**
 * Task Module
 *
 * Registers TaskService in DI container
 */
export const taskModule = new ContainerModule((bind) => {
  bind<ITaskService>(TASK_TYPES.TaskService).to(TaskService).inSingletonScope();
});
```

---

### Step 2: Register Module in Container

Update `src/di/starter-container.ts` to load your module:

```typescript
import type { ITaskService } from '../apps/task-manager/task.interface';
import { taskModule } from '../apps/task-manager/task.module';
import { TASK_TYPES } from '../apps/task-manager/task.types';

export class StarterContainer extends Container {
  async init(options: { apiBaseUrl: string }): Promise<void> {
    // ... existing module loading

    // Load Task module (depends on Logger + API)
    this.load(taskModule);
    console.log('Task module loaded');

    this.initialized = true;
  }

  // Add convenience getter
  get tasks(): ITaskService {
    return this.get<ITaskService>(TASK_TYPES.TaskService);
  }
}
```

---

### Step 3: Create App Component

Create `smilecx-task-manager.tsx`:

```typescript
import { Component, Host, State, h } from '@stencil/core';
import type { ComponentInterface } from '@stencil/core';
import { Subscription } from 'rxjs';
import { starter } from '../../di/containers';
import { tt } from '../../libs/i18n';
import type { Task } from './task.interface';

@Component({
  tag: 'smilecx-task-manager',
  styleUrl: 'smilecx-task-manager.scss',
  shadow: true,
})
export class SmilecxTaskManager implements ComponentInterface {
  @State() tasks: Task[] = [];
  @State() loading = false;
  @State() newTaskTitle = '';

  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    const service = starter.tasks;

    // Subscribe to tasks
    this.subscriptions.push(
      service.tasks$.subscribe(tasks => {
        this.tasks = tasks;
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      service.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    // Load tasks
    service.loadTasks();
  }

  disconnectedCallback() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.newTaskTitle = target.value;
  };

  private handleCreateTask = async () => {
    if (!this.newTaskTitle.trim()) return;

    const success = await starter.tasks.createTask(this.newTaskTitle);
    if (success) {
      this.newTaskTitle = ''; // Clear input
    }
  };

  private handleToggleTask = async (id: string) => {
    await starter.tasks.toggleTask(id);
  };

  private handleDeleteTask = async (id: string) => {
    await starter.tasks.deleteTask(id);
  };

  render() {
    return (
      <Host>
        <div class="task-manager">
          <h1>{tt('SM.TASKS.TITLE')}</h1>

          {/* Create task form */}
          <div class="create-task">
            <input
              type="text"
              value={this.newTaskTitle}
              onInput={this.handleInputChange}
              placeholder={tt('SM.TASKS.PLACEHOLDER')}
            />
            <button onClick={this.handleCreateTask}>
              {tt('SM.TASKS.CREATE')}
            </button>
          </div>

          {/* Task list */}
          {this.loading ? (
            <div class="loading">{tt('SM.TASKS.LOADING')}</div>
          ) : this.tasks.length === 0 ? (
            <p>{tt('SM.TASKS.NO_TASKS')}</p>
          ) : (
            <ul class="task-list">
              {this.tasks.map(task => (
                <li key={task.id} class={{ completed: task.completed }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => this.handleToggleTask(task.id)}
                  />
                  <span>{task.title}</span>
                  <button
                    class="delete"
                    onClick={() => this.handleDeleteTask(task.id)}
                  >
                    {tt('SM.TASKS.DELETE')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Host>
    );
  }
}
```

---

### Step 4: Use Service via Container

**Access Pattern:**

```typescript
// ✅ CORRECT: Access service via container getter
const service = starter.tasks;
service.loadTasks();

// ✅ CORRECT: Access multiple times
starter.tasks.createTask('New task');
starter.tasks.toggleTask('task-1');

// ❌ WRONG: Never inject as @Prop()
@Prop() taskService!: ITaskService; // DO NOT DO THIS
```

---

### Step 5: Subscribe to Observables

**Lifecycle Pattern:**

```typescript
export class MyComponent implements ComponentInterface {
  @State() tasks: Task[] = [];
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    // Subscribe to observables
    this.subscriptions.push(
      starter.tasks.tasks$.subscribe((tasks) => {
        this.tasks = tasks; // Update @State → triggers re-render
      })
    );

    // Load initial data
    starter.tasks.loadTasks();
  }

  // CRITICAL: Unsubscribe to prevent memory leaks
  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
```

**Common Mistakes:**

```typescript
// ❌ WRONG: Forgetting to unsubscribe
componentWillLoad() {
  starter.tasks.tasks$.subscribe(tasks => {
    this.tasks = tasks;
  });
  // Memory leak! Subscription never cleaned up
}

// ❌ WRONG: Not tracking subscriptions
componentWillLoad() {
  starter.tasks.tasks$.subscribe(tasks => {
    this.tasks = tasks;
  });
  // How will you unsubscribe in disconnectedCallback()?
}

// ✅ CORRECT: Track and unsubscribe
private subscriptions: Subscription[] = [];

componentWillLoad() {
  this.subscriptions.push(
    starter.tasks.tasks$.subscribe(tasks => {
      this.tasks = tasks;
    })
  );
}

disconnectedCallback() {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

---

### Step 6: Include App in scx-root

Update `src/app-shell/scx-root/scx-root.tsx` to mount your app:

```typescript
render() {
  return (
    <Host>
      {this.initialized ? (
        <div class="app-container">
          {/* Existing app */}
          <smilecx-outbound-manager></smilecx-outbound-manager>

          {/* Your new app */}
          <smilecx-task-manager></smilecx-task-manager>
        </div>
      ) : (
        <div class="loading">{tt('SM.SHELL.INITIALIZING')}</div>
      )}
    </Host>
  );
}
```

**Alternative: Conditional Rendering**

```typescript
@Prop() activeApp: 'outbound' | 'tasks' = 'outbound';

render() {
  return (
    <Host>
      {this.initialized ? (
        <div>
          {this.activeApp === 'outbound' && <smilecx-outbound-manager></smilecx-outbound-manager>}
          {this.activeApp === 'tasks' && <smilecx-task-manager></smilecx-task-manager>}
        </div>
      ) : (
        <div class="loading">{tt('SM.SHELL.INITIALIZING')}</div>
      )}
    </Host>
  );
}
```

---

## Testing

Comprehensive testing is built into the starter template using Jest and Stencil's testing utilities.

### Writing Tests

#### **Service Tests**

Service tests use Inversify's DI container with mock dependencies:

```typescript
import { Container } from 'inversify';
import 'reflect-metadata';
import { API_TYPES, LOGGER_TYPES } from '../../di/types';
import type { IApiFetch, IApiResponse } from '../../libs/api';
import type { ILogger } from '../../libs/logger';
import type { Task } from './task.interface';
import { TaskService } from './task.service';
import { TASK_TYPES } from './task.types';

describe('TaskService', () => {
  let container: Container;
  let service: TaskService;
  let mockApiFetch: jest.Mocked<IApiFetch>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Create mock API fetch
    mockApiFetch = {
      doGet: jest.fn(),
      doPost: jest.fn(),
      doPut: jest.fn(),
      doDelete: jest.fn(),
      doPatch: jest.fn(),
      doPostFile: jest.fn(),
      doGetText: jest.fn(),
      getServerDateDiff: jest.fn(),
      composePath: jest.fn(),
    };

    // Create mock logger
    const mockLoggerInstance = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    mockLogger = {
      getLogger: jest.fn().mockReturnValue(mockLoggerInstance),
    };

    // Setup DI container
    container = new Container();
    container.bind(API_TYPES.ApiFetch).toConstantValue(mockApiFetch);
    container.bind(LOGGER_TYPES.Logger).toConstantValue(mockLogger);
    container.bind(TASK_TYPES.TaskService).to(TaskService);

    service = container.get<TaskService>(TASK_TYPES.TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(service.tasks$.value).toEqual([]);
      expect(service.loading$.value).toBe(false);
    });
  });

  describe('loadTasks', () => {
    it('should load tasks successfully', async () => {
      const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01' },
        { id: '2', title: 'Task 2', completed: true, createdAt: '2024-01-02' },
      ];

      const mockResponse: IApiResponse<Task[]> = {
        ok: true,
        status: 200,
        data: mockTasks,
      };

      mockApiFetch.doGet.mockResolvedValue(mockResponse);

      await service.loadTasks();

      expect(mockApiFetch.doGet).toHaveBeenCalledWith('/tasks');
      expect(service.tasks$.value).toEqual(mockTasks);
      expect(service.loading$.value).toBe(false);
    });

    it('should handle API error', async () => {
      const mockResponse: IApiResponse<Task[]> = {
        ok: false,
        status: 500,
        error: { message: 'Server error' },
      };

      mockApiFetch.doGet.mockResolvedValue(mockResponse);

      await service.loadTasks();

      expect(service.tasks$.value).toEqual([]);
      expect(service.loading$.value).toBe(false);
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const newTask: Task = {
        id: '3',
        title: 'New Task',
        completed: false,
        createdAt: '2024-01-03',
      };

      const mockResponse: IApiResponse<Task> = {
        ok: true,
        status: 201,
        data: newTask,
      };

      mockApiFetch.doPost.mockResolvedValue(mockResponse);

      const result = await service.createTask('New Task');

      expect(result).toBe(true);
      expect(mockApiFetch.doPost).toHaveBeenCalledWith('/tasks', {
        title: 'New Task',
      });
      expect(service.tasks$.value).toContainEqual(newTask);
    });
  });
});
```

#### **Component Tests**

Component tests use Stencil's `newSpecPage` API:

```typescript
import { newSpecPage } from '@stencil/core/testing';
import { SmilecxTaskManager } from './smilecx-task-manager';

describe('smilecx-task-manager', () => {
  it('should render loading state', async () => {
    const page = await newSpecPage({
      components: [SmilecxTaskManager],
      html: '<smilecx-task-manager></smilecx-task-manager>',
    });

    expect(page.root).toEqualHtml(`
      <smilecx-task-manager>
        <div class="task-manager">
          <h1>Task Manager</h1>
          <div class="loading">Loading tasks...</div>
        </div>
      </smilecx-task-manager>
    `);
  });

  it('should render tasks', async () => {
    const page = await newSpecPage({
      components: [SmilecxTaskManager],
      html: '<smilecx-task-manager></smilecx-task-manager>',
    });

    const component = page.rootInstance as SmilecxTaskManager;
    component.tasks = [{ id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01' }];
    component.loading = false;

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('.task-list')).toBeTruthy();
  });
});
```

---

### Test Examples

The starter includes comprehensive tests for the Outbound service. Key patterns:

**1. Mock Dependencies**

```typescript
// Mock API client
mockApiFetch = {
  doGet: jest.fn(),
  doPost: jest.fn(),
  // ... other methods
};

// Mock logger
const mockLoggerInstance = {
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
mockLogger = {
  getLogger: jest.fn().mockReturnValue(mockLoggerInstance),
};
```

**2. Test Observable Emissions**

```typescript
it('should emit updates to subscribers', async () => {
  const emissions: Task[][] = [];
  service.tasks$.subscribe((tasks) => emissions.push([...tasks]));

  // Trigger load
  mockApiFetch.doGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: mockTasks,
  });

  await service.loadTasks();

  // Verify emissions
  expect(emissions.length).toBeGreaterThan(1);
  expect(emissions[emissions.length - 1]).toEqual(mockTasks);
});
```

**3. Test Loading States**

```typescript
it('should set loading state during request', async () => {
  const loadingStates: boolean[] = [];
  service.loading$.subscribe((loading) => loadingStates.push(loading));

  mockApiFetch.doGet.mockResolvedValue({ ok: true, status: 200, data: [] });

  await service.loadTasks();

  // Should have: initial false, true during load, false after
  expect(loadingStates).toContain(true);
  expect(service.loading$.value).toBe(false);
});
```

**4. Test Error Handling**

```typescript
it('should handle API error gracefully', async () => {
  mockApiFetch.doGet.mockResolvedValue({
    ok: false,
    status: 500,
    error: { message: 'Server error' },
  });

  await service.loadTasks();

  expect(service.tasks$.value).toEqual([]);
  expect(service.loading$.value).toBe(false);
});
```

---

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- task.service.spec.ts
```

**Test Output:**

```
 PASS  src/apps/task-manager/task.service.spec.ts
  TaskService
    initialization
      ✓ should initialize with empty state (5ms)
    loadTasks
      ✓ should load tasks successfully (10ms)
      ✓ should handle API error (8ms)
      ✓ should set loading state during request (12ms)
    createTask
      ✓ should create task successfully (9ms)
      ✓ should handle API error (7ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Time:        2.5s
```

---

## Development Workflow

### Available Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Start development server with hot reload (port 3336) |
| `pnpm build`        | Build production bundle to `dist/`                   |
| `pnpm test`         | Run all tests once                                   |
| `pnpm test:watch`   | Run tests in watch mode                              |
| `pnpm lint`         | Lint codebase with ESLint                            |
| `pnpm lint:fix`     | Auto-fix linting issues                              |
| `pnpm format`       | Format code with Prettier                            |
| `pnpm format:check` | Check code formatting                                |
| `pnpm type-check`   | Run TypeScript type checking                         |
| `pnpm clean`        | Remove build artifacts                               |
| `pnpm commit`       | Interactive commit with Commitizen                   |

### Git Hooks

The starter uses **Husky** + **lint-staged** to enforce quality checks before commits:

**Pre-commit Hook:**

- Runs ESLint with auto-fix on staged TypeScript files
- Runs Prettier on all staged files
- Only processes staged files (fast)

**Commit-msg Hook:**

- Validates commit message format via Commitlint
- Enforces Conventional Commits

**Setup:**

```bash
# Hooks are installed automatically after pnpm install
pnpm install

# Manually install hooks (if needed)
pnpm prepare
```

**Skip Hooks (not recommended):**

```bash
git commit --no-verify -m "emergency fix"
```

---

### Commit Conventions

Use **Conventional Commits** format for all commit messages:

```
<type>(<scope>): <subject>
```

**Examples:**

```bash
# Feature commit
feat(tasks): add task creation functionality

# Bug fix
fix(api): resolve authentication timeout issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(outbound): extract campaign filtering logic

# Tests
test(tasks): add tests for task service

# Chore (dependencies, config)
chore(deps): update stencil to 4.38.3
```

**Commit Types:**

| Type       | Usage                                 |
| ---------- | ------------------------------------- |
| `feat`     | New feature                           |
| `fix`      | Bug fix                               |
| `docs`     | Documentation changes                 |
| `style`    | Code style (formatting, semicolons)   |
| `refactor` | Code refactoring (no behavior change) |
| `perf`     | Performance improvements              |
| `test`     | Adding or updating tests              |
| `build`    | Build system or dependencies          |
| `ci`       | CI/CD configuration                   |
| `chore`    | Other changes (tooling, config)       |
| `revert`   | Revert a previous commit              |

**Scope Guidelines:**

- Optional but recommended
- Use kebab-case (e.g., `task-manager`, `api-client`)
- Examples: `tasks`, `outbound`, `api`, `di`, `logger`

**Interactive Commit (Recommended):**

```bash
# Use Commitizen for guided commits
pnpm commit

# Follow prompts:
# 1. Select type (feat, fix, etc.)
# 2. Enter scope (optional)
# 3. Enter subject (required)
# 4. Enter body (optional)
# 5. Enter breaking changes (optional)
# 6. Enter issues closed (optional)
```

---

## Design System Guide

> **Note:** This section is a placeholder for design system documentation that will be provided separately.

The SmileCX Design System includes:

- **Shoelace Components**: A comprehensive set of web components (buttons, inputs, dialogs, etc.)
- **SmileCX Theme**: Custom CSS variables and color palette
- **Component Library**: Pre-built business components (contact cards, timeline, etc.)
- **Style Guide**: Typography, spacing, color usage

**Using Shoelace Components:**

```typescript
// Import Shoelace components in your Stencil component
render() {
  return (
    <Host>
      <sl-button variant="primary" onClick={this.handleClick}>
        Click Me
      </sl-button>

      <sl-input
        label="Task Title"
        value={this.title}
        onSlInput={this.handleInput}
      ></sl-input>

      <sl-dialog label="Confirmation" open={this.showDialog}>
        <p>Are you sure?</p>
        <sl-button slot="footer" variant="primary">
          Confirm
        </sl-button>
      </sl-dialog>
    </Host>
  );
}
```

**Resources:**

- [Shoelace Documentation](https://shoelace.style/)
- SmileCX Design System (coming soon)
- Component Examples (coming soon)

---

## Delivery Workflow for External Developers

**IMPORTANT:** This repository is a **starter template**. The SmileCX team **does not accept Pull Requests** on this repository. Your work will be integrated into the main monorepo via cherry-picking after review.

### Overview

External developers build applications on a **fork** of this starter repository. Once development is complete, the SmileCX core team reviews the code and integrates approved features into the main monorepo.

### Step-by-Step Workflow

#### **1. Fork the Repository**

Fork this repository to your GitHub account or organization:

```bash
# Via GitHub UI: Click "Fork" button
# Or via GitHub CLI:
gh repo fork smile-cx/smilecx-frontend-starter --clone=true
```

This gives you full autonomy to work on your fork without affecting the starter repository.

#### **2. Work on Your Fork**

Develop your application on the fork:

```bash
cd smilecx-frontend-starter

# Create a feature branch
git checkout -b feature/your-app-name

# Build your application following this starter's patterns
# - Create service module in src/apps/your-app/
# - Register in DI container
# - Build components
# - Write tests

# Commit following conventions
git add .
git commit -m "feat(your-app): add initial implementation"

# Push to your fork
git push origin feature/your-app-name
```

**Key Points:**

- ✅ Follow **all patterns** from this starter (DI, BehaviorSubject, API, etc.)
- ✅ Write **comprehensive tests** (services + components)
- ✅ Follow **code style** (ESLint, Prettier, commit conventions)
- ✅ Keep commits **clean and atomic**
- ✅ Document your code (JSDoc comments, README in app directory)

#### **3. Deliver Your Work**

When your application is ready for review, communicate to the SmileCX team:

**Required Information:**

1. **Fork URL** - Example: `https://github.com/your-org/smilecx-frontend-starter`
2. **Branch name** - Example: `feature/your-app-name`
3. **Brief description** - What the application does, key features
4. **Testing instructions** - How to test/demo the application

**Communication Channels:**

- Email to SmileCX core team
- Internal project management system (Jira, etc.)
- Slack/Teams channel (if available)

**Example Message:**

```
Subject: Application Delivery - Task Manager

Fork URL: https://github.com/acme-corp/smilecx-frontend-starter
Branch: feature/task-manager
Commit Range: abc123..def456

Description:
Task management application with:
- Task CRUD operations
- Status tracking (todo, in-progress, done)
- Priority levels
- Filtering and sorting

Testing Instructions:
1. Clone fork and checkout branch
2. pnpm install && pnpm build
3. pnpm dev (opens on :3336)
4. Test scenarios documented in src/apps/task-manager/readme.md

All tests passing (27/27).
Build clean with no warnings.
```

#### **4. Code Review by SmileCX Team**

The SmileCX core team will:

1. **Clone your fork**:

   ```bash
   git clone https://github.com/your-org/smilecx-frontend-starter
   cd smilecx-frontend-starter
   git checkout feature/your-app-name
   ```

2. **Review code quality**:
   - Architecture adherence (DI, services, components)
   - Code style and conventions
   - Test coverage and quality
   - Documentation completeness

3. **Run verification**:

   ```bash
   pnpm install
   pnpm build      # Must pass
   pnpm test       # Must pass
   pnpm lint       # Must pass
   pnpm dev        # Manual testing
   ```

4. **Provide feedback** if changes are needed:
   - Requested changes communicated back to you
   - You make changes on your fork
   - Process repeats until approval

#### **5. Integration into Monorepo (by SmileCX Team)**

Once approved, the SmileCX team will:

1. **Cherry-pick your commits** into the monorepo (see next section for technical details)
2. **Adjust paths and imports** for monorepo structure
3. **Run monorepo tests** to verify integration
4. **Create internal PR** for final review
5. **Merge and deploy**

**You will be notified** when integration is complete.

### Best Practices for Delivery

#### **DO:**

✅ **Keep your fork synchronized** with the upstream starter (in case updates are released)
✅ **Test thoroughly** before delivery - all tests must pass
✅ **Provide clear documentation** - explain your app's purpose and architecture
✅ **Follow the patterns** demonstrated in OutboundManager
✅ **Write meaningful commit messages** following conventional commits
✅ **Include integration tests** if your app interacts with external APIs
✅ **Document any external dependencies** you added

#### **DON'T:**

❌ **Don't create Pull Requests** to the starter repository
❌ **Don't modify shared libraries** (libs/api, libs/logger) without approval
❌ **Don't use unapproved libraries** for state management (only RxJS)
❌ **Don't skip writing tests** - untested code will be rejected
❌ **Don't ignore ESLint/Prettier** - code must be clean
❌ **Don't commit secrets or credentials** (.env files, API keys)

### Why This Workflow?

**Benefits:**

- **Autonomy**: Work freely on your fork without restrictions
- **Quality Control**: SmileCX team ensures monorepo standards are met
- **Clean History**: Only approved, clean commits enter the monorepo
- **Traceability**: Full git history preserved from fork to monorepo
- **Isolation**: Your development doesn't affect other teams

**Comparison with PR Workflow:**

| Aspect              | Fork + Cherry-pick (This Workflow) | Pull Request to Starter       |
| ------------------- | ---------------------------------- | ----------------------------- |
| **External access** | No access needed to starter repo   | Requires contributor access   |
| **Review location** | Clone fork for review              | Review on starter repo        |
| **Integration**     | Cherry-pick to monorepo            | Merge to starter, then move   |
| **History**         | Clean, approved commits only       | All commits, including drafts |
| **Autonomy**        | Full autonomy on fork              | Limited by starter repo rules |

---

## Integrating External Code into Monorepo

> **Note:** This section is for the **SmileCX core team**. External developers deliver their work via fork (see previous section), and the core team handles integration.

Once an external application is approved, the SmileCX core team integrates it into the monorepo. This process involves copying approved code from the external fork into the monorepo.

### Security Best Practice

**⚠️ CRITICAL: Do NOT add external repositories as git remotes to the monorepo.**

**Why:**

- **Security Risk**: External repositories may contain untrusted code or malicious commits
- **Git History Pollution**: Cherry-picking from external remotes pollutes monorepo history
- **Access Control**: External repositories may have different access policies
- **Dependency Confusion**: Git may pull unexpected commits from external sources

**Instead:** Clone external forks to a separate directory, review thoroughly, then manually copy approved files.

### Process Overview

1. **Clone External Fork**: Review code in separate directory
2. **Copy Approved Files**: Manually copy files into monorepo
3. **Adjust Paths**: Update import paths for monorepo structure
4. **Register in Container**: Add new module to container
5. **Test Integration**: Verify app works in monorepo context
6. **Submit PR**: Create pull request for review

### Step-by-Step Guide

**1. Clone External Developer's Fork (Outside Monorepo)**

```bash
# Clone external fork to temporary directory
cd ~/code-review
git clone https://github.com/their-org/smilecx-frontend-starter external-app-review
cd external-app-review
git checkout feature/their-app-name

# Run verification
pnpm install
pnpm build      # Must pass
pnpm test       # Must pass
pnpm lint       # Must pass

# Review code, test manually
pnpm dev
```

**2. Prepare Monorepo Branch**

```bash
cd /path/to/smilecx-monorepo
git checkout main
git pull
git checkout -b feature/integrate-task-manager
```

**3. Copy Approved Files to Monorepo**

```bash
# Copy the application directory
cp -r ~/code-review/external-app-review/src/apps/task-manager \
      packages/core/components/src/apps/

# Verify files copied
ls -la packages/core/components/src/apps/task-manager/
```

**4. Adjust Import Paths**

Update imports to match monorepo structure:

**Starter:**

```typescript
import { starter } from '../../di/containers';
import type { IApiFetch } from '../../libs/api';
import { tt } from '../../libs/i18n';
```

**Monorepo:**

```typescript
import { container } from '@smile-cx/core-components/di/containers';
import type { IApiFetch } from '@smile-cx/core-components/libs/api';
import { tt } from '@smile-cx/core-components/libs/i18n';
```

**5. Register Module in Monorepo Container**

Update the monorepo's container to load the new module:

```typescript
// packages/core/components/src/di/smilecx-container.ts
import { taskManagerModule } from '../apps/task-manager/task-manager.module';
import { TASK_MANAGER_TYPES } from '../apps/task-manager/task-manager.types';

export class SmileCxContainer extends Container {
  async init(options: ContainerOptions) {
    // ... existing modules ...

    // Add new module
    this.load(taskManagerModule);
    console.log('TaskManager module loaded');

    // ... rest of init ...
  }

  // Add convenience getter
  get taskManager(): ITaskManagerService {
    return this.get<ITaskManagerService>(TASK_MANAGER_TYPES.TaskManagerService);
  }
}
```

**6. Update App Shell (if needed)**

If the app should be mounted in the shell:

```typescript
// packages/core/components/src/app-shell/scx-root/scx-root.tsx

render() {
  return (
    <Host>
      {/* Existing apps */}
      <smilecx-outbound-manager></smilecx-outbound-manager>

      {/* New app */}
      <smilecx-task-manager></smilecx-task-manager>
    </Host>
  );
}
```

**7. Test Integration**

```bash
# Run tests
pnpm test --filter @smile-cx/core-components

# Run linting
pnpm lint --filter @smile-cx/core-components

# Build
pnpm build --filter @smile-cx/core-components

# Start dev server
pnpm dev --filter @smile-cx/core-components
```

**8. Commit and Submit Pull Request**

```bash
# Review changes
git status
git diff

# Commit with attribution
git add packages/core/components/src/apps/task-manager
git commit -m "feat(apps): integrate task manager application

Integrated from external developer fork:
- Repository: https://github.com/their-org/smilecx-frontend-starter
- Branch: feature/task-manager
- Developer: @their-username

Features:
- Task CRUD operations
- Status tracking
- Priority levels
- Filtering and sorting"

# Push to remote
git push origin feature/integrate-task-manager

# Create PR via GitHub CLI
gh pr create --title "Integrate Task Manager Application" \
  --body "Integration of external task manager app. All tests passing."
```

### Handling External Dependencies

**Check for new dependencies added by external developer:**

```bash
# Compare package.json between starter and external fork
cd ~/code-review/external-app-review
git diff main..feature/their-app-name -- package.json

# If new dependencies were added, add them to monorepo
cd /path/to/smilecx-monorepo
pnpm --filter @smile-cx/core-components add <package-name>
```

**Review dependency approval:**

- ✅ Standard libraries already in monorepo → OK
- ⚠️ New utility libraries → Review with team
- ❌ State management alternatives → Reject (RxJS only)
- ❌ Large UI frameworks → Reject (Shoelace only)

### Path Mapping Reference

| Starter Path     | Monorepo Path                             |
| ---------------- | ----------------------------------------- |
| `src/apps/`      | `packages/core/components/src/apps/`      |
| `src/di/`        | `packages/core/components/src/di/`        |
| `src/libs/`      | `packages/core/components/src/libs/`      |
| `src/app-shell/` | `packages/core/components/src/app-shell/` |

### Common Integration Issues

**Issue: Import Path Errors**

```typescript
// ❌ WRONG: Starter imports don't work in monorepo
// ✅ CORRECT: Use monorepo-aware imports
import { container } from '@smile-cx/core-components/di/containers';
import { starter } from '../../di/containers';
```

**Issue: Missing Dependencies**

```bash
# Add missing dependencies to monorepo package
cd packages/core/components
pnpm add <missing-dependency>
```

**Issue: Type Errors**

Ensure shared types are imported from correct monorepo packages:

```typescript
// ✅ CORRECT: Import from public types package
import type { Campaign } from '@smile-cx/core-types-public';
```

---

## Code Style and Standards

### TypeScript Configuration

The starter uses **strict TypeScript** with additional safety checks:

```json
{
  "compilerOptions": {
    "strict": true, // Enable all strict checks
    "noUncheckedIndexedAccess": true, // Require index signature checks
    "exactOptionalPropertyTypes": true, // Disallow undefined for optional properties
    "noUncheckedSideEffectImports": true, // Require side-effect imports to be explicit
    "verbatimModuleSyntax": true, // Enforce explicit type imports
    "isolatedModules": true, // Ensure each file can be transpiled independently
    "noUnusedLocals": true, // Error on unused local variables
    "noUnusedParameters": true, // Error on unused function parameters
    "target": "ES2024", // Modern JavaScript features
    "module": "NodeNext", // Node.js module resolution
    "experimentalDecorators": true, // Required for Stencil and Inversify
    "jsx": "react-jsx", // JSX transform
    "jsxImportSource": "@stencil/core" // Stencil JSX runtime
  }
}
```

**Key Implications:**

1. **No implicit `any`**: All types must be explicit
2. **Null checks required**: Array access returns `T | undefined`
3. **Type imports**: Use `import type` for types only

---

### ESLint Rules

ESLint configuration uses **flat config** format with TypeScript-ESLint:

**Key Rules:**

```javascript
{
  rules: {
    // Unused variables error (except _prefixed)
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^h$',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
}
```

**Test File Overrides:**

Test files have relaxed rules for convenience:

```javascript
{
  files: ['**/*.spec.ts', '**/*.test.ts'],
  rules: {
    '@typescript-eslint/no-unused-expressions': 'off', // Allow expect().to.exist
    '@typescript-eslint/no-explicit-any': 'off',        // Allow any in tests
    '@typescript-eslint/no-non-null-assertion': 'off',  // Allow ! operator
  },
}
```

---

### Key Conventions

#### **1. ComponentInterface: Required for Lifecycle Hooks**

Components with lifecycle hooks (e.g., `componentWillLoad`, `disconnectedCallback`) **MUST** implement `ComponentInterface`:

```typescript
// ✅ CORRECT: Implements ComponentInterface
import type { ComponentInterface } from '@stencil/core';

@Component({ tag: 'my-component' })
export class MyComponent implements ComponentInterface {
  componentWillLoad() {
    // Lifecycle hook
  }

  disconnectedCallback() {
    // Cleanup hook
  }
}

// ❌ WRONG: Missing ComponentInterface
@Component({ tag: 'my-component' })
export class MyComponent {
  componentWillLoad() {
    // This will cause type errors
  }
}
```

#### **2. Service Access: Container Getters Only**

Never inject services via `@Prop()`. Always use container getters:

```typescript
// ✅ CORRECT: Access via container getter
const service = starter.outbound;
service.loadCampaigns();

// ❌ WRONG: Never inject as @Prop()
@Prop() outboundService!: IOutboundService;
```

**Why?**

- Container getters ensure proper DI lifecycle
- Props are for parent-child data flow, not service injection
- Testability: Mocking via container is cleaner

#### **3. Self-Closing Tags: NOT Allowed in JSX**

Stencil requires explicit closing tags for all elements:

```tsx
// ✅ CORRECT: Explicit closing tags
<input type="text"></input>
<img src="logo.png"></img>
<br></br>

// ❌ WRONG: Self-closing tags not allowed
<input type="text" />
<img src="logo.png" />
<br />
```

**Exception:** Fragment shorthand `<>...</>` is allowed.

#### **4. Symbol-based DI: Always Use Symbol.for()**

Never use strings for DI identifiers. Always use `Symbol.for()`:

```typescript
// ✅ CORRECT: Symbol-based identifiers
export const TASK_TYPES = {
  TaskService: Symbol.for('TaskService'),
};

// ❌ WRONG: String identifiers
export const TASK_TYPES = {
  TaskService: 'TaskService', // Fragile, no type safety
};
```

**Why?**

- Type safety: Symbols are unique and prevent collisions
- Refactoring: Symbols are easier to trace than strings
- Debugging: Symbols show up clearly in container introspection

#### **5. English Only: All Comments and Documentation**

All code comments, documentation, commit messages, and PR descriptions **MUST** be in English:

```typescript
// ✅ CORRECT: English comments
/**
 * Load campaigns from API
 * @returns Promise that resolves when loading completes
 */
async loadCampaigns(): Promise<void> {
  // Set loading state before request
  this.loading$.next(true);
}

// ❌ WRONG: Non-English comments
/**
 * Carica le campagne dall'API
 * @returns Promise che si risolve quando il caricamento è completo
 */
async loadCampaigns(): Promise<void> {
  // Imposta lo stato di caricamento prima della richiesta
  this.loading$.next(true);
}
```

**Why?**

- Collaboration: English is the universal language for code
- Maintainability: Future developers may not speak your language
- Tooling: Most tools and AI assistants work best with English

#### **6. File Naming Conventions**

- **Components**: `kebab-case` (e.g., `smilecx-task-manager.tsx`)
- **Services**: `kebab-case` (e.g., `task.service.ts`)
- **Interfaces**: `kebab-case` (e.g., `task.interface.ts`)
- **Types**: `kebab-case` (e.g., `task.types.ts`)
- **Tests**: Match source file + `.spec.ts` (e.g., `task.service.spec.ts`)

#### **7. BEM Methodology for CSS**

Use BEM (Block Element Modifier) for CSS class names:

```scss
// Block
.task-manager {
  // Element
  &__header {
    font-size: 1.5rem;
  }

  &__list {
    list-style: none;
  }

  // Element with Modifier
  &__item {
    padding: 0.5rem;

    &--completed {
      text-decoration: line-through;
      opacity: 0.6;
    }
  }
}
```

**Usage in JSX:**

```tsx
<div class="task-manager">
  <h1 class="task-manager__header">Tasks</h1>
  <ul class="task-manager__list">
    <li
      class={{
        'task-manager__item': true,
        'task-manager__item--completed': task.completed,
      }}
    >
      {task.title}
    </li>
  </ul>
</div>
```

---

## FAQ

### General Questions

**Q: Can I use this starter for production applications?**

**A:** Yes. The starter is production-ready and follows the same patterns as the SmileCX monorepo. However, you should:

- Add proper error boundaries
- Implement authentication/authorization
- Configure environment-specific API URLs
- Add monitoring and logging
- Perform security audits

---

**Q: Do I need to integrate my app back into the monorepo?**

**A:** No. The starter is designed for **standalone development**. You only need to integrate back if:

- Your app will be part of the core SmileCX platform
- You need to share components with other monorepo apps
- You want to leverage monorepo infrastructure (CI/CD, deployment)

---

**Q: Can I use a different state management library (Zustand, Redux, etc.)?**

**A:** **No, not without explicit approval from the SmileCX core team.** RxJS BehaviorSubject is the **mandatory standard** for all SmileCX applications. This is required for:

- **Code integration**: When your app is cherry-picked into the monorepo, it must follow monorepo patterns
- **Consistency**: All apps must use the same state management approach
- **Team coordination**: Mixing libraries creates maintenance complexity

If you believe you have a compelling reason to use a different library, you **must** get written approval from the core team before proceeding. Unapproved alternatives will be rejected during code review.

---

**Q: Can I use React, Vue, or Angular instead of Stencil?**

**A:** No. The SmileCX platform is built with **Stencil Web Components**. Stencil components work in any framework, but the starter template is Stencil-specific. If you need to use another framework:

- Create a wrapper around the Stencil components
- Or build your app separately and integrate via iframe/microservices

---

### Dependency Injection

**Q: Why use Inversify instead of a simpler DI solution?**

**A:** Inversify provides:

- **Type safety**: Full TypeScript support with decorators
- **Flexibility**: Supports singletons, transients, factories
- **Testability**: Easy mocking and dependency replacement
- **Consistency**: Same DI system as SmileCX monorepo

---

**Q: Can I use constructor injection without @inject() decorators?**

**A:** No. Inversify requires `@inject()` decorators to resolve dependencies. TypeScript doesn't preserve constructor parameter types at runtime, so decorators are necessary for metadata.

---

**Q: Should I create one big container or multiple small containers?**

**A:** One container per application. The `StarterContainer` is a singleton that loads all modules. Multiple containers would break shared state (e.g., API client, logger).

---

### Reactive State

**Q: Why BehaviorSubject instead of regular Subject?**

**A:** `BehaviorSubject` has an **initial value** and emits it immediately to new subscribers. This ensures components always have state, even before data loads. Regular `Subject` would require additional initialization logic.

---

**Q: Can I use async/await with observables?**

**A:** Use `firstValueFrom` or `lastValueFrom` from RxJS:

```typescript
import { firstValueFrom } from 'rxjs';

const campaigns = await firstValueFrom(service.campaigns$);
```

However, prefer subscribing in components for reactive updates.

---

**Q: What happens if I forget to unsubscribe?**

**A:** Memory leak. The subscription continues to exist even after the component is destroyed, keeping references to component instances and preventing garbage collection.

**Always unsubscribe in `disconnectedCallback()`.**

---

### API Communication

**Q: How do I handle authentication tokens?**

**A:** Update the `ApiConf` during container initialization:

```typescript
// src/di/starter-container.ts
const apiModule = createApiModule({
  apiUrl: options.apiBaseUrl,
  token: options.authToken, // Add token here
});
```

Then pass token via `scx-root`:

```typescript
<scx-root api-url="..." auth-token="..."></scx-root>
```

---

**Q: How do I handle 401 Unauthorized responses?**

**A:** Add centralized error handling in `ApiFetch`:

```typescript
private async handleResponse<T>(response: Response): Promise<IApiResponse<T>> {
  if (response.status === 401) {
    // Emit auth error event
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    return { ok: false, status: 401, error: { message: 'Unauthorized' } };
  }
  // ... rest of handling
}
```

Listen in `scx-root`:

```typescript
componentWillLoad() {
  window.addEventListener('auth:unauthorized', this.handleAuthError);
}

private handleAuthError = () => {
  // Redirect to login, clear session, etc.
};
```

---

**Q: How do I implement pagination?**

**A:** Use the `total`, `skipped`, and `link` fields from `IApiResponse`:

```typescript
async loadCampaigns(page: number, pageSize: number): Promise<void> {
  const response = await this.apiFetch.doGet<Campaign[]>(
    `/campaigns?skip=${page * pageSize}&limit=${pageSize}`
  );

  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
    this.totalCount = response.total || 0;
    this.currentPage = page;
  }
}
```

---

### Testing

**Q: How do I test components that use container services?**

**A:** Create a test container with mock services:

```typescript
describe('MyComponent', () => {
  let mockService: jest.Mocked<ITaskService>;

  beforeEach(() => {
    // Create mock service
    mockService = {
      tasks$: new BehaviorSubject<Task[]>([]),
      loadTasks: jest.fn(),
    };

    // Override container getter
    Object.defineProperty(starter, 'tasks', {
      get: () => mockService,
      configurable: true,
    });
  });

  it('should load tasks on mount', async () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });

    expect(mockService.loadTasks).toHaveBeenCalled();
  });
});
```

---

**Q: How do I test async operations?**

**A:** Use `async/await` and `waitForChanges()`:

```typescript
it('should update after async load', async () => {
  const page = await newSpecPage({
    components: [MyComponent],
    html: '<my-component></my-component>',
  });

  const component = page.rootInstance as MyComponent;

  // Trigger async operation
  await component.loadData();

  // Wait for re-render
  await page.waitForChanges();

  // Assert updated state
  expect(component.data).toEqual(expectedData);
});
```

---

### Styling

**Q: How do I use global styles in Shadow DOM components?**

**A:** Shadow DOM isolates styles. Options:

1. **CSS Variables**: Define in `global.scss`, use in component styles
2. **::part()**: Expose component parts for external styling
3. **Light DOM**: Set `shadow: false` (not recommended)

**Recommended approach (CSS Variables):**

```scss
// global.scss
:root {
  --color-primary: #007bff;
  --spacing-md: 1rem;
}

// component.scss
.my-button {
  color: var(--color-primary);
  padding: var(--spacing-md);
}
```

---

**Q: How do I import Shoelace components?**

**A:** Shoelace components are used as custom elements:

```typescript
// No imports needed for basic usage
render() {
  return (
    <Host>
      <sl-button variant="primary">Click Me</sl-button>
    </Host>
  );
}
```

For TypeScript types:

```typescript
import type SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';
```

---

### Performance

**Q: How do I optimize re-renders?**

**A:** Use `@Watch()` decorator to control when state changes trigger updates:

```typescript
@State() items: Item[] = [];

@Watch('items')
itemsChanged(newItems: Item[], oldItems: Item[]) {
  // Only perform expensive operations if array changed
  if (newItems.length !== oldItems.length) {
    this.recalculateStats();
  }
}
```

---

**Q: How do I lazy-load components?**

**A:** Stencil automatically lazy-loads components. Use dynamic imports for heavy dependencies:

```typescript
async componentWillLoad() {
  // Lazy-load heavy library
  const { HeavyLibrary } = await import('./heavy-library');
  this.library = new HeavyLibrary();
}
```

---

### Deployment

**Q: How do I deploy the app?**

**A:** Build and deploy the `dist/` directory:

```bash
# Build production bundle
pnpm build

# Output in dist/
# - dist/esm/ - ES modules
# - dist/types/ - TypeScript types
# - dist/loader/ - Lazy-loading script
```

Serve `www/` directory or integrate into existing build pipeline.

---

**Q: Can I deploy to npm?**

**A:** Yes. Update `package.json` and publish:

```bash
# Update package.json
{
  "name": "@your-org/smilecx-app",
  "version": "1.0.0",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.js",
  "types": "./dist/types/index.d.ts"
}

# Publish
npm publish --access public
```

---

### Troubleshooting

**Q: "Cannot find module 'reflect-metadata'"**

**A:** Ensure `reflect-metadata` is imported in `global.ts`:

```typescript
// src/global/global.ts
import 'reflect-metadata';
```

---

**Q: "Symbol.for is not defined"**

**A:** Ensure you're using `Symbol.for()`, not `Symbol()`:

```typescript
// ✅ CORRECT
Symbol.for('TaskService');

// ❌ WRONG
Symbol('TaskService');
```

---

**Q: "Service not found in container"**

**A:** Check that:

1. Module is loaded in `StarterContainer.init()`
2. Service is bound with correct symbol
3. Container is initialized before accessing service

---

**Q: "Memory leak detected"**

**A:** Check that you're unsubscribing from observables:

```typescript
disconnectedCallback() {
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

Use Chrome DevTools → Memory → Take Heap Snapshot to identify leaks.

---

### Getting Help

**Q: Where can I get help?**

**A:**

1. **Documentation**: Read this README thoroughly
2. **Code Examples**: Study `src/apps/outbound-manager/` reference implementation
3. **SmileCX Team**: Contact your SmileCX representative
4. **GitHub Issues**: Open an issue in the starter repo

---

**Q: How do I report a bug?**

**A:** Open a GitHub issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, browser)
- Code snippet or minimal reproduction

---

**Q: Can I contribute improvements?**

**A:** Yes! Submit a pull request with:

- Clear description of changes
- Tests for new functionality
- Documentation updates
- Conventional commit messages

---

## License

MIT License

---

## Acknowledgments

Built with:

- [Stencil](https://stenciljs.com/) - Web Components framework
- [Inversify](https://inversify.io/) - Dependency Injection
- [RxJS](https://rxjs.dev/) - Reactive programming
- [debuggo](https://github.com/nunorafaelrocha/debuggo) - Namespaced logging
- [Shoelace](https://shoelace.style/) - Component library

---

**Happy coding!** If you have questions or need help, reach out to the SmileCX team.
