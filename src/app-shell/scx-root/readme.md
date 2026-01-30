# scx-root

Root component that initializes the DI container and mounts the application.

## Responsibilities

- **Container Initialization**: Calls `starter.init()` with runtime configuration
- **Loading State**: Shows loading indicator during initialization
- **App Mounting**: Renders application component(s) after init completes

## Pattern: Shell vs Application Layer

**Shell Layer (scx-root)**:

- Container initialization only
- No business logic
- No service usage
- No subscriptions
- Stable mounting point

**Application Layer (app components)**:

- Business logic
- Service usage via container getters
- Observable subscriptions
- User interactions

This separation ensures:

- Clear responsibilities
- Easy to add/remove apps
- External developers know where to put their code

## Usage

```html
<scx-root api-url="http://localhost:3001/t/acme-corp/v1"></scx-root>
```

## Properties

| Property | Type   | Description               | Default |
| -------- | ------ | ------------------------- | ------- |
| `apiUrl` | string | API base URL for requests | `''`    |

## Example

```html
<!-- Development -->
<scx-root api-url="http://localhost:3001/t/acme-corp/v1"></scx-root>

<!-- Production -->
<scx-root api-url="https://api.smilecx.com/t/acme-corp/v1"></scx-root>
```
