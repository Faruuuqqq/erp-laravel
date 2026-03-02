# StoreMate Genie ERP - Frontend

A modern, lightweight Local LAN ERP & Inventory System built with React + TypeScript + Vite.

## Features

- 📦 Inventory Management
- 👥 Customer & Supplier Management
- 💸 Sales & Purchase Transactions
- 📊 Reporting & Analytics
- 🎨 Beautiful responsive UI built with shadcn/ui
- ⚡ Lightning-fast development with Vite
- 📝 Fully type-safe with TypeScript
- 🎯 React Router for seamless navigation
- 🎨 Tailwind CSS for modern styling
- 📦 Pnpm for fast, reliable package management

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

### Build for Production

```bash
# Build production bundle
pnpm build
```

### Preview Production Build

```bash
# Preview production build locally
pnpm preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/             # React context providers
├── hooks/              # Custom React hooks
│   └── api/            # React Query API hooks
├── lib/                # Utility functions & validations
│   ├── api/            # API endpoints & mock API
│   └── validations/      # Zod validation schemas
├── pages/              # Page components
│   ├── master/           # Master data pages
│   ├── transaksi/        # Transaction pages
│   └── informasi/        # Reporting & info pages
├── types/              # TypeScript type definitions
└── App.tsx              # Main app component
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **React Query** - Data fetching & caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Lucide React** - Icon library

## License

MIT

