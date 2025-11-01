# Next.js-Express Template 🚀

A modern Next.js-Express monorepo template with full TypeScript support, TailwindCSS for styling, and scalable folder structures for both frontend and backend projects. Built for performance, developer experience, and production-readiness.

## 📌 Features

### 🖙 Backend (Express + TypeScript)

- Built with Express.js and TypeScript
- Scalable file structure (controllers, routes, services, middlewares, models)
- Centralized configuration and constants
- API documentation with Swagger
- Database integration ready
- Linting with ESLint and Prettier
- Testing with Vitest
- Easy CI/CD Integration Possibility

### 🌐 Frontend (Next.js + TailwindCSS + Shad/cn)

- Server-side rendering with Next.js
- Modern React with TypeScript
- App Router and file-based routing
- UI styling via TailwindCSS
- Component-based architecture
- Utility functions and shared libraries
- Shad/cn for TailwindCSS
- Ready for expansion using component libraries

### 🩰 Tooling

- Package management using PNPM
- Workspace-based project management
- Consistent formatting using Prettier
- Modular folder structure
- Git-ready with proper .gitignore files
- Fully typed configurations

## 🚀 Getting Started

### 1️⃣ Prerequisites

- Node.js ≥ 20
- PNPM (Install via npm i -g pnpm)
- Rename .env.example to .env

### 2️⃣ Install Dependencies

```bash
pnpm install
```

### 3️⃣ Start Development

```bash
pnpm run dev
```

### 4️⃣ Build for Production

```bash
pnpm run build
```

## 🧪 Scripts

### Format code

```bash
pnpm format
```

### Run ESLint

```bash
pnpm lint
```

## 📂 Project Structure

```bash
.
├── .env                  # Environment variables
├── .env.example          # Example env file
├── .gitignore            # Git ignored files
├── .prettierrc           # Prettier config
├── .prettierignore       # Prettier ignore
├── backend/              # Express backend
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── constants.ts
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── utils/
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   └── lib/
├── package.json          # Root config
├── pnpm-lock.yaml        # Lock file
└── README.md             # You’re here!
```

Made with ❤️ by [Vedant](https://github.com/InventedSarawak)
