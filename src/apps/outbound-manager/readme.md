# smilecx-outbound-manager

Outbound Manager application component demonstrating SmileCX patterns.

## Purpose

This component serves as the **reference implementation** for external developers building SmileCX-compatible applications. It demonstrates all core patterns:

1. **Service Access**: Via container getter (NOT @Prop injection)
2. **Reactive State**: BehaviorSubject subscriptions
3. **Lifecycle Management**: Subscribe/unsubscribe pattern
4. **Event Handlers**: User interaction handlers
5. **i18n**: Translation with tt() function

## Architecture

### Application Layer Pattern

This component represents the **Application Layer** in the SmileCX architecture:

- **scx-root (Shell Layer)**: Container initialization only
- **smilecx-outbound-manager (Application Layer)**: Business logic, service usage, UI

### Service Usage

```typescript
// Get service via container getter
const service = starter.outbound;

// Subscribe to observables
service.campaigns$.subscribe((campaigns) => {
  this.campaigns = campaigns;
});

// Call service methods
await service.loadCampaigns();
```

### Lifecycle Pattern

```typescript
componentWillLoad() {
  // 1. Get service
  const service = starter.outbound;

  // 2. Subscribe to observables
  this.subscriptions.push(
    service.campaigns$.subscribe(...)
  );

  // 3. Load initial data
  service.loadCampaigns();
}

disconnectedCallback() {
  // Cleanup subscriptions (prevent memory leaks)
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

## Key Patterns

### 1. Service Access via Container Getter

**✅ Correct:**

```typescript
const service = starter.outbound;
```

**❌ Incorrect:**

```typescript
@Prop() outboundService!: IOutboundService;
```

### 2. State Management

```typescript
// Component state mirrors service observables
@State() campaigns: Campaign[] = [];
@State() selectedCampaign: Campaign | null = null;
@State() loading = false;

// Subscribe to updates
service.campaigns$.subscribe(campaigns => {
  this.campaigns = campaigns;  // Triggers re-render
});
```

### 3. Event Handlers

```typescript
// Arrow function to preserve 'this' context
private handleCampaignSelect = (id: string) => {
  starter.outbound.selectCampaign(id);
};

// Use in JSX
<div onClick={() => this.handleCampaignSelect(campaign.id)}>
```

### 4. i18n Usage

```typescript
import { tt } from '../../libs/i18n';

// Simple translation
{
  tt('SM.OUTBOUND.TITLE');
}

// With interpolation
{
  tt('SM.OUTBOUND.CAMPAIGN.SELECTED', { name: campaign.name });
}
```

## For External Developers

When building your own SmileCX app, replicate this structure:

1. **Create service** in `src/apps/your-app/`:
   - `your-app.types.ts` - DI symbols
   - `your-app.interface.ts` - Domain types + service interface
   - `your-app.service.ts` - Business logic with BehaviorSubject
   - `your-app.module.ts` - DI module

2. **Register in container** (`src/di/starter-container.ts`):
   - Add module load in `init()`
   - Add convenience getter

3. **Create component** (`your-app.tsx`):
   - Get service via container getter
   - Subscribe to observables
   - Manage lifecycle (subscribe/unsubscribe)
   - Handle user interactions

4. **Mount in scx-root**:
   - Add `<your-app></your-app>` tag

See README.md "Building Your Own App" section for step-by-step guide.
