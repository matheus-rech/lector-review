# Lector Review GEMINI.md

## Project Overview

This is a React-based PDF viewer application called "Lector Review," designed for systematic review and data extraction from research papers. It allows users to manage multiple projects, view PDFs, search for text, create highlights, and extract data into structured forms. All data is persisted in the browser's `localStorage`.

The application is built with React 19, TypeScript, Vite, and Tailwind CSS. It uses the `@anaralabs/lector` library for PDF viewing and `pdfjs-dist` for PDF rendering. PDF files are stored in IndexedDB, managed by a custom hook (`usePDFManager`).

## Building and Running

### Prerequisites

- Node.js and pnpm

### Installation

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Development

1.  **Start the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Production

1.  **Build for production:**
    ```bash
    pnpm run build
    ```

2.  **Preview the production build:**
    ```bash
    pnpm run preview
    ```

### Testing

-   **Run unit tests:**
    ```bash
    pnpm test
    ```

-   **Run end-to-end tests:**
    ```bash
    pnpm test:e2e
    ```

## Development Conventions

-   **State Management:** The application's state is managed using React hooks (`useState`, `useEffect`, `useCallback`) and stored in `localStorage`.
-   **Styling:** Tailwind CSS is used for styling.
-   **PDF Management:** A custom hook, `usePDFManager`, handles all PDF-related operations, including storage in IndexedDB.
-   **Data Extraction:** A dynamic form, `SchemaForm`, is generated from a JSON schema for structured data extraction.
-   **Linting and Formatting:** The project uses ESLint for linting and Prettier for code formatting.
-   **Type Checking:** TypeScript is used for static type checking.
