# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` as the package manager (a `bun.lock` file is present).

```bash
bun dev          # Start development server with HMR
bun run build    # Production build
bun run lint     # Run ESLint
bun run preview  # Preview production build locally
```

There is no test runner configured.

## Architecture

This is a React 19 + Vite 7 single-page application.

- **`index.html`** — HTML entry point, loads `src/main.jsx`
- **`src/main.jsx`** — Renders `<App>` into the DOM root
- **`src/App.jsx`** — Main application component
- **`vite.config.js`** — Vite config with `@vitejs/plugin-react` (Babel-based) and `babel-plugin-react-compiler` enabled for automatic performance optimization

ESLint uses the flat config format (`eslint.config.js`) with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. The `no-unused-vars` rule ignores capitalized variables (React components).
