# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# One-Logger Vite Testing App

This is a simple Vite React application for testing the One-Logger library with different log types and metadata.

## Prerequisites

Before running this example, make sure:

1. The Electron app is running - this is where the logs will be displayed
2. You've installed all dependencies using `pnpm install` from the root directory

## Running the Example

1. From the root of the project:
   ```bash
   pnpm --filter react-vite dev
   ```

2. Or from this directory:
   ```bash
   pnpm dev
   ```

## How to Use

The app provides several buttons to test different logging capabilities:

1. **Info Log** - Sends a basic info-level log with simple metadata
2. **Warning Log** - Sends a warning-level log with simple metadata
3. **Error Log** - Sends an error-level log with simple metadata
4. **Log with Stack Trace** - Simulates an error and logs it with a stack trace
5. **Log Complex Data** - Logs nested and complex objects to test metadata rendering

## Features Demonstrated

- Different log levels (info, warn, error)
- Stack trace logging and rendering in the Electron app
- Complex nested metadata objects
- Long text values in metadata
- Log management when component mounts/unmounts
- Error handling for logger initialization

## How It Works

1. The app initializes the logger when it first loads
2. Each button triggers a different type of log
3. Logs are sent to the Electron app's logger service
4. You can view the logs in real-time in the Electron app interface

## Troubleshooting

If you see an error about the logger not initializing, make sure:

- The Electron app is running
- The API server in the Electron app is accessible (default: http://127.0.0.1:5173)
- Your workspace dependencies are properly set up

## Testing the Metadata Sheet

The "Log with Stack Trace" and "Log Complex Data" buttons are particularly useful for testing the Sheet component's ability to display complex metadata like stack traces and nested objects.
