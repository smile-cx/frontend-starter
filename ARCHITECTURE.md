# SmileCX Frontend Starter - Architecture Deep Dive

**Version:** 1.0.0
**Last Updated:** January 2025
**Audience:** Developers who want to understand the WHY behind architectural decisions

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Dependency Injection Deep Dive](#dependency-injection-deep-dive)
3. [Service Architecture](#service-architecture)
4. [Reactive State Pattern](#reactive-state-pattern)
5. [API Layer](#api-layer)
6. [Testing Strategy](#testing-strategy)
7. [Performance Considerations](#performance-considerations)
8. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

---

## Design Principles

This section explains the fundamental architectural decisions and their rationale.

### 1.1 Dependency Injection First

**What:** All services are registered in Inversify modules and accessed via the container.

**Why:**

- **Testability**: Mock dependencies easily without touching implementation code
- **Loose Coupling**: Services depend on interfaces, not concrete implementations
- **Single Responsibility**: Each service has one clear purpose
- **Maintainability**: Changing implementations doesn't affect consumers

**Alternative Considered:** Singleton pattern with static methods

```typescript
// ❌ Singleton approach (rejected)
export class ApiClient {
  private static instance: ApiClient;

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
}

// Usage
const client = ApiClient.getInstance();
```

**Why Rejected:**

- Hard to test (global state)
- Tight coupling to concrete implementation
- No dependency injection (how does ApiClient get its config?)
- Difficult to mock or replace

**Our Approach:**

```typescript
// ✅ DI approach (chosen)
@injectable()
export class ApiFetch implements IApiFetch {
  constructor(@inject(API_TYPES.ApiConf) private config: IApiConf) {}
}

// Usage
const client = container.get<IApiFetch>(API_TYPES.ApiFetch);
```

**Benefits:**

- Easy to test (inject mock config)
- Loose coupling (depends on IApiConf interface)
- Configuration is explicit and testable
- Can have multiple instances with different configs

---

### 1.2 Reactive State with RxJS

**What:** Application state flows through BehaviorSubject observables.

**Why:**

- **Predictable Updates**: State changes are explicit (`.next()` calls)
- **Subscription Model**: Components react to state changes automatically
- **Time-based Operations**: RxJS provides operators for debouncing, throttling, filtering
- **Consistency**: Same pattern used across SmileCX monorepo

**Alternative Considered:** Stencil's @State and @Watch decorators only

```typescript
// ❌ Pure Stencil approach (rejected)
@Component({ tag: 'my-component' })
export class MyComponent {
  @State() campaigns: Campaign[] = [];

  async componentWillLoad() {
    // How do other components know campaigns changed?
    // How do we share state across components?
    this.campaigns = await fetchCampaigns();
  }
}
```

**Why Rejected:**

- State is local to component (no sharing)
- No subscription model (polling or prop-drilling required)
- Difficult to coordinate multi-component updates

**Our Approach:**

```typescript
// ✅ RxJS approach (chosen)
@injectable()
export class CampaignService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);

  async loadCampaigns() {
    const data = await this.apiFetch.doGet<Campaign[]>('/campaigns');
    this.campaigns$.next(data); // All subscribers notified
  }
}

// Component 1
this.subscriptions.push(
  service.campaigns$.subscribe((campaigns) => {
    this.campaigns = campaigns; // Auto-updates
  })
);

// Component 2 (same data)
this.subscriptions.push(
  service.campaigns$.subscribe((campaigns) => {
    this.totalCount = campaigns.length;
  })
);
```

**Benefits:**

- Centralized state in service
- Multiple components subscribe to same observable
- Automatic updates (no manual coordination)
- RxJS operators for complex transformations

---

### 1.3 Non-throwing API Pattern

**What:** API methods resolve (never reject) to `IApiResponse<T>` with explicit error handling.

**Why:**

- **Explicit Error Handling**: Forces developers to handle errors at call site
- **Type Safety**: TypeScript knows response can be success OR error
- **No Unhandled Rejections**: No try-catch required (errors are values)
- **Consistent Interface**: All API methods return same shape

**Alternative Considered:** Traditional try-catch with throwing promises

```typescript
// ❌ Throwing approach (rejected)
async loadCampaigns() {
  try {
    const response = await fetch('/campaigns');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    this.campaigns$.next(data);
  } catch (error) {
    // Error handling is implicit and optional
    console.error(error);
    this.campaigns$.next([]);
  }
}
```

**Why Rejected:**

- Developers forget try-catch (unhandled rejections)
- Error handling is implicit and easy to skip
- TypeScript can't enforce error handling
- Inconsistent error shapes (Error? HTTP status? JSON?)

**Our Approach:**

```typescript
// ✅ Non-throwing approach (chosen)
async loadCampaigns() {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  // Error handling is EXPLICIT and ENFORCED by types
  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
  } else {
    // Must handle error path explicitly
    this.logger.error('Failed:', response.error?.message);
    this.campaigns$.next([]);
  }
}
```

**Benefits:**

- Explicit error handling (can't forget)
- TypeScript enforces checking `ok` flag
- Consistent error structure across all endpoints
- No try-catch needed (cleaner code)

**Trade-off:** Slightly more verbose (checking `ok` flag), but significantly safer.

---

### 1.4 Module-based Architecture

**What:** Features are organized as self-contained modules with clear boundaries.

**Why:**

- **Encapsulation**: Module internals are hidden (only public API exposed)
- **Reusability**: Modules can be loaded/unloaded independently
- **Dependency Management**: Module loading order enforces dependency graph
- **Testability**: Modules can be tested in isolation

**Module Structure:**

```
apps/outbound-manager/
├── outbound.interface.ts    # Public API (types + interface)
├── outbound.service.ts       # Implementation
├── outbound.service.spec.ts  # Tests
├── outbound.types.ts         # DI symbols
├── outbound.module.ts        # DI registration
└── smilecx-outbound-manager.tsx  # UI component
```

**Module Loading Order:**

```typescript
async init(options: { apiBaseUrl: string }) {
  // 1. Logger (no dependencies)
  this.load(loggerModule);

  // 2. API (depends on Logger)
  const apiModule = createApiModule({ apiUrl: options.apiBaseUrl });
  this.load(apiModule);

  // 3. Outbound (depends on Logger + API)
  this.load(outboundModule);
}
```

**Key Pattern:** Dependencies are loaded BEFORE dependents. This is enforced by container initialization order.

---

### 1.5 Shell vs Application Layer

**What:** Container initialization (shell) is separate from business logic (application).

**Why:**

- **Single Responsibility**: Root component only initializes, apps only do business logic
- **Testability**: Apps can be tested without full container setup
- **Reusability**: Apps can be mounted in different contexts (dialog, iframe, etc.)
- **Clarity**: Clear boundary between infrastructure and domain logic

**Architecture Diagram:**

```
┌─────────────────────────────────────┐
│          scx-root (Shell)           │
│  - Initialize DI container          │
│  - Load modules                     │
│  - Render loading state             │
│  - Mount app components             │
└─────────────────────────────────────┘
                 │
                 │ (after init)
                 ▼
┌─────────────────────────────────────┐
│   smilecx-outbound-manager (App)    │
│  - Access services via container    │
│  - Subscribe to observables         │
│  - Handle user interactions         │
│  - Render UI                        │
└─────────────────────────────────────┘
```

**Shell Responsibilities (scx-root):**

```typescript
@Component({ tag: 'scx-root' })
export class ScxRoot implements ComponentInterface {
  @Prop() apiUrl = '';
  @State() initialized = false;

  // ONLY initialize container
  async componentWillLoad() {
    await starter.init({ apiBaseUrl: this.apiUrl });
    this.initialized = true;
  }

  // ONLY mount apps
  render() {
    return this.initialized ? <smilecx-outbound-manager /> : <Loading />;
  }
}
```

**Application Responsibilities (smilecx-outbound-manager):**

```typescript
@Component({ tag: 'smilecx-outbound-manager' })
export class SmilecxOutboundManager implements ComponentInterface {
  @State() campaigns: Campaign[] = [];
  private subscriptions: Subscription[] = [];

  // Access services and subscribe
  componentWillLoad() {
    const service = starter.outbound;
    this.subscriptions.push(
      service.campaigns$.subscribe(campaigns => {
        this.campaigns = campaigns;
      })
    );
    service.loadCampaigns();
  }

  // Cleanup
  disconnectedCallback() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Render UI
  render() {
    return <div>{/* Campaign UI */}</div>;
  }
}
```

**Anti-pattern (DO NOT DO):**

```typescript
// ❌ WRONG: Shell doing business logic
@Component({ tag: 'scx-root' })
export class ScxRoot {
  @State() campaigns: Campaign[] = [];

  async componentWillLoad() {
    await starter.init({ apiBaseUrl: this.apiUrl });

    // ❌ Shell should NOT subscribe to services
    starter.outbound.campaigns$.subscribe((campaigns) => {
      this.campaigns = campaigns;
    });

    // ❌ Shell should NOT load data
    starter.outbound.loadCampaigns();
  }
}
```

---

### 1.6 Type Safety Everywhere

**What:** Strict TypeScript with no implicit `any`, enforced by compiler and ESLint.

**Why:**

- **Catch Errors Early**: Type errors caught at compile time, not runtime
- **Better Refactoring**: Rename/move code with confidence
- **Self-documenting**: Types serve as inline documentation
- **IDE Support**: Autocomplete, inline docs, jump-to-definition

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "strict": true, // All strict checks enabled
    "noUncheckedIndexedAccess": true, // Array access returns T | undefined
    "exactOptionalPropertyTypes": true, // Disallow undefined for optional props
    "noUncheckedSideEffectImports": true, // Require explicit side-effect imports
    "verbatimModuleSyntax": true, // Enforce import type syntax
    "isolatedModules": true, // Each file can be transpiled alone
    "noUnusedLocals": true, // Error on unused variables
    "noUnusedParameters": true // Error on unused parameters
  }
}
```

**Impact on Code:**

```typescript
// Array access is T | undefined
const campaigns: Campaign[] = [...];
const first = campaigns[0]; // Type: Campaign | undefined

// Must check before using
if (first) {
  console.log(first.name); // ✅ Safe
}

// Type imports must be explicit
import type { ILogger } from './logger.interface'; // ✅ Correct
import { ILogger } from './logger.interface';      // ❌ Error (not a value)

// Optional properties can't be undefined
interface Config {
  apiUrl: string;
  token?: string; // Can be absent or string, NOT undefined
}

const config: Config = {
  apiUrl: 'http://localhost',
  token: undefined // ❌ Error with exactOptionalPropertyTypes
};
```

**Trade-off:** More type annotations required, but significantly fewer runtime errors.

---

## Dependency Injection Deep Dive

This section explores how Inversify DI works in depth.

### 2.1 Container Lifecycle

The container follows a strict initialization lifecycle:

**Phase 1: Creation**

```typescript
// Container created (empty)
export class StarterContainer extends Container {
  private initialized = false;

  // Container exists but has no bindings yet
}
```

**Phase 2: Initialization**

```typescript
async init(options: { apiBaseUrl: string }) {
  if (this.initialized) {
    console.warn('Already initialized');
    return;
  }

  // Load modules in dependency order
  this.load(loggerModule);           // 1. No dependencies
  this.load(apiModule);              // 2. Depends on Logger
  this.load(outboundModule);         // 3. Depends on Logger + API

  this.initialized = true;
}
```

**Phase 3: Service Access**

```typescript
// After initialization, services can be accessed
const service = starter.outbound; // Container resolves IOutboundService
```

**Lifecycle Diagram:**

```
┌──────────────┐
│   Created    │  Container instance exists
│  (empty)     │  No bindings yet
└──────┬───────┘
       │
       │ init() called
       ▼
┌──────────────┐
│ Initializing │  Loading modules
│  (loading)   │  Building dependency graph
└──────┬───────┘
       │
       │ All modules loaded
       ▼
┌──────────────┐
│ Initialized  │  Services can be accessed
│   (ready)    │  Container.get() works
└──────────────┘
```

**Critical Rule:** NEVER access services before `init()` completes.

```typescript
// ❌ WRONG: Accessing before init
const service = starter.outbound; // Error: not bound
await starter.init({ apiBaseUrl: '...' });

// ✅ CORRECT: Access after init
await starter.init({ apiBaseUrl: '...' });
const service = starter.outbound; // Works
```

---

### 2.2 Modules and Binding

**What is a Module?**

A `ContainerModule` is a collection of service bindings that can be loaded as a unit.

**Module Anatomy:**

```typescript
import { ContainerModule } from 'inversify';
import type { IOutboundService } from './outbound.interface';
import { OutboundService } from './outbound.service';
import { OUTBOUND_TYPES } from './outbound.types';

export const outboundModule = new ContainerModule((bind) => {
  // Binding: Symbol → Implementation
  bind<IOutboundService>(OUTBOUND_TYPES.OutboundService).to(OutboundService).inSingletonScope();
});
```

**Binding Types:**

1. **Class Binding** (most common)

```typescript
bind<IOutboundService>(OUTBOUND_TYPES.OutboundService).to(OutboundService).inSingletonScope();

// Inversify creates instance via: new OutboundService(...)
```

2. **Constant Value Binding** (for configuration)

```typescript
bind<IApiConf>(API_TYPES.ApiConf).toConstantValue({ apiUrl: 'http://localhost', token: undefined });

// No construction, value is used as-is
```

3. **Factory Binding** (for lazy initialization)

```typescript
bind<ILogger>(LOGGER_TYPES.Logger).toFactory((context) => {
  return (namespace: string) => {
    return new Logger(namespace);
  };
});

// Factory function called when service is accessed
```

**Scope Types:**

1. **Singleton** (one instance per container)

```typescript
.inSingletonScope()

// Same instance returned for all get() calls
const service1 = container.get(OUTBOUND_TYPES.OutboundService);
const service2 = container.get(OUTBOUND_TYPES.OutboundService);
console.log(service1 === service2); // true
```

2. **Transient** (new instance each time)

```typescript
.inTransientScope()

// Different instance for each get() call
const service1 = container.get(OUTBOUND_TYPES.OutboundService);
const service2 = container.get(OUTBOUND_TYPES.OutboundService);
console.log(service1 === service2); // false
```

**When to use each:**

- **Singleton**: Services with shared state (most cases)
- **Transient**: Stateless utilities or per-request services
- **Constant**: Configuration, API keys, base URLs

---

### 2.3 Symbols and Type Safety

**Why Symbols?**

Symbols provide unique, collision-free identifiers for service bindings.

**String Identifiers (DON'T USE):**

```typescript
// ❌ WRONG: String identifiers
container.bind('OutboundService').to(OutboundService);
const service = container.get('OutboundService'); // Type: unknown

// Problems:
// 1. No type inference
// 2. String typos not caught by compiler
// 3. Namespace collisions possible
```

**Symbol Identifiers (USE THIS):**

```typescript
// ✅ CORRECT: Symbol identifiers
export const OUTBOUND_TYPES = {
  OutboundService: Symbol.for('OutboundService'),
};

container.bind<IOutboundService>(OUTBOUND_TYPES.OutboundService).to(OutboundService);
const service = container.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
// Type: IOutboundService (inferred!)

// Benefits:
// 1. Type-safe (TypeScript knows the type)
// 2. Refactor-safe (rename symbol, all usages update)
// 3. Unique (Symbol.for() creates unique identifiers)
```

**Symbol.for() vs Symbol():**

```typescript
// ✅ CORRECT: Symbol.for() - global registry
const symbol1 = Symbol.for('OutboundService');
const symbol2 = Symbol.for('OutboundService');
console.log(symbol1 === symbol2); // true (same symbol)

// ❌ WRONG: Symbol() - always unique
const symbol3 = Symbol('OutboundService');
const symbol4 = Symbol('OutboundService');
console.log(symbol3 === symbol4); // false (different symbols)
```

**Key Rule:** Always use `Symbol.for()` for DI identifiers.

---

### 2.4 Constructor Injection

**How it Works:**

Inversify uses decorators to inject dependencies via constructor parameters.

**Step-by-Step:**

```typescript
// 1. Mark class as injectable
@injectable()
export class OutboundService implements IOutboundService {
  // 2. Inject dependencies via constructor
  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    // 3. Dependencies are available immediately
    this.logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);
  }
}
```

**Injection Flow:**

```
1. Container.get(OUTBOUND_TYPES.OutboundService)
         ↓
2. Container checks binding for OutboundService
         ↓
3. Container sees constructor needs:
   - LOGGER_TYPES.Logger
   - API_TYPES.ApiFetch
         ↓
4. Container recursively resolves dependencies:
   - Resolves ILogger (from loggerModule)
   - Resolves IApiFetch (from apiModule)
         ↓
5. Container calls:
   new OutboundService(loggerInstance, apiFetchInstance)
         ↓
6. Returns OutboundService instance
```

**Important:** Dependencies must be registered BEFORE dependents.

```typescript
// ✅ CORRECT: Dependencies first
this.load(loggerModule); // ILogger registered
this.load(apiModule); // IApiFetch registered
this.load(outboundModule); // OutboundService can be constructed

// ❌ WRONG: Dependent first
this.load(outboundModule); // Error: ILogger not found
this.load(loggerModule);
this.load(apiModule);
```

---

### 2.5 Container Getters Pattern

**Why Getters?**

Direct `container.get()` calls are verbose and error-prone. Getters provide type-safe, convenient access.

**Without Getters (verbose):**

```typescript
// Every component needs this boilerplate
import type { IOutboundService } from '../../apps/outbound-manager/outbound.interface';
import { OUTBOUND_TYPES } from '../../apps/outbound-manager/outbound.types';
import { starter } from '../../di/containers';

const service = starter.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
```

**With Getters (concise):**

```typescript
// Usage is simple
import { starter } from '../../di/containers';

// Getter defined once in container
export class StarterContainer extends Container {
  get outbound(): IOutboundService {
    return this.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
  }
}

const service = starter.outbound;
```

**Benefits:**

- Type inference (TypeScript knows return type)
- Less boilerplate (no manual type annotations)
- Single source of truth (getter logic in one place)
- Refactor-friendly (change getter, all usages update)

**Getter Pattern for All Services:**

```typescript
export class StarterContainer extends Container {
  // Convenience getters for each service
  get logger(): ILogger {
    return this.get<ILogger>(LOGGER_TYPES.Logger);
  }

  get api(): IApiFetch {
    return this.get<IApiFetch>(API_TYPES.ApiFetch);
  }

  get outbound(): IOutboundService {
    return this.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
  }
}
```

---

### 2.6 Testing with DI

**Why DI Makes Testing Easy:**

You can replace real services with mocks by rebinding symbols.

**Service Test Example:**

```typescript
describe('OutboundService', () => {
  let container: Container;
  let service: OutboundService;
  let mockApiFetch: jest.Mocked<IApiFetch>;

  beforeEach(() => {
    // Create test container
    container = new Container();

    // Bind mock API client
    mockApiFetch = {
      doGet: jest.fn(),
      doPost: jest.fn(),
      // ... other methods
    };
    container.bind(API_TYPES.ApiFetch).toConstantValue(mockApiFetch);

    // Bind mock logger
    const mockLogger: jest.Mocked<ILogger> = {
      getLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }),
    };
    container.bind(LOGGER_TYPES.Logger).toConstantValue(mockLogger);

    // Bind service under test (with real implementation)
    container.bind(OUTBOUND_TYPES.OutboundService).to(OutboundService);

    // Get service instance (dependencies auto-injected)
    service = container.get<OutboundService>(OUTBOUND_TYPES.OutboundService);
  });

  it('should load campaigns', async () => {
    // Mock API response
    mockApiFetch.doGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: [{ id: '1', name: 'Campaign 1' /* ... */ }],
    });

    // Call service method
    await service.loadCampaigns();

    // Assert API was called
    expect(mockApiFetch.doGet).toHaveBeenCalledWith('/campaigns');

    // Assert state updated
    expect(service.campaigns$.value).toHaveLength(1);
  });
});
```

**Key Pattern:** Create fresh container per test, bind mocks, get service under test.

---

## Service Architecture

This section explores service design patterns.

### 3.1 Interface-First Design

**What:** Define interfaces before implementations.

**Why:**

- **Contract-driven**: Interface is the contract, implementation is detail
- **Testability**: Mock interface without knowing implementation
- **Flexibility**: Swap implementations without changing consumers
- **Documentation**: Interface documents what service does

**Pattern:**

```typescript
// 1. Define interface (public API)
export interface IOutboundService {
  // Observables
  campaigns$: BehaviorSubject<Campaign[]>;
  loading$: BehaviorSubject<boolean>;

  // Methods
  loadCampaigns(): Promise<void>;
  selectCampaign(id: string): void;
}

// 2. Implement interface (private details)
@injectable()
export class OutboundService implements IOutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    @inject(LOGGER_TYPES.Logger) private logger: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {}

  async loadCampaigns() {
    // Implementation details
  }

  selectCampaign(id: string) {
    // Implementation details
  }
}

// 3. Bind interface to implementation
bind<IOutboundService>(OUTBOUND_TYPES.OutboundService).to(OutboundService);

// 4. Consumers depend on interface
const service: IOutboundService = container.get(OUTBOUND_TYPES.OutboundService);
```

**Benefits:**

- Components depend on `IOutboundService`, not `OutboundService`
- Can swap `OutboundService` for `MockOutboundService` in tests
- Can add `OutboundServiceV2` without breaking consumers

---

### 3.2 Service Responsibilities

**Single Responsibility Principle:**

Each service has ONE clear purpose.

**Good Service Design:**

```typescript
// ✅ CORRECT: Single responsibility (campaign management)
@injectable()
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);

  loadCampaigns() {
    /* ... */
  }
  startCampaign(id: string) {
    /* ... */
  }
  pauseCampaign(id: string) {
    /* ... */
  }
}
```

**Bad Service Design:**

```typescript
// ❌ WRONG: Multiple responsibilities
@injectable()
export class ApplicationService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  users$ = new BehaviorSubject<User[]>([]);
  settings$ = new BehaviorSubject<Settings>({});

  loadCampaigns() {
    /* ... */
  }
  loadUsers() {
    /* ... */
  }
  loadSettings() {
    /* ... */
  }
  login(username: string, password: string) {
    /* ... */
  }
  logout() {
    /* ... */
  }
}
```

**Why Bad?**

- Too many concerns (campaigns, users, settings, auth)
- Hard to test (mock everything)
- Difficult to reuse (can't use just campaign logic)
- Violates Single Responsibility Principle

**Solution:** Split into focused services.

```typescript
// ✅ CORRECT: Separate services
@injectable()
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  loadCampaigns() {
    /* ... */
  }
}

@injectable()
export class UserService {
  users$ = new BehaviorSubject<User[]>([]);
  loadUsers() {
    /* ... */
  }
}

@injectable()
export class AuthService {
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  login(username: string, password: string) {
    /* ... */
  }
  logout() {
    /* ... */
  }
}
```

---

### 3.3 Observable Naming Conventions

**Pattern:** Suffix observables with `$` to indicate reactive stream.

**Why:**

- Visual indicator (this is a stream, not a value)
- Convention from RxJS community
- Prevents confusion between value and stream

**Examples:**

```typescript
export class OutboundService {
  // Observable streams (suffix $)
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  selectedCampaign$ = new BehaviorSubject<Campaign | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Non-observable values (no $)
  private logger: ILogger;
  private apiFetch: IApiFetch;
}
```

**Usage:**

```typescript
// Subscribe to stream
service.campaigns$.subscribe((campaigns) => {
  console.log('Campaigns updated:', campaigns);
});

// Access current value
const current = service.campaigns$.value;
```

**Anti-pattern:**

```typescript
// ❌ WRONG: Observable without $
export class OutboundService {
  campaigns = new BehaviorSubject<Campaign[]>([]); // Confusing!

  // Is this a value or a stream?
  someValue = 42; // This looks the same as campaigns!
}
```

---

### 3.4 Logging in Services

**Pattern:** Request logger instance in constructor, store as private field.

**Setup:**

```typescript
@injectable()
export class OutboundService {
  // Create logger with namespace
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);

  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    this.logger.log('OutboundService initialized');
  }
}
```

**Logging Levels:**

```typescript
// debug: Detailed diagnostic info (function entry, parameters)
this.logger.debug('Loading campaigns with filters:', filters);

// log: General information (operation success, state changes)
this.logger.log(`Loaded ${campaigns.length} campaigns`);

// warn: Warning conditions (deprecated features, recoverable errors)
this.logger.warn('Campaign status unknown, defaulting to inactive');

// error: Error conditions (operation failures, exceptions)
this.logger.error('Failed to load campaigns:', response.error?.message);
```

**Best Practices:**

1. Log operation start at `debug` level
2. Log operation success at `log` level
3. Log operation failure at `error` level
4. Include context (IDs, counts, error messages)

**Example:**

```typescript
async loadCampaigns(): Promise<void> {
  this.logger.debug('Loading campaigns...');
  this.loading$.next(true);

  try {
    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
      this.logger.log(`Loaded ${response.data.length} campaigns`);
    } else {
      this.logger.error('Failed to load campaigns:', response.error?.message);
      this.campaigns$.next([]);
    }
  } catch (error) {
    this.logger.error('Unexpected error loading campaigns:', error);
    this.campaigns$.next([]);
  } finally {
    this.loading$.next(false);
  }
}
```

---

### 3.5 Service Initialization

**Pattern:** Services initialize in constructor, expose ready state if needed.

**Simple Initialization (No Async):**

```typescript
@injectable()
export class OutboundService {
  constructor(@inject(LOGGER_TYPES.Logger) private loggerService: ILogger) {
    // Synchronous initialization
    this.logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);
    this.logger.log('OutboundService initialized');
  }
}
```

**Complex Initialization (Async):**

If service needs async initialization (e.g., loading config from API), use init method:

```typescript
@injectable()
export class OutboundService {
  private initialized$ = new BehaviorSubject<boolean>(false);

  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    this.logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);
  }

  async init(): Promise<void> {
    if (this.initialized$.value) return;

    // Load initial data
    await this.loadCampaigns();

    this.initialized$.next(true);
    this.logger.log('OutboundService initialized');
  }
}
```

**Anti-pattern:**

```typescript
// ❌ WRONG: Async work in constructor
@injectable()
export class OutboundService {
  constructor(private apiFetch: IApiFetch) {
    // Constructor can't be async!
    this.loadCampaigns(); // Fire-and-forget (no error handling)
  }
}
```

**Why Wrong?**

- Constructors can't be async
- No error handling for initialization
- Race conditions (service accessed before init completes)

---

## Reactive State Pattern

This section explores RxJS BehaviorSubject patterns.

### 4.1 Why BehaviorSubject?

**BehaviorSubject vs Subject:**

```typescript
// Subject: No initial value
const subject = new Subject<number>();
subject.subscribe((val) => console.log('Subscriber 1:', val));
subject.next(1); // Subscriber 1: 1

// New subscriber gets nothing (missed previous value)
subject.subscribe((val) => console.log('Subscriber 2:', val));
subject.next(2); // Subscriber 1: 2, Subscriber 2: 2

// BehaviorSubject: Has initial value
const behaviorSubject = new BehaviorSubject<number>(0); // Initial value: 0
behaviorSubject.subscribe((val) => console.log('Subscriber 1:', val)); // Subscriber 1: 0 (immediate)
behaviorSubject.next(1); // Subscriber 1: 1

// New subscriber gets current value immediately
behaviorSubject.subscribe((val) => console.log('Subscriber 2:', val)); // Subscriber 2: 1 (immediate)
behaviorSubject.next(2); // Subscriber 1: 2, Subscriber 2: 2
```

**Why BehaviorSubject for State:**

1. **Initial Value**: State always has a value (e.g., empty array, false, null)
2. **Immediate Emission**: New subscribers get current state immediately
3. **Synchronous Access**: Use `.value` to read current state without subscribing
4. **Stateful**: Remembers last emitted value

**Use Cases:**

- **BehaviorSubject**: State that always has a value (campaigns, loading, user)
- **Subject**: Events that have no current value (button clicks, API errors)
- **ReplaySubject**: State with history (last N values)

---

### 4.2 Subscription Management

**Critical Rule:** ALWAYS unsubscribe in `disconnectedCallback()` to prevent memory leaks.

**Pattern:**

```typescript
@Component({ tag: 'my-component' })
export class MyComponent implements ComponentInterface {
  @State() campaigns: Campaign[] = [];

  // Track subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    const service = starter.outbound;

    // Push subscription to array
    this.subscriptions.push(
      service.campaigns$.subscribe((campaigns) => {
        this.campaigns = campaigns;
      })
    );
  }

  // CRITICAL: Unsubscribe to prevent memory leaks
  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
```

**Memory Leak Example:**

```typescript
// ❌ WRONG: Subscription never cleaned up
componentWillLoad() {
  starter.outbound.campaigns$.subscribe(campaigns => {
    this.campaigns = campaigns;
  });

  // Subscription stays active even after component is destroyed!
  // Component instance can't be garbage collected!
}
```

**Why This is Bad:**

1. Component instance stays in memory (leak)
2. Subscription callback keeps running (wasted CPU)
3. Multiple instances leak (opening/closing components leaks more each time)

**Detection:**

Use Chrome DevTools → Memory → Take Heap Snapshot to detect leaks:

1. Take snapshot (initial)
2. Open/close component 10 times
3. Take snapshot (final)
4. Compare snapshots
5. Look for component instances that should be garbage collected

---

### 4.3 State Update Patterns

**Simple State Update:**

```typescript
// Emit new state
this.campaigns$.next([...newCampaigns]);

// All subscribers notified automatically
```

**Immutable Updates (Recommended):**

Always create new array/object when updating state (don't mutate).

```typescript
// ❌ WRONG: Mutating array
const campaigns = this.campaigns$.value;
campaigns.push(newCampaign); // Mutation!
this.campaigns$.next(campaigns); // Same reference, may not trigger updates

// ✅ CORRECT: New array
const campaigns = this.campaigns$.value;
this.campaigns$.next([...campaigns, newCampaign]); // New reference
```

**Complex Updates:**

```typescript
// Update specific item
async startCampaign(id: string): Promise<boolean> {
  const response = await this.apiFetch.doPost<Campaign>(`/campaigns/${id}/start`, {});

  if (response.ok && response.data) {
    // Create new array with updated item
    const campaigns = this.campaigns$.value.map(c =>
      c.id === id ? response.data! : c
    );
    this.campaigns$.next(campaigns);
    return true;
  }

  return false;
}

// Remove item
async deleteCampaign(id: string): Promise<boolean> {
  const response = await this.apiFetch.doDelete(`/campaigns/${id}`);

  if (response.ok) {
    // Create new array without deleted item
    const campaigns = this.campaigns$.value.filter(c => c.id !== id);
    this.campaigns$.next(campaigns);
    return true;
  }

  return false;
}
```

---

### 4.4 Derived State with RxJS Operators

**What:** Compute derived state from observables using RxJS operators.

**Example: Filter Campaigns by Status**

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  statusFilter$ = new BehaviorSubject<'active' | 'paused' | 'all'>('all');

  // Derived state: filtered campaigns
  filteredCampaigns$ = combineLatest([
    this.campaigns$,
    this.statusFilter$,
  ]).pipe(
    map(([campaigns, status]) => {
      if (status === 'all') return campaigns;
      return campaigns.filter(c => c.status === status);
    })
  );
}

// Component subscribes to derived state
componentWillLoad() {
  this.subscriptions.push(
    service.filteredCampaigns$.subscribe(campaigns => {
      this.campaigns = campaigns; // Auto-updates when campaigns or filter changes
    })
  );
}
```

**Benefits:**

- Automatic recomputation (no manual updates)
- Composable (combine multiple observables)
- Efficient (only recalculates when inputs change)

**Common Operators:**

- `map()`: Transform values
- `filter()`: Skip values
- `distinctUntilChanged()`: Skip duplicate values
- `debounceTime()`: Throttle updates
- `combineLatest()`: Combine multiple observables

---

### 4.5 Error State Management

**Pattern:** Expose error state as observable.

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null); // Error state

  async loadCampaigns(): Promise<void> {
    this.loading$.next(true);
    this.error$.next(null); // Clear previous error

    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
    } else {
      // Emit error state
      this.error$.next(response.error?.message || 'Unknown error');
      this.campaigns$.next([]);
    }

    this.loading$.next(false);
  }
}

// Component subscribes to error state
componentWillLoad() {
  this.subscriptions.push(
    service.error$.subscribe(error => {
      this.error = error; // Show error message in UI
    })
  );
}
```

**UI Pattern:**

```tsx
render() {
  return (
    <Host>
      {this.error && (
        <div class="error">
          <span>Error: {this.error}</span>
          <button onClick={() => service.loadCampaigns()}>Retry</button>
        </div>
      )}

      {this.loading ? (
        <div>Loading...</div>
      ) : (
        <div>{/* Campaign list */}</div>
      )}
    </Host>
  );
}
```

---

## API Layer

This section explores the API client design.

### 5.1 Non-throwing Pattern Rationale

**Traditional Approach (Throwing):**

```typescript
// ❌ Traditional: Promises reject on error
async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch('/campaigns');

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`); // Reject promise
  }

  return await response.json();
}

// Usage requires try-catch
try {
  const campaigns = await fetchCampaigns();
  console.log('Success:', campaigns);
} catch (error) {
  console.error('Error:', error); // Easy to forget!
}
```

**Problems:**

1. **Easy to forget**: Developers skip try-catch, unhandled rejections crash app
2. **Inconsistent errors**: Might throw Error, HTTP status, or JSON parse error
3. **No type safety**: TypeScript can't enforce error handling
4. **Ambiguous**: Is error network failure? HTTP error? Parse error?

**Our Approach (Non-throwing):**

```typescript
// ✅ Our approach: Promises resolve to IApiResponse<T>
async function fetchCampaigns(): Promise<IApiResponse<Campaign[]>> {
  const response = await fetch('/campaigns');

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: {
        message: `HTTP ${response.status}`,
        status: response.status,
        statusText: response.statusText,
      },
    };
  }

  const data = await response.json();
  return {
    ok: true,
    status: response.status,
    data,
  };
}

// Usage is explicit (no try-catch needed)
const response = await fetchCampaigns();

if (response.ok && response.data) {
  console.log('Success:', response.data);
} else {
  console.error('Error:', response.error?.message);
}
```

**Benefits:**

1. **Explicit**: Error handling is visible and required
2. **Type-safe**: TypeScript enforces checking `ok` flag
3. **Consistent**: All errors have same structure
4. **Clear**: Error details in `error` field

---

### 5.2 IApiResponse Design

**Interface Definition:**

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

**Design Decisions:**

1. **`ok: boolean`**: Single source of truth for success/failure
2. **`data?: T`**: Optional because might be missing on error
3. **`error?: {...}`**: Structured error (not raw Error object)
4. **Pagination fields**: Included in response (not separate object)
5. **`serverDateDiff`**: Time sync for client-side calculations

**Usage Patterns:**

```typescript
// Success check
if (response.ok && response.data) {
  // TypeScript knows response.data is T
  console.log(response.data);
}

// Error handling
if (!response.ok) {
  // TypeScript knows response.error might exist
  console.error(response.error?.message);
}

// Pagination
if (response.ok && response.data) {
  console.log(`Showing ${response.data.length} of ${response.total} items`);
}
```

**Why `data` AND `error` are optional:**

```typescript
// HTTP 204 No Content (no data, no error)
{
  ok: true,
  status: 204,
  // No data field
}

// HTTP 500 Error (error, possibly no data)
{
  ok: false,
  status: 500,
  error: { message: 'Server error' },
  // No data field
}

// HTTP 430 MFA Required (error, but also data)
{
  ok: false,
  status: 430,
  data: { mfaMethods: ['sms', 'email'] }, // Extra data for error handling
  error: { message: 'MFA required' },
}
```

---

### 5.3 Error Handling Strategies

**Strategy 1: Graceful Degradation**

Show empty state instead of crashing.

```typescript
async loadCampaigns(): Promise<void> {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
  } else {
    // Graceful: Show empty list, log error
    this.campaigns$.next([]);
    this.logger.error('Failed to load campaigns:', response.error?.message);
  }
}
```

**Strategy 2: Retry with Exponential Backoff**

Retry failed requests with increasing delay.

```typescript
async loadCampaigns(retries = 3): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
      return; // Success
    }

    // Retry with exponential backoff
    if (attempt < retries - 1) {
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  this.campaigns$.next([]);
  this.logger.error('Failed to load campaigns after retries');
}
```

**Strategy 3: User Notification**

Emit error state for UI to display.

```typescript
async loadCampaigns(): Promise<void> {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
    this.error$.next(null); // Clear error
  } else {
    this.campaigns$.next([]);
    this.error$.next(response.error?.message || 'Failed to load campaigns');
  }
}

// Component shows error message
render() {
  return (
    <Host>
      {this.error && <div class="error">{this.error}</div>}
      {/* ... */}
    </Host>
  );
}
```

**Strategy 4: Fallback to Cache**

Use cached data if API fails.

```typescript
private cachedCampaigns: Campaign[] = [];

async loadCampaigns(): Promise<void> {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  if (response.ok && response.data) {
    this.cachedCampaigns = response.data; // Update cache
    this.campaigns$.next(response.data);
  } else {
    // Fallback to cache
    this.campaigns$.next(this.cachedCampaigns);
    this.logger.warn('Using cached campaigns due to API error');
  }
}
```

---

### 5.4 Request Cancellation

**Pattern:** Use AbortSignal to cancel in-flight requests.

**Manual Cancellation:**

```typescript
const controller = new AbortController();

// Start request
const promise = this.apiFetch.doGet<Campaign[]>('/campaigns', {
  signal: controller.signal,
});

// Cancel request
controller.abort();
```

**Auto-cancellation (Search/Autocomplete):**

```typescript
// Built-in auto-cancel: new request cancels previous
async searchCampaigns(query: string): Promise<void> {
  const response = await this.apiFetch.doGet<Campaign[]>(
    `/campaigns?q=${query}`,
    { useAbort: true } // Auto-cancel previous request
  );

  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
  }
}

// User types "a" → request 1 starts
// User types "ab" → request 1 canceled, request 2 starts
// User types "abc" → request 2 canceled, request 3 starts
```

**Component Cleanup:**

```typescript
@Component({ tag: 'search-campaigns' })
export class SearchCampaigns implements ComponentInterface {
  private abortController = new AbortController();

  async handleSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    const response = await starter.outbound.searchCampaigns(query, {
      signal: this.abortController.signal,
    });

    // Handle response...
  }

  disconnectedCallback() {
    // Cancel in-flight request when component unmounts
    this.abortController.abort();
  }
}
```

---

### 5.5 Pagination Patterns

**Pattern:** Use `total`, `skipped`, and `link` from IApiResponse.

**Basic Pagination:**

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  totalCount$ = new BehaviorSubject<number>(0);
  currentPage$ = new BehaviorSubject<number>(0);

  async loadCampaigns(page: number, pageSize: number): Promise<void> {
    const skip = page * pageSize;
    const response = await this.apiFetch.doGet<Campaign[]>(
      `/campaigns?skip=${skip}&limit=${pageSize}`
    );

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
      this.totalCount$.next(response.total || 0);
      this.currentPage$.next(page);
    }
  }
}

// Component
componentWillLoad() {
  // Subscribe to campaigns and pagination
  this.subscriptions.push(
    service.campaigns$.subscribe(campaigns => {
      this.campaigns = campaigns;
    }),
    service.totalCount$.subscribe(total => {
      this.totalCount = total;
    }),
    service.currentPage$.subscribe(page => {
      this.currentPage = page;
    })
  );

  // Load first page
  service.loadCampaigns(0, 20);
}
```

**Infinite Scroll:**

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  hasMore$ = new BehaviorSubject<boolean>(true);

  async loadMoreCampaigns(): Promise<void> {
    const currentCount = this.campaigns$.value.length;

    const response = await this.apiFetch.doGet<Campaign[]>(`/campaigns?skip=${currentCount}&limit=20`);

    if (response.ok && response.data) {
      // Append new campaigns
      const allCampaigns = [...this.campaigns$.value, ...response.data];
      this.campaigns$.next(allCampaigns);

      // Check if more available
      const hasMore = response.total ? allCampaigns.length < response.total : false;
      this.hasMore$.next(hasMore);
    }
  }
}
```

---

## Testing Strategy

This section explores testing patterns and best practices.

### 6.1 Service Testing Pattern

**Unit Test Structure:**

```typescript
describe('OutboundService', () => {
  let container: Container;
  let service: OutboundService;
  let mockApiFetch: jest.Mocked<IApiFetch>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Setup test container with mocks
    container = new Container();

    // Mock dependencies
    mockApiFetch = createMockApiFetch();
    mockLogger = createMockLogger();

    // Bind mocks
    container.bind(API_TYPES.ApiFetch).toConstantValue(mockApiFetch);
    container.bind(LOGGER_TYPES.Logger).toConstantValue(mockLogger);

    // Bind service under test
    container.bind(OUTBOUND_TYPES.OutboundService).to(OutboundService);

    // Get service instance
    service = container.get<OutboundService>(OUTBOUND_TYPES.OutboundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests...
});
```

**Why This Pattern:**

1. **Fresh container per test**: No state pollution between tests
2. **Mock dependencies**: Control behavior of IApiFetch, ILogger
3. **Real service**: Test actual implementation, not mock
4. **Cleanup**: Clear mocks after each test

---

### 6.2 Testing Observables

**Pattern 1: Test Value Changes**

```typescript
it('should update campaigns when load succeeds', async () => {
  const mockCampaigns: Campaign[] = [
    { id: '1', name: 'Campaign 1', status: 'active', dialedCount: 100, connectedCount: 50 },
  ];

  mockApiFetch.doGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: mockCampaigns,
  });

  await service.loadCampaigns();

  // Assert current value
  expect(service.campaigns$.value).toEqual(mockCampaigns);
});
```

**Pattern 2: Test Emissions**

```typescript
it('should emit all state changes', async () => {
  const emissions: Campaign[][] = [];

  // Subscribe to capture all emissions
  service.campaigns$.subscribe((campaigns) => {
    emissions.push([...campaigns]);
  });

  mockApiFetch.doGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: mockCampaigns,
  });

  await service.loadCampaigns();

  // Assert emissions
  expect(emissions).toHaveLength(2); // Initial [] + loaded data
  expect(emissions[0]).toEqual([]); // Initial
  expect(emissions[1]).toEqual(mockCampaigns); // After load
});
```

**Pattern 3: Test Loading State**

```typescript
it('should set loading state during request', async () => {
  const loadingStates: boolean[] = [];

  service.loading$.subscribe((loading) => {
    loadingStates.push(loading);
  });

  mockApiFetch.doGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: [],
  });

  await service.loadCampaigns();

  // Assert loading transitions: false → true → false
  expect(loadingStates).toContain(true);
  expect(service.loading$.value).toBe(false);
});
```

---

### 6.3 Testing API Interactions

**Pattern 1: Assert API Calls**

```typescript
it('should call API with correct endpoint', async () => {
  mockApiFetch.doGet.mockResolvedValue({ ok: true, status: 200, data: [] });

  await service.loadCampaigns();

  expect(mockApiFetch.doGet).toHaveBeenCalledWith('/campaigns');
  expect(mockApiFetch.doGet).toHaveBeenCalledTimes(1);
});
```

**Pattern 2: Test Error Handling**

```typescript
it('should handle API error gracefully', async () => {
  mockApiFetch.doGet.mockResolvedValue({
    ok: false,
    status: 500,
    error: { message: 'Server error' },
  });

  await service.loadCampaigns();

  // Assert error handling
  expect(service.campaigns$.value).toEqual([]); // Empty array
  expect(service.loading$.value).toBe(false); // Not loading
});
```

**Pattern 3: Test Multiple Operations**

```typescript
it('should update campaign in list after starting', async () => {
  // Setup: Load campaigns
  const mockCampaign: Campaign = {
    id: '1',
    name: 'Campaign 1',
    status: 'paused',
    dialedCount: 100,
    connectedCount: 50,
  };

  mockApiFetch.doGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: [mockCampaign],
  });

  await service.loadCampaigns();

  // Action: Start campaign
  const updatedCampaign = { ...mockCampaign, status: 'active' as const };
  mockApiFetch.doPost.mockResolvedValue({
    ok: true,
    status: 200,
    data: updatedCampaign,
  });

  const result = await service.startCampaign('1');

  // Assert
  expect(result).toBe(true);
  expect(service.campaigns$.value[0]?.status).toBe('active');
});
```

---

### 6.4 Component Testing Challenges

**Challenge:** Components access services via container, which is a singleton.

**Solution 1: Mock Container Getter**

```typescript
describe('MyComponent', () => {
  let mockService: jest.Mocked<IOutboundService>;

  beforeEach(() => {
    mockService = {
      campaigns$: new BehaviorSubject<Campaign[]>([]),
      loadCampaigns: jest.fn(),
    };

    // Override container getter
    Object.defineProperty(starter, 'outbound', {
      get: () => mockService,
      configurable: true,
    });
  });

  it('should load campaigns on mount', async () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });

    expect(mockService.loadCampaigns).toHaveBeenCalled();
  });
});
```

**Solution 2: Test with Real Container**

```typescript
describe('MyComponent (Integration)', () => {
  beforeAll(async () => {
    // Initialize real container
    await starter.init({ apiBaseUrl: 'http://localhost:3001/t/test/v1' });
  });

  it('should render campaigns', async () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });

    // Wait for async load
    await page.waitForChanges();

    // Assert component rendered
    expect(page.root?.shadowRoot?.querySelector('.campaigns')).toBeTruthy();
  });
});
```

---

### 6.5 Test Coverage Goals

**Target Coverage:**

- **Services**: 80%+ (focus on business logic)
- **Components**: 60%+ (focus on interaction logic)
- **Utilities**: 90%+ (pure functions, easy to test)

**What to Test:**

1. **Happy path**: Normal operation succeeds
2. **Error path**: Failures handled gracefully
3. **Edge cases**: Empty arrays, null values, boundary conditions
4. **State transitions**: Loading states, error states
5. **Side effects**: API calls, logging, observable emissions

**What NOT to Test:**

1. **Framework internals**: Stencil rendering, RxJS operators
2. **Third-party libraries**: Inversify DI, fetch API
3. **Type definitions**: TypeScript compiler checks these

---

## Performance Considerations

This section explores performance optimization patterns.

### 7.1 Subscription Memory Leaks

**Problem:** Subscriptions keep references to component instances, preventing garbage collection.

**Leak Example:**

```typescript
// ❌ WRONG: Subscription never cleaned up
@Component({ tag: 'my-component' })
export class MyComponent {
  componentWillLoad() {
    starter.outbound.campaigns$.subscribe((campaigns) => {
      // This callback keeps reference to component instance
      this.campaigns = campaigns;
    });

    // When component unmounts, subscription stays active!
    // Component instance can't be garbage collected!
  }
}
```

**Memory Growth:**

```
Open component → 1 subscription active, 1 component in memory
Close component → 1 subscription active, 1 component in memory (LEAK!)
Open component → 2 subscriptions active, 2 components in memory (LEAK!)
Close component → 2 subscriptions active, 2 components in memory (LEAK!)
... (memory grows unbounded)
```

**Solution:** Unsubscribe in `disconnectedCallback()`

```typescript
// ✅ CORRECT: Subscriptions cleaned up
@Component({ tag: 'my-component' })
export class MyComponent implements ComponentInterface {
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    this.subscriptions.push(
      starter.outbound.campaigns$.subscribe((campaigns) => {
        this.campaigns = campaigns;
      })
    );
  }

  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
```

**Detection Tool:**

Chrome DevTools → Memory → Heap Snapshot:

1. Take snapshot (before)
2. Open/close component 10 times
3. Take snapshot (after)
4. Compare snapshots → look for retained component instances

---

### 7.2 Re-render Optimization

**Problem:** Every state change triggers re-render, even if data didn't change.

**Example:**

```typescript
// Service emits frequently
setInterval(() => {
  this.campaigns$.next(this.campaigns$.value); // Same data, but new emission
}, 1000);

// Component re-renders every second (unnecessary)
service.campaigns$.subscribe((campaigns) => {
  this.campaigns = campaigns; // Triggers re-render
});
```

**Solution 1: Use `distinctUntilChanged()`**

```typescript
import { distinctUntilChanged } from 'rxjs/operators';

// Skip emissions if data hasn't changed
this.subscriptions.push(
  service.campaigns$
    .pipe(
      distinctUntilChanged((prev, curr) => {
        // Custom comparison (e.g., compare array lengths)
        return prev.length === curr.length && prev[0]?.id === curr[0]?.id;
      })
    )
    .subscribe((campaigns) => {
      this.campaigns = campaigns; // Only triggered if data changed
    })
);
```

**Solution 2: Debounce Rapid Updates**

```typescript
import { debounceTime } from 'rxjs/operators';

// Wait 300ms after last emission before updating
this.subscriptions.push(
  service.campaigns$.pipe(debounceTime(300)).subscribe((campaigns) => {
    this.campaigns = campaigns;
  })
);
```

**Solution 3: Use @Watch() for Conditional Logic**

```typescript
@Component({ tag: 'my-component' })
export class MyComponent {
  @State() campaigns: Campaign[] = [];

  // Only recalculate stats if array length changed
  @Watch('campaigns')
  campaignsChanged(newCampaigns: Campaign[], oldCampaigns: Campaign[]) {
    if (newCampaigns.length !== oldCampaigns.length) {
      this.recalculateStats();
    }
  }

  recalculateStats() {
    // Expensive calculation
  }
}
```

---

### 7.3 Bundle Size Optimization

**Problem:** Large dependencies increase bundle size and load time.

**Analysis:**

```bash
# Build and analyze bundle
pnpm build

# Check bundle size
ls -lh dist/
```

**Optimization 1: Tree-shaking**

Only import what you need from RxJS:

```typescript
// ❌ WRONG: Imports entire RxJS
import * as rxjs from 'rxjs';
const subject = new rxjs.BehaviorSubject(0);

// ✅ CORRECT: Imports only BehaviorSubject
import { BehaviorSubject } from 'rxjs';
const subject = new BehaviorSubject(0);
```

**Optimization 2: Lazy-load Heavy Dependencies**

```typescript
async componentWillLoad() {
  // Lazy-load heavy library
  const { HeavyChart } = await import('./heavy-chart');
  this.chart = new HeavyChart();
}
```

**Optimization 3: Code Splitting**

Stencil automatically code-splits components. Each component is a separate chunk loaded on demand.

---

### 7.4 API Request Optimization

**Problem 1: Redundant Requests**

Component loads data even if already loaded.

**Solution: Check Cache Before Loading**

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  private loaded = false;

  async loadCampaigns(force = false): Promise<void> {
    // Skip if already loaded (unless forced)
    if (this.loaded && !force) {
      this.logger.debug('Campaigns already loaded, skipping');
      return;
    }

    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
      this.loaded = true;
    }
  }
}
```

**Problem 2: Parallel Requests**

Multiple components load same data simultaneously.

**Solution: Deduplicate Requests**

```typescript
export class OutboundService {
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  private loadingPromise: Promise<void> | null = null;

  async loadCampaigns(): Promise<void> {
    // Return existing promise if load in progress
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadCampaigns();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async _loadCampaigns(): Promise<void> {
    const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

    if (response.ok && response.data) {
      this.campaigns$.next(response.data);
    }
  }
}
```

**Problem 3: Waterfall Requests**

Sequential requests block each other.

**Solution: Parallel Requests**

```typescript
// ❌ WRONG: Sequential (slow)
await service.loadCampaigns();
await service.loadUsers();
await service.loadSettings();

// ✅ CORRECT: Parallel (fast)
await Promise.all([service.loadCampaigns(), service.loadUsers(), service.loadSettings()]);
```

---

### 7.5 Virtual Scrolling for Large Lists

**Problem:** Rendering 10,000+ items is slow and memory-intensive.

**Solution:** Virtual scrolling (only render visible items).

**Pattern (Conceptual):**

```typescript
@Component({ tag: 'virtual-list' })
export class VirtualList {
  @Prop() items: any[] = [];
  @Prop() itemHeight = 50;
  @State() visibleItems: any[] = [];

  private scrollContainer!: HTMLElement;

  componentDidLoad() {
    this.scrollContainer.addEventListener('scroll', this.handleScroll);
    this.updateVisibleItems();
  }

  handleScroll = () => {
    this.updateVisibleItems();
  };

  updateVisibleItems() {
    const scrollTop = this.scrollContainer.scrollTop;
    const viewportHeight = this.scrollContainer.clientHeight;

    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);

    this.visibleItems = this.items.slice(startIndex, endIndex);
  }

  render() {
    return (
      <div
        ref={el => this.scrollContainer = el!}
        style={{ height: '500px', overflow: 'auto' }}
      >
        <div style={{ height: `${this.items.length * this.itemHeight}px` }}>
          {this.visibleItems.map((item, index) => (
            <div key={index} style={{ height: `${this.itemHeight}px` }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
```

**Library:** Consider using `@lit-labs/virtualizer` for production virtual scrolling.

---

## Common Pitfalls and Solutions

This section covers common mistakes and how to avoid them.

### 8.1 Memory Leak: Forgetting to Unsubscribe

**Problem:**

```typescript
// ❌ WRONG
@Component({ tag: 'my-component' })
export class MyComponent {
  componentWillLoad() {
    starter.outbound.campaigns$.subscribe((campaigns) => {
      this.campaigns = campaigns;
    });
    // Subscription never cleaned up → memory leak
  }
}
```

**Symptom:**

- Memory usage grows over time
- App slows down after opening/closing components
- DevTools shows retained component instances

**Solution:**

```typescript
// ✅ CORRECT
@Component({ tag: 'my-component' })
export class MyComponent implements ComponentInterface {
  private subscriptions: Subscription[] = [];

  componentWillLoad() {
    this.subscriptions.push(
      starter.outbound.campaigns$.subscribe((campaigns) => {
        this.campaigns = campaigns;
      })
    );
  }

  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
```

---

### 8.2 Service Access Before Container Init

**Problem:**

```typescript
// ❌ WRONG
@Component({ tag: 'scx-root' })
export class ScxRoot {
  async componentWillLoad() {
    // Accessing service BEFORE init()
    const service = starter.outbound; // Error: not bound yet

    await starter.init({ apiBaseUrl: this.apiUrl });
  }
}
```

**Symptom:**

- Error: "No matching bindings found for serviceIdentifier"
- App crashes on load

**Solution:**

```typescript
// ✅ CORRECT
@Component({ tag: 'scx-root' })
export class ScxRoot implements ComponentInterface {
  @State() initialized = false;

  async componentWillLoad() {
    // Init FIRST
    await starter.init({ apiBaseUrl: this.apiUrl });
    this.initialized = true;
  }

  render() {
    return this.initialized ? <smilecx-outbound-manager /> : <Loading />;
  }
}
```

---

### 8.3 Mutating BehaviorSubject State

**Problem:**

```typescript
// ❌ WRONG: Mutating array
const campaigns = this.campaigns$.value;
campaigns.push(newCampaign); // Mutation!
this.campaigns$.next(campaigns); // Same reference
```

**Symptom:**

- Components don't re-render
- State appears stale
- Observables don't emit (same reference)

**Solution:**

```typescript
// ✅ CORRECT: New array
const campaigns = this.campaigns$.value;
this.campaigns$.next([...campaigns, newCampaign]); // New reference
```

**Why:** Stencil compares references for @State changes. Same reference = no re-render.

---

### 8.4 Missing ComponentInterface

**Problem:**

```typescript
// ❌ WRONG: Missing ComponentInterface
@Component({ tag: 'my-component' })
export class MyComponent {
  componentWillLoad() {
    /* ... */
  }
  disconnectedCallback() {
    /* ... */
  }
}
```

**Symptom:**

- TypeScript errors on lifecycle hooks
- IDE autocomplete doesn't suggest lifecycle methods

**Solution:**

```typescript
// ✅ CORRECT: Implement ComponentInterface
import type { ComponentInterface } from '@stencil/core';

@Component({ tag: 'my-component' })
export class MyComponent implements ComponentInterface {
  componentWillLoad() {
    /* ... */
  }
  disconnectedCallback() {
    /* ... */
  }
}
```

---

### 8.5 Using @Prop() for Service Injection

**Problem:**

```typescript
// ❌ WRONG: Injecting service as @Prop()
@Component({ tag: 'my-component' })
export class MyComponent {
  @Prop() outboundService!: IOutboundService;

  componentWillLoad() {
    this.outboundService.loadCampaigns();
  }
}

// Parent must pass service
<my-component outboundService={starter.outbound}></my-component>
```

**Why Wrong:**

- Breaks encapsulation (parent knows about service)
- Verbose (every usage requires prop passing)
- Difficult to test (mock via prop)
- Not scalable (what if component needs 5 services?)

**Solution:**

```typescript
// ✅ CORRECT: Access via container
@Component({ tag: 'my-component' })
export class MyComponent {
  componentWillLoad() {
    const service = starter.outbound;
    service.loadCampaigns();
  }
}

// No props needed
<my-component></my-component>
```

---

### 8.6 Async Constructor

**Problem:**

```typescript
// ❌ WRONG: Async work in constructor
@injectable()
export class OutboundService {
  constructor(private apiFetch: IApiFetch) {
    // Constructor can't be async!
    this.loadCampaigns(); // Fire-and-forget (no error handling)
  }

  async loadCampaigns() {
    /* ... */
  }
}
```

**Why Wrong:**

- Constructors can't be async
- No error handling
- Service considered "ready" before data loads
- Race conditions (accessed before init completes)

**Solution:**

```typescript
// ✅ CORRECT: Separate init method
@injectable()
export class OutboundService {
  private initialized$ = new BehaviorSubject<boolean>(false);

  constructor(private apiFetch: IApiFetch) {
    // Synchronous only
  }

  async init(): Promise<void> {
    await this.loadCampaigns();
    this.initialized$.next(true);
  }
}

// Container calls init
await starter.init({ apiBaseUrl: '...' });
await starter.outbound.init();
```

---

### 8.7 Self-closing Tags in JSX

**Problem:**

```tsx
// ❌ WRONG: Self-closing tags not allowed in Stencil
render() {
  return (
    <Host>
      <input type="text" />
      <img src="logo.png" />
      <br />
    </Host>
  );
}
```

**Symptom:**

- Build error: "Self-closing tags not allowed"

**Solution:**

```tsx
// ✅ CORRECT: Explicit closing tags
render() {
  return (
    <Host>
      <input type="text"></input>
      <img src="logo.png"></img>
      <br></br>
    </Host>
  );
}
```

**Exception:** Fragment shorthand `<>...</>` is allowed.

---

### 8.8 Forgetting reflect-metadata Import

**Problem:**

```typescript
// ❌ WRONG: Missing reflect-metadata
// src/global/global.ts (empty)

// Inversify uses reflect-metadata for decorators
@injectable()
export class MyService {
  /* ... */
}
```

**Symptom:**

- Runtime error: "Reflect.getMetadata is not a function"
- DI doesn't work

**Solution:**

```typescript
// ✅ CORRECT: Import reflect-metadata
// src/global/global.ts
import 'reflect-metadata';
```

**Why:** Inversify uses Reflect Metadata API for decorator information. Must be imported once globally.

---

### 8.9 Symbol() vs Symbol.for()

**Problem:**

```typescript
// ❌ WRONG: Using Symbol() (always unique)
export const OUTBOUND_TYPES = {
  OutboundService: Symbol('OutboundService'),
};

// Different modules get different symbols!
const symbol1 = Symbol('OutboundService');
const symbol2 = Symbol('OutboundService');
console.log(symbol1 === symbol2); // false
```

**Symptom:**

- Binding not found (symbol mismatch)
- DI errors

**Solution:**

```typescript
// ✅ CORRECT: Using Symbol.for() (global registry)
export const OUTBOUND_TYPES = {
  OutboundService: Symbol.for('OutboundService'),
};

// Same string = same symbol
const symbol1 = Symbol.for('OutboundService');
const symbol2 = Symbol.for('OutboundService');
console.log(symbol1 === symbol2); // true
```

---

### 8.10 Not Handling API Errors

**Problem:**

```typescript
// ❌ WRONG: Assuming API always succeeds
async loadCampaigns() {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  // What if response.ok is false?
  // What if response.data is undefined?
  this.campaigns$.next(response.data); // Might be undefined!
}
```

**Symptom:**

- Runtime errors (undefined access)
- UI shows broken state
- No error messages

**Solution:**

```typescript
// ✅ CORRECT: Explicit error handling
async loadCampaigns() {
  const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

  if (response.ok && response.data) {
    this.campaigns$.next(response.data);
  } else {
    this.logger.error('Failed:', response.error?.message);
    this.campaigns$.next([]); // Fallback to empty array
  }
}
```

---

## Conclusion

This architecture guide covers the fundamental patterns and principles used in the SmileCX Frontend Starter. The key takeaways:

1. **Dependency Injection**: All services use Inversify DI for loose coupling and testability
2. **Reactive State**: BehaviorSubject provides predictable, observable state management
3. **Non-throwing APIs**: IApiResponse<T> pattern forces explicit error handling
4. **Module Architecture**: Self-contained modules with clear boundaries
5. **Shell vs Application**: Separate initialization from business logic
6. **Type Safety**: Strict TypeScript catches errors at compile time

**Common Patterns:**

- Constructor injection with `@inject()`
- BehaviorSubject for reactive state
- Subscription management with cleanup
- Interface-first service design
- Non-throwing API responses

**Common Pitfalls:**

- Memory leaks from unsubscribed observables
- Accessing services before container init
- Mutating BehaviorSubject state
- Using @Prop() for service injection
- Forgetting reflect-metadata import

By following these patterns and avoiding these pitfalls, you'll build maintainable, testable, and performant SmileCX applications.

---

**Questions?**

- Read the [README.md](./README.md) for usage guide
- Study the reference implementation in `src/apps/outbound-manager/`
- Contact the SmileCX team for architectural guidance

**Contributing:**

Found an architectural issue or have a suggestion? Open a GitHub issue or submit a pull request.

---

**License:** MIT
