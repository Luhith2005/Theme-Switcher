# Chroma Theme Lab

Chroma Theme Lab is a high-fidelity, production-grade global theming system built in React utilizing the Context API. It features multi-theme settings, OS-level integration, persistence, flash prevention, and advanced rendering performance optimizations.

## Core Features

- **Pill Theme Toggle**: Toggle between **Light**, **Dark**, and **System** sync preferences.
- **OS Theme Integration**: Automatically matches system colors and listens for runtime OS preference transitions.
- **No-Flash Painting**: Employs a synchronous inline script in `index.html` executing before the DOM paints to fetch preferences and append the appropriate class, resolving initial load flash.
- **Responsive Layout**: Designed with a clean visual matching scheme, cards, responsive sidebars, custom checkboxes, and status displays matching the design mockups.
- **Web Audio FX**: Soft mechanical toggle sounds synthesized natively via Web Audio API oscillators.
- **Dev Sandbox Panel**:
  - **Render Performance Visualizer**: Live log logger and component ref trackers showing real-time render counts.
  - **Custom Variables Customizer**: Sliders allowing developers to tweak color variables (`background`, `primary`, `surface`, `accent`, `text`) dynamically on a Custom Theme and export code directly.

## Performance Optimization (Zero Re-renders)

The application utilizes a **split-context pattern** to isolate rendering boundaries:
- `ThemeStateContext`: Distributes state parameters. Subscribed components re-render when colors toggle.
- `ThemeActionsContext`: Distributes state mutator functions (`setTheme`, `resetToSystem`). Components that only call actions (such as selector buttons or toggle clicks) do not subscribe to state, meaning they **never** trigger unnecessary visual repaints.
- `Memoized panel`: Demonstrates how components that do not subscribe to the Context stay locked at **1 render** while styling is handled dynamically via CSS cascading classes.

## CLI Scripts

### Setup & Run
```bash
# Install packages
npm install

# Start local server
npm run dev
```

### Checks & Tests
```bash
# Run Vitest unit tests
npm run test
```
