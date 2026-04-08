# Miniviz Documentation Website

This website is built using [Docusaurus 3](https://docusaurus.io/).

## Installation

```bash
cd website
npm install
```

## Local Development

To see changes immediately as you save files (Hot Reload), use the `start` command. Note that the development server runs one locale at a time.

- **Japanese (Recommended for current tasks)**:
  ```bash
  npm start -- --locale ja
  ```
- **English**:
  ```bash
  npm start
  ```

## Preview Production Build (Multi-language)

To test the final build including language switching, use the `preview` command. This builds all languages but **does not** support hot reload (you must restart the command to see changes).

```bash
npm run preview
```

## Writing Rules

Please refer to [STYLEGUIDE.md](./STYLEGUIDE.md) for document structure and formatting rules.

## Build & Deployment

### Build
```bash
npm run build
```

### Deployment (Vercel)
The site is configured for automatic deployment via Vercel when pushing to the `develop` branch.
