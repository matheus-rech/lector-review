# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lector Review is a React-based PDF viewer for systematic literature reviews and data extraction from research papers. Built for researchers conducting meta-analyses with features like multi-project management, text highlighting with labeling, per-page field templates, schema-based forms, and data export (JSON/CSV).

**Tech Stack:** React 19 + TypeScript 5.6 + Vite 5.4 + Tailwind CSS 3.4 + [@anaralabs/lector](https://lector-weld.vercel.app/docs) + PDF.js 4.6

## Installation & Setup

### Prerequisites
- **Node.js** 16.0 or later
- **React** 16.8+ (hooks support required)
- **Package manager:** npm, yarn, pnpm, or bun

### Installation

```bash
# Install BOTH required packages (peer dependency requirement)
pnpm add @anaralabs/lector pdfjs-dist

# Required CSS import (add to src/main.tsx)
import "pdfjs-dist/web/pdf_viewer.css";
```

**⚠️ Critical:** Both `@anaralabs/lector` AND `pdfjs-dist` must be installed. Lector has `pdfjs-dist` as a peer dependency.

### PDF.js Worker Configuration

The PDF.js worker must be configured before any PDF operations. This project uses Vite:

```typescript
// In App.tsx (before any Lector components)
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

**Other environments:**
- **Next.js App Router (13+):** Same as above
- **Next.js Pages Directory:** `import "pdfjs-dist/build/pdf.worker.min.mjs";`

## Common Commands

```bash
# Development
pnpm dev                # Start dev server (localhost:5173)
pnpm build              # Production build
pnpm preview            # Preview production build

# Testing
pnpm test               # Run unit tests (Vitest)
pnpm test:watch         # Run tests in watch mode
pnpm test:ui            # Open Vitest UI
pnpm test:coverage      # Generate coverage report
pnpm test:e2e           # Run E2E tests (Playwright)
pnpm test:e2e:ui        # Run E2E tests with UI

# Code Quality
pnpm type-check         # TypeScript type checking (no emit)
pnpm lint               # Run ESLint
pnpm format             # Format with Prettier
pnpm format:check       # Check formatting without changes

# Utilities
pnpm clean              # Remove node_modules, dist, .turbo
```

## Critical Architecture Patterns

### 1. Lector Hooks Context Requirement ⚠️

**MANDATORY:** All Lector hooks MUST be called inside `<Root>` context. This is the most common source of bugs.

```typescript
// ❌ WRONG - Hooks outside Root
function App() {
  const { jumpToPage } = usePdfJump(); // ERROR!
  return <Root source={pdf}>...</Root>
}

// ✅ CORRECT - Hooks inside Root
function App() {
  return (
    <Root source={pdf}>
      <PDFViewerContent />  {/* Hooks work here */}
    </Root>
  );
}

function PDFViewerContent() {
  const { jumpToPage } = usePdfJump(); // ✅ Works!
  const { searchResults } = useSearch();
  const selectionDimensions = useSelectionDimensions();
  // ... use hooks here
}
```

**Lector hooks requiring Root context:**
- `usePdfJump()` - Page navigation
- `useSearch()` - PDF text search
- `useSelectionDimensions()` - Text selection tracking
- `usePdf()` - PDF document access
- `usePDFPageNumber()` - Current page tracking

**Components that must be inside Root:**
- `ZoomIn`, `ZoomOut`, `CurrentZoom` - Zoom controls
- `Thumbnails`, `Thumbnail` - Thumbnail navigation
- `SelectionTooltip` - Selection UI

### 2. Data Persistence Architecture

**Two-tier storage system:**

**LocalStorage** (for lightweight data):
- Pattern: `proj:{projectName}:{dataType}`
- Examples:
  - `proj:default:highlights` - User highlights
  - `proj:study-2024:pageForm` - Form field values
  - `proj:meta-analysis:templates` - Field templates
- Global keys: `projects`, `current-project`

**IndexedDB** (for PDF files):
- Database: `LectorReviewDB`
- Store: `pdfs`
- Managed by `src/utils/pdfStorage.ts`
- Indexed by `projectName` for efficient queries

**Key Pattern:**
```typescript
const key = (project: string, name: string) => `proj:${project}:${name}`;
```

### 3. Per-Page Template System

Field data is page-specific, not global:

```typescript
// Template structure
type FieldTemplate = { id: string; label: string; placeholder?: string };
const templates: Record<number, FieldTemplate[]> = {
  1: [{ id: "study_id", label: "Study ID" }],
  2: [{ id: "study_design", label: "Design" }],
  // Different fields per page
};

// Data uses composite keys: "pageNumber:fieldId"
const fieldKey = `${pageNumber}:${fieldId}`;
// Example: "1:study_id" = "10.1161/STROKEAHA.116.014078"
```

### 4. Search Architecture

Search creates temporary highlights with two operational modes:

**Search Modes:**
1. **Exact Term Highlighting** - Highlights only the matching search term:
   ```typescript
   const rects = await calculateHighlightRects(pageProxy, {
     pageNumber: match.pageNumber,
     text: match.text,
     matchIndex: match.matchIndex || 0,
   });
   ```

2. **Full Context Highlighting** - Highlights entire text chunk containing the match:
   ```typescript
   const rects = await calculateHighlightRects(pageProxy, searchResult);
   ```

**Highlight Types:**
- User highlights: `kind: "user"`, color: green, persistent in localStorage
- Search highlights: `kind: "search"`, color: yellow, cleared on new search
- Navigation: Use `jumpToHighlightRects()` to navigate between results
- Search results tracked separately from highlights for navigation UI

### 5. Component Architecture

**Main App Structure:**
```
App (manages state, localStorage)
└── Root (Lector context provider)
    └── PDFViewerContent (uses Lector hooks)
        ├── Pages
        │   └── Page
        │       ├── CanvasLayer (PDF rendering)
        │       ├── TextLayer (text selection)
        │       └── ColoredHighlightLayer (highlights)
        ├── Thumbnails (optional sidebar)
        └── SelectionTooltip (highlight creation UI)
```

**Separation of Concerns:**
- `App.tsx`: State management, localStorage, project switching
- `PDFViewerContent`: PDF rendering, hooks, highlight management
- `components/`: Reusable UI (Modal, Toast, PDFUpload, etc.)
- `hooks/`: Custom hooks (usePDFManager, useDebounce, etc.)
- `utils/`: Pure functions (pdfStorage, schemaParser, validation, etc.)

## Component Reference

### Core Lector Components

All core components must be used within the `<Root>` context provider.

| Component | Purpose | Required | Notes |
|-----------|---------|----------|-------|
| `Root` | Document state container & context provider | Yes | All hooks must be inside this |
| `Pages` | Layout & virtualization container | Yes | Wraps all pages |
| `Page` | Individual page renderer | Yes | One per page |
| `CanvasLayer` | PDF visual rendering | Yes | Displays PDF content |
| `TextLayer` | Text selection & copying | Optional | Required for text interaction |
| `AnnotationLayer` | PDF links & annotations | Optional | Handles interactive PDFs & forms |
| `HighlightLayer` | Custom highlight overlays | Optional | Built-in highlighting support |
| `ColoredHighlightLayer` | Custom colored highlights | Optional | Project-specific implementation |

### Navigation Components

| Component | Purpose | Context Required | Usage |
|-----------|---------|------------------|-------|
| `Thumbnails` | Thumbnail container | Inside Root | Scrollable sidebar |
| `Thumbnail` | Individual thumbnail | Inside Thumbnails | Auto page sync on click |
| `ZoomIn` | Increase zoom level | Inside Root | Respects zoomOptions |
| `ZoomOut` | Decrease zoom level | Inside Root | Respects zoomOptions |
| `CurrentZoom` | Display current zoom | Inside Root | Shows percentage |

**Example Usage:**

```typescript
import { Thumbnails, Thumbnail, ZoomIn, ZoomOut, CurrentZoom } from "@anaralabs/lector";

// Thumbnail sidebar with zoom controls
<Root source={pdfUrl}>
  <div className="flex">
    {/* Thumbnail sidebar */}
    <div className="w-48 overflow-auto bg-gray-50">
      <Thumbnails className="p-2 space-y-2">
        <Thumbnail className="border rounded hover:border-blue-500 cursor-pointer" />
      </Thumbnails>
    </div>

    {/* Main viewer with zoom controls */}
    <div className="flex-1">
      <div className="zoom-controls flex gap-2">
        <ZoomOut />
        <CurrentZoom />
        <ZoomIn />
      </div>
      <Pages>
        <Page>
          <CanvasLayer />
          <TextLayer />
        </Page>
      </Pages>
    </div>
  </div>
</Root>
```

### Selection Components

| Component | Purpose | Context Required | Usage |
|-----------|---------|------------------|-------|
| `SelectionTooltip` | Contextual UI on text selection | Inside Root | Wraps custom selection UI |

**Example:**

```typescript
import { SelectionTooltip } from "@anaralabs/lector";

<SelectionTooltip>
  <div className="bg-white shadow-lg rounded p-2">
    <button onClick={handleHighlight}>Highlight</button>
    <button onClick={handleAddNote}>Add Note</button>
  </div>
</SelectionTooltip>
```

### UI Components (Project-Specific)

These are custom components built for Lector Review functionality:

| Component | Purpose | Location | Usage |
|-----------|---------|----------|-------|
| `Toast` | Non-blocking notifications | `components/Toast.tsx` | Success/error/info messages |
| `Modal` | Dialog modals (InputModal, ConfirmModal) | `components/Modal.tsx` | User input, confirmations |
| `PDFUpload` | PDF file upload UI | `components/PDFUpload.tsx` | Drag-and-drop PDF upload |
| `PDFList` | PDF library management | `components/PDFList.tsx` | View/select/delete PDFs |
| `SchemaForm` | Schema-based data extraction | `components/SchemaForm.tsx` | Structured field forms |
| `TemplateManager` | Field template editor | `components/TemplateManager.tsx` | Per-page field management |

### Root Component Props

```typescript
interface RootProps {
  source: string;                    // PDF URL or path (required)
  onLoad?: () => void;               // Callback when PDF loads
  onError?: (error: Error) => void;  // Error handler
  loader?: React.ReactNode;          // Custom loading component
  zoomOptions?: {
    minZoom?: number;  // Default: 0.1 (10%)
    maxZoom?: number;  // Default: 10 (1000%)
  };
  className?: string;                // CSS classes
  children: React.ReactNode;         // Child components
}
```

**Example:**

```typescript
<Root
  source="/sample.pdf"
  onLoad={() => console.log('PDF loaded')}
  onError={(err) => console.error('PDF error:', err)}
  loader={<div>Loading PDF...</div>}
  zoomOptions={{ minZoom: 0.5, maxZoom: 3 }}
  className="flex-1 flex flex-col"
>
  {/* Child components */}
</Root>
```

## Hook Reference

All hooks must be called inside components rendered within `<Root>`.

### usePdf()

Access PDF document store and state.

```typescript
const { setHighlights, highlights, numPages } = usePdf();
```

**Returns:**
- `numPages` - Total pages in PDF
- `highlights` - Current highlights array
- `setHighlights` - Update highlights function
- Other PDF state properties

### usePdfJump()

Navigate to specific pages or highlight locations.

```typescript
const { jumpToPage, jumpToHighlightRects } = usePdfJump();

// Jump to page
jumpToPage(5, { behavior: "auto" });

// Jump to highlight
jumpToHighlightRects([{
  pageNumber: 2,
  left: 100,
  top: 200,
  width: 150,
  height: 20
}]);
```

**Returns:**
- `jumpToPage(pageNum: number, options?: { behavior: "auto" })` - Navigate to page
- `jumpToHighlightRects(rects: HighlightRect[])` - Navigate to highlight

### useSearch()

Manage search state and results.

```typescript
const { searchResults, search } = useSearch();

// Perform search
search("term to find");
```

**Returns:**
- `searchResults` - Search results with exactMatches array
- `search(query: string)` - Perform search function
- `searchText` - Current search query
- `setSearchText` - Update search query

### useSelectionDimensions()

Track text selection state and dimensions.

```typescript
const selectionDimensions = useSelectionDimensions();

if (selectionDimensions && selectionDimensions.rects) {
  // User has selected text
  const { rects, text, pageNumber } = selectionDimensions;
}
```

**Returns:**
- `rects` - Array of selection rectangles
- `text` - Selected text content
- `pageNumber` - Page number of selection
- `collapsed` - Boolean indicating if selection is empty

### usePDFPageNumber()

Get current page number being viewed.

```typescript
const currentPage = usePDFPageNumber();
```

**Returns:** Current page number (1-indexed)

### usePDFManager()

Custom hook for complete PDF CRUD operations with IndexedDB storage.

```typescript
import { usePDFManager } from "@/hooks/usePDFManager";

const {
  pdfs,           // Array of all PDFs for current project
  loadPDFs,       // Load PDFs from IndexedDB
  uploadPDF,      // Upload new PDF
  deletePDF,      // Delete PDF by name
  currentPDF,     // Currently selected PDF
  setCurrentPDF,  // Set active PDF
  pdfUrl,         // Blob URL for current PDF
} = usePDFManager(projectName);

// Upload PDF
const handleUpload = async (file: File) => {
  try {
    await uploadPDF(file);
    showToast("PDF uploaded successfully!", "success");
  } catch (error) {
    showToast(`Upload failed: ${error.message}`, "error");
  }
};

// Delete PDF
const handleDelete = async (pdfName: string) => {
  try {
    await deletePDF(pdfName);
    showToast("PDF deleted", "success");
  } catch (error) {
    showToast(`Delete failed: ${error.message}`, "error");
  }
};
```

**Returns:**
- `pdfs` - Array of PDFMetadata objects for current project
- `loadPDFs()` - Async function to reload PDFs from IndexedDB
- `uploadPDF(file: File)` - Async function to upload PDF
- `deletePDF(name: string)` - Async function to delete PDF
- `currentPDF` - Currently selected PDF metadata
- `setCurrentPDF(pdf: PDFMetadata | null)` - Set active PDF
- `pdfUrl` - Blob URL for rendering current PDF (auto-managed)

**Key Features:**
- Automatic blob URL creation and cleanup
- Project-scoped PDF storage
- IndexedDB integration via `pdfStorage` utilities
- Error handling with detailed messages

### useToast()

Custom hook for displaying toast notifications.

```typescript
import { useToast } from "@/hooks/useToast";

const { showToast } = useToast();

// Success notification
showToast("Operation completed!", "success");

// Error notification
showToast("Something went wrong", "error");

// Info notification
showToast("Processing...", "info");

// Warning notification
showToast("Large file detected", "warning");

// With custom duration (in milliseconds)
showToast("Quick message", "info", 2000);
```

**Parameters:**
- `message` (string) - The message to display
- `type` ("success" | "error" | "info" | "warning") - Toast type
- `duration` (number, optional) - Display duration in ms (default: 3000)

**Returns:**
- `showToast(message, type, duration?)` - Function to show toast notification

**Best Practices:**
- Use for non-blocking feedback
- Keep messages concise and actionable
- Match toast type to context (success/error/info/warning)
- Avoid toast spam (debounce repeated operations)

### useDebounce()

Custom hook to debounce rapidly changing values.

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    // Perform search only after 500ms of no typing
    search(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Parameters:**
- `value` (T) - The value to debounce
- `delay` (number) - Delay in milliseconds (default: 500)

**Returns:** Debounced value that updates only after the delay

**Common Use Cases:**
- Search input (500ms delay recommended)
- Form validation
- API calls on input change
- Window resize handlers

## Feature Implementation Guides

### Toast Notifications

Lector Review uses a custom toast notification system for user feedback. **Always use toasts instead of native `alert()` or `confirm()` dialogs.**

**useToast Hook:**

```typescript
import { useToast } from "@/hooks/useToast";

function Component() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast("PDF uploaded successfully!", "success");
  };

  const handleError = (error: Error) => {
    showToast(`Error: ${error.message}`, "error");
  };

  const handleInfo = () => {
    showToast("Processing PDF...", "info");
  };

  const handleWarning = () => {
    showToast("PDF size is large, may take time to load", "warning");
  };
}
```

**Toast Types:**
- `success` - Green toast for successful operations
- `error` - Red toast for errors and failures
- `info` - Blue toast for informational messages
- `warning` - Yellow/orange toast for warnings

**Best Practices:**
- ✅ Use toasts for non-blocking notifications
- ✅ Keep messages concise (1-2 sentences)
- ✅ Use appropriate toast types for context
- ✅ Never use `alert()`, `confirm()`, or `prompt()` (use Modal components instead)
- ✅ Auto-dismiss toasts for success/info (typically 3-5 seconds)
- ✅ Allow manual dismiss for errors/warnings

**Toast Component Implementation:**

The `Toast` component in `components/Toast.tsx` provides:
- Automatic positioning (top-right corner)
- Auto-dismiss with configurable duration
- Multiple toasts queue support
- Smooth animations (slide-in/fade-out)
- Accessibility (aria-live regions)

### Modal Dialogs

For user input and confirmations, use modal components instead of native dialogs:

**InputModal - For text input:**

```typescript
import { InputModal } from "@/components/Modal";

function Component() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (value: string) => {
    setInputValue(value);
    setShowModal(false);
    // Process the input
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Create Project</button>

      {showModal && (
        <InputModal
          title="Create New Project"
          placeholder="Enter project name"
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

**ConfirmModal - For confirmations:**

```typescript
import { ConfirmModal } from "@/components/Modal";

function Component() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    // Perform deletion
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={handleDelete}>Delete PDF</button>

      {showConfirm && (
        <ConfirmModal
          title="Delete PDF"
          message="Are you sure you want to delete this PDF? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
```

**Best Practices:**
- ✅ Use `InputModal` instead of `prompt()`
- ✅ Use `ConfirmModal` instead of `confirm()`
- ✅ Always provide `onClose` handlers
- ✅ Clear form state when modal closes
- ✅ Validate input before submitting
- ✅ Use descriptive titles and messages
- ✅ Support keyboard shortcuts (Escape to close, Enter to submit)

### Highlighting

**Highlight Data Format (pixel-based coordinates):**

```typescript
interface HighlightRect {
  pageNumber: number;
  left: number;    // X coordinate in pixels
  top: number;     // Y coordinate in pixels
  width: number;   // Width in pixels
  height: number;  // Height in pixels
}
```

**Basic Implementation:**

```typescript
<HighlightLayer className="bg-yellow-200/70" />
```

**Best Practices:**
- ✅ Validate selections aren't collapsed before creating highlights
- ✅ Keep highlights within document bounds
- ✅ Include visual feedback for selections (hover states)
- ✅ Add keyboard navigation support for accessibility
- ✅ Persist user highlights separately from search highlights

### Search

**Two Search Modes:**

1. **Exact Term Highlighting** (recommended for search):

```typescript
// Highlights only the exact matching term
const rects = await calculateHighlightRects(pageProxy, {
  pageNumber: match.pageNumber,
  text: match.text,
  matchIndex: match.matchIndex || 0,
});
```

2. **Full Context Highlighting**:

```typescript
// Highlights entire text chunk containing the match
const rects = await calculateHighlightRects(pageProxy, searchResult);
```

**Navigation Between Results:**

```typescript
const { jumpToHighlightRects } = usePdfJump();

// Navigate to specific search result
jumpToHighlightRects(searchHighlights);
```

**Best Practices:**
- ✅ Debounce search input (500ms recommended)
- ✅ Handle empty states gracefully
- ✅ Include page navigation controls (prev/next)
- ✅ Provide result count feedback
- ✅ Clear search highlights on new search
- ✅ Optimize for large documents (pagination)

**Example Implementation:**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);
const { search, searchResults } = useSearch();

useEffect(() => {
  if (debouncedSearch) {
    search(debouncedSearch);
  }
}, [debouncedSearch, search]);
```

### Search Results UI & Pagination

**SearchMatch Type:**

```typescript
interface SearchMatch {
  pageNumber: number;
  text: string;           // Matched text snippet
  matchIndex?: number;    // Position of match in page
  rects?: HighlightRect[]; // Highlight rectangles for navigation
}

interface SearchResults {
  query: string;
  totalMatches: number;
  exactMatches: SearchMatch[];
}
```

**Results List with Navigation:**

```typescript
import { SearchMatch } from "@/types";
import { usePdfJump } from "@anaralabs/lector";

function SearchResultsList({ results }: { results: SearchResults }) {
  const { jumpToHighlightRects } = usePdfJump();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleResultClick = (match: SearchMatch, index: number) => {
    setSelectedIndex(index);
    if (match.rects) {
      jumpToHighlightRects(match.rects);
    }
  };

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % results.exactMatches.length;
    setSelectedIndex(nextIndex);
    const match = results.exactMatches[nextIndex];
    if (match.rects) {
      jumpToHighlightRects(match.rects);
    }
  };

  const handlePrevious = () => {
    const prevIndex = selectedIndex === 0
      ? results.exactMatches.length - 1
      : selectedIndex - 1;
    setSelectedIndex(prevIndex);
    const match = results.exactMatches[prevIndex];
    if (match.rects) {
      jumpToHighlightRects(match.rects);
    }
  };

  return (
    <div className="search-results">
      {/* Navigation Controls */}
      <div className="search-nav">
        <button onClick={handlePrevious}>Previous</button>
        <span>{selectedIndex + 1} / {results.totalMatches}</span>
        <button onClick={handleNext}>Next</button>
      </div>

      {/* Results List */}
      <div className="results-list overflow-auto max-h-96">
        {results.exactMatches.map((match, index) => (
          <div
            key={index}
            onClick={() => handleResultClick(match, index)}
            className={`result-item cursor-pointer p-2 ${
              index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-semibold">Page {match.pageNumber}</div>
            <div className="text-xs text-gray-600 truncate">{match.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Keyboard Navigation:**

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'n') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowUp' || e.key === 'p') {
      e.preventDefault();
      handlePrevious();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [selectedIndex, results]);
```

**Best Practices for Search UI:**
- ✅ Display result count prominently
- ✅ Show current position in results (e.g., "3 / 15")
- ✅ Support keyboard navigation (arrows, n/p keys)
- ✅ Highlight currently selected result in list
- ✅ Show page number for each result
- ✅ Display text snippet for context
- ✅ Implement circular navigation (wrap around at ends)
- ✅ Clear results when search term is emptied
- ✅ Debounce search input to avoid excessive re-renders

### Zoom Controls

**Configuration:**

```typescript
<Root
  source={pdf}
  zoomOptions={{
    minZoom: 0.5,    // 50% minimum zoom
    maxZoom: 10      // 1000% maximum zoom
  }}
>
  <div className="zoom-controls">
    <ZoomOut />
    <CurrentZoom />
    <ZoomIn />
  </div>
</Root>
```

**Defaults:**
- `minZoom`: 0.1 (10%)
- `maxZoom`: 10 (1000%)

**Best Practices:**
- ✅ Set reasonable zoom limits for your use case
- ✅ Provide visual feedback for current zoom level
- ✅ Consider keyboard shortcuts (Ctrl+Plus/Minus)
- ✅ Remember user's zoom preference

### Thumbnails

**Layout Pattern:**

```typescript
const [showThumbnails, setShowThumbnails] = useState(true);

<div className={`grid ${showThumbnails ? 'grid-cols-[200px,1fr]' : 'grid-cols-[0,1fr]'} transition-all`}>
  <div className="overflow-auto bg-gray-50">
    <Thumbnails className="p-2 space-y-2">
      <Thumbnail className="border rounded hover:border-blue-500 hover:shadow-lg cursor-pointer" />
    </Thumbnails>
  </div>

  <Pages>
    {/* Main PDF viewer */}
  </Pages>
</div>
```

**Best Practices:**
- ✅ Implement loading indicators for thumbnail generation
- ✅ Add CSS transitions for smooth show/hide
- ✅ Include hover states for user feedback
- ✅ Automatic page synchronization on thumbnail click
- ✅ Scrollable container with proper overflow handling

### Page Navigation

**Custom Navigation Implementation:**

```typescript
const { jumpToPage } = usePdfJump();
const { numPages } = usePdf();
const currentPage = usePDFPageNumber();

const handleJump = (page: number) => {
  if (page >= 1 && page <= numPages) {
    jumpToPage(page, { behavior: "auto" });
  }
};

// Navigation UI
<div className="page-nav">
  <button
    onClick={() => handleJump(currentPage - 1)}
    disabled={currentPage <= 1}
  >
    Previous
  </button>

  <input
    type="number"
    min={1}
    max={numPages}
    value={currentPage}
    onChange={(e) => handleJump(parseInt(e.target.value))}
    onKeyDown={(e) => e.key === 'Enter' && handleJump(parseInt(e.target.value))}
  />

  <span>/ {numPages}</span>

  <button
    onClick={() => handleJump(currentPage + 1)}
    disabled={currentPage >= numPages}
  >
    Next
  </button>
</div>
```

**Best Practices:**
- ✅ Boundary checking for navigation buttons
- ✅ Keyboard support (Enter key for input)
- ✅ Disabled states at document boundaries
- ✅ Aria-labels for accessibility
- ✅ Visual feedback for current page

### PDF Forms

**Form Handling with AnnotationLayer:**

```typescript
const [formData, setFormData] = useState<Record<string, any>>({});

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);

  // Filter empty values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "")
  );

  setFormData(cleanData);
};

<Root source={pdf}>
  <form onSubmit={handleSubmit}>
    <Pages>
      <Page>
        <CanvasLayer />
        <TextLayer />
        <AnnotationLayer />  {/* Handles PDF form fields */}
      </Page>
    </Pages>
    <button type="submit">Save Form Data</button>
  </form>
</Root>
```

**Best Practices:**
- ✅ Proper TypeScript typing for form events
- ✅ Semantic HTML structure
- ✅ Loading states during PDF rendering
- ✅ Error handling throughout submission process
- ✅ Filter empty form values before storage

### Dark Mode

**Implementation (CSS Filter Approach):**

```typescript
// Apply to Pages component for dark mode
<Pages className="dark:invert-[94%] dark:hue-rotate-180 dark:brightness-[80%] dark:contrast-[228%]">
  <Page>
    <CanvasLayer />
    <TextLayer />
  </Page>
</Pages>
```

**⚠️ Known Limitations:**

1. **Color fidelity** - Colors may not be perfectly accurate across all PDF types
2. **Complex designs** - PDFs with intricate color schemes may render suboptimally
3. **Performance** - CSS filters add overhead on larger documents

**Note:** PDF.js lacks native dark mode support. Lector uses CSS filters as a compatibility solution. Consider disabling dark mode for PDFs with critical color information (charts, diagrams).

## PDF.js Configuration

**Required in App.tsx:**
```typescript
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

This must be set before any PDF operations.

## Type System

All types centralized in `src/types/index.ts`:
- `LabeledHighlight` - Highlight with metadata
- `FieldTemplate` - Form field definition
- `PageFormData` - Form values (Record<string, string>)
- `PDFMetadata` - PDF file metadata
- `ProjectData` - Complete project export
- Type guards: `isLabeledHighlight()`, `isFieldTemplate()`

Import pattern:
```typescript
import { LabeledHighlight, FieldTemplate, PageFormData } from "@/types";
```

## React Patterns

**Always use:**
- Functional components (no class components)
- TypeScript interfaces for props
- Proper dependency arrays in `useEffect`/`useCallback`/`useMemo`
- Toast notifications for feedback (never `alert()`)
- Modal components for input (never `prompt()`/`confirm()`)
- Error handling with try/catch
- `useRef` for function storage (avoid stale closures)

**Never use:**
- ❌ `alert()` - Use `showToast()` instead
- ❌ `confirm()` - Use `ConfirmModal` instead
- ❌ `prompt()` - Use `InputModal` instead
- ❌ Class components - Use functional components with hooks
- ❌ Inline styles - Use Tailwind CSS classes

**Component structure:**
```typescript
// Imports → Types → Component → Export
import { useState } from 'react';
import { SomeType } from '@/types';

interface ComponentProps {
  title: string;
  onClose: () => void;
}

function Component({ title, onClose }: ComponentProps) {
  // state
  // effects
  // handlers
  // render
}

export { Component };
```

## Testing Strategy

### Unit Tests (Vitest)

**Scope:**
- Test all utility functions in `src/utils/`
- Test custom hooks with React Testing Library
- Located in `src/__tests__/`

**Running Tests:**
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ui           # Open Vitest UI
pnpm test:coverage     # Generate coverage report
```

**Best Practices:**
- Mock Lector hooks when testing components
- Test edge cases for utility functions
- Use `renderHook` for custom hook testing
- Mock IndexedDB for storage tests

### E2E Tests (Playwright)

**Scope:**
- Critical user flows: PDF upload, search, highlighting, data export
- Project management: Create, switch, delete projects
- Configuration: `playwright.config.ts`

**Running Tests:**
```bash
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Run with Playwright UI
pnpm test:e2e:debug    # Debug mode
```

**Current Test Status (as of latest commit):**
- **Pass Rate**: 79% (23/29 tests passing)
- **Known Issues**: 2 navigation failures, 4 modal timeout issues

### E2E Testing Patterns

**⚠️ Important:** This project uses **custom modal components** instead of native browser dialogs. E2E tests must wait for and interact with these modals.

#### Testing Modal Interactions

**InputModal Pattern (replaces `page.prompt()`):**

```typescript
import { test, expect } from '@playwright/test';

test('create new project', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Click button that triggers InputModal
  await page.getByRole('button', { name: 'Create Project' }).click();

  // Wait for modal to appear
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Fill input field
  const input = modal.locator('input[type="text"]');
  await input.fill('My New Project');

  // Submit modal
  await modal.getByRole('button', { name: /create|submit/i }).click();

  // Wait for modal to close
  await expect(modal).not.toBeVisible();

  // Verify project was created
  await expect(page.getByText('My New Project')).toBeVisible();
});
```

**ConfirmModal Pattern (replaces `page.confirm()`):**

```typescript
test('delete PDF with confirmation', async ({ page }) => {
  // Trigger delete action
  await page.getByRole('button', { name: 'Delete PDF' }).click();

  // Wait for confirmation modal
  const confirmModal = page.locator('[role="dialog"]');
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal.getByText(/are you sure/i)).toBeVisible();

  // Confirm deletion
  await confirmModal.getByRole('button', { name: /confirm|delete|yes/i }).click();

  // Wait for modal to close
  await expect(confirmModal).not.toBeVisible();

  // Verify deletion
  await expect(page.getByText('PDF Name')).not.toBeVisible();
});
```

#### Common E2E Patterns

**PDF Upload:**

```typescript
test('upload PDF file', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Use file chooser for upload
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByLabel('Upload PDF').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('path/to/test.pdf');

  // Wait for upload to complete
  await expect(page.getByText('test.pdf')).toBeVisible({ timeout: 10000 });
});
```

**Search and Highlight:**

```typescript
test('search and create highlight', async ({ page }) => {
  // Perform search
  await page.getByPlaceholder('Search').fill('methodology');
  await page.keyboard.press('Enter');

  // Wait for results
  await expect(page.getByText(/\d+ results?/i)).toBeVisible();

  // Select text and create highlight
  await page.mouse.move(100, 200);
  await page.mouse.down();
  await page.mouse.move(300, 200);
  await page.mouse.up();

  // Click highlight button in SelectionTooltip
  await page.getByRole('button', { name: /highlight/i }).click();

  // Verify highlight was created
  const highlights = page.locator('.highlight-layer [data-highlight]');
  await expect(highlights).toHaveCount(1);
});
```

**Project Switching:**

```typescript
test('switch between projects', async ({ page }) => {
  // Select different project from dropdown
  await page.getByLabel('Select Project').click();
  await page.getByRole('option', { name: 'Project 2' }).click();

  // Verify project switched
  await expect(page.getByText('Project 2')).toBeVisible();

  // Verify data is scoped to new project
  const pdfList = page.locator('[data-testid="pdf-list"]');
  await expect(pdfList).not.toContainText('project-1-pdf.pdf');
});
```

#### E2E Testing Best Practices

- ✅ Use `getByRole()` and `getByLabel()` over CSS selectors when possible
- ✅ Add `data-testid` attributes for critical elements without semantic roles
- ✅ Use `.first()` when Playwright strict mode requires unique selectors
- ✅ Wait for modals to be visible before interacting
- ✅ Wait for modals to close before proceeding
- ✅ Use appropriate timeouts for async operations (PDF loading, search)
- ✅ Test both success and error paths
- ✅ Clean up test data (projects, PDFs) in `afterEach` hooks
- ✅ Use `aria-label` attributes to improve testability
- ✅ Avoid hardcoded waits (`page.waitForTimeout()`) - use `waitForSelector()` instead

#### Debugging Failed Tests

**Common Issues:**
1. **Modal Timeout**: Modal didn't appear - check if button click triggered state change
2. **Navigation Failure**: Page didn't navigate - verify `jumpToPage` function is called
3. **Element Not Found**: Selector changed - use `page.pause()` to inspect DOM
4. **Timing Issues**: Race conditions - add explicit `waitForSelector()` calls

**Debug Commands:**
```bash
# Run single test with UI
pnpm test:e2e:ui -g "test name"

# Run with headed browser
pnpm test:e2e --headed

# Pause execution
# Add `await page.pause()` in test code

# Generate trace
pnpm test:e2e --trace on
```

## File Organization

```
src/
├── App.tsx                    # Main application (state + localStorage)
├── main.tsx                   # Entry point (with PDF.js worker config)
├── components/                # UI components
│   ├── index.ts              # Barrel export
│   ├── Modal.tsx             # InputModal, ConfirmModal components
│   ├── Toast.tsx             # Toast notification system + ToastProvider
│   ├── PDFUpload.tsx         # Drag-and-drop PDF upload
│   ├── PDFList.tsx           # PDF library management UI
│   ├── TemplateManager.tsx   # Per-page field template editor
│   ├── SchemaForm.tsx        # Schema-based data extraction forms
│   ├── HelpModal.tsx         # Help/documentation modal
│   └── ErrorBoundary.tsx     # Error boundary component
├── hooks/                     # Custom React hooks
│   ├── index.ts              # Barrel export
│   ├── usePDFManager.ts      # PDF CRUD operations (IndexedDB)
│   ├── useToast.ts           # Toast notification hook
│   ├── useDebounce.ts        # Debounced value hook
│   ├── useDarkMode.ts        # Dark mode toggle hook
│   ├── useUndoRedo.ts        # Undo/redo functionality
│   └── useKeyboardShortcuts.ts  # Keyboard shortcuts
├── utils/                     # Pure functions
│   ├── index.ts              # Barrel export
│   ├── pdfStorage.ts         # IndexedDB operations (savePDF, getPDF, deletePDF)
│   ├── schemaParser.ts       # JSON schema parsing
│   ├── importExport.ts       # JSON/CSV export utilities
│   ├── validation.ts         # Field validation
│   └── calculateHighlightRects.ts  # Highlight rectangle calculation
├── types/
│   └── index.ts              # Central type definitions
│       ├── LabeledHighlight  # Highlight with metadata
│       ├── FieldTemplate     # Form field definition
│       ├── PageFormData      # Form values
│       ├── PDFMetadata       # PDF file metadata
│       ├── ProjectData       # Complete project export
│       ├── SearchMatch       # Search result with rects
│       ├── SearchResults     # Search results container
│       ├── SourcedValue<T>   # Value with source tracking
│       └── ParsedSchema      # Parsed JSON schema
├── e2e/                       # E2E tests (Playwright)
│   ├── basic-features.spec.ts     # Core functionality tests
│   └── project-management.spec.ts # Project CRUD tests
├── __tests__/                # Unit tests (Vitest)
│   └── utils.test.ts         # Utility function tests
└── public/
    └── schema.json           # Optional JSON schema for data extraction
```

**Key Files:**

| File | Purpose | Key Exports |
|------|---------|-------------|
| `App.tsx` | Main app shell, state management, localStorage | `App` component |
| `main.tsx` | Entry point, PDF.js worker setup | - |
| `components/Modal.tsx` | Modal dialogs | `InputModal`, `ConfirmModal` |
| `components/Toast.tsx` | Notifications | `Toast`, `ToastProvider` |
| `hooks/usePDFManager.ts` | PDF CRUD | `usePDFManager` hook |
| `hooks/useToast.ts` | Toast hook | `useToast` hook |
| `utils/pdfStorage.ts` | IndexedDB | `savePDF`, `getPDF`, `deletePDF`, `getAllPDFs` |
| `utils/schemaParser.ts` | Schema parsing | `parseSchema`, `flattenSchema` |
| `types/index.ts` | Type definitions | All TypeScript types + type guards |

**Import Patterns:**

```typescript
// Components
import { Modal, Toast, PDFUpload, PDFList } from "@/components";

// Hooks
import { usePDFManager, useToast, useDebounce } from "@/hooks";

// Utils
import { savePDF, getPDF, deletePDF } from "@/utils/pdfStorage";
import { parseSchema } from "@/utils/schemaParser";

// Types
import { LabeledHighlight, FieldTemplate, PDFMetadata } from "@/types";

// Lector components (external)
import { Root, Pages, Page, CanvasLayer, TextLayer } from "@anaralabs/lector";
```

## Schema-Based Forms

JSON schema files enable structured, hierarchical data extraction from research papers. This advanced feature allows researchers to define complex nested field structures.

### Overview

**Components:**
- **Schema Parser**: `src/utils/schemaParser.ts` - Parses JSON schema into flat field list
- **SchemaForm Component**: `src/components/SchemaForm.tsx` - Renders schema-based forms
- **Schema File**: `public/schema.json` - Optional JSON schema definition

**Key Concepts:**
- **Hierarchical Structure**: Schemas define nested field groups (e.g., Study → Metadata → Author)
- **Path-Based Keys**: Data stored with composite paths like `"I_StudyMetadata.studyID"`
- **Type Support**: Text, number, select, textarea field types
- **Validation**: Built-in validation based on field types
- **Source Tracking**: Optional `SourcedValue<T>` to track data origin (page number, etc.)

### Schema Structure

**Example Schema (`public/schema.json`):**

```json
{
  "version": "1.0",
  "sections": [
    {
      "id": "I_StudyMetadata",
      "label": "Study Metadata",
      "fields": [
        {
          "id": "studyID",
          "label": "Study ID (DOI or PMID)",
          "type": "text",
          "required": true,
          "placeholder": "10.1161/STROKEAHA.116.014078"
        },
        {
          "id": "authors",
          "label": "Authors",
          "type": "textarea",
          "placeholder": "Last names, comma-separated"
        },
        {
          "id": "studyType",
          "label": "Study Design",
          "type": "select",
          "options": [
            "Retrospective cohort",
            "Prospective cohort",
            "Case-control",
            "RCT"
          ]
        }
      ]
    },
    {
      "id": "II_PatientData",
      "label": "Patient Data",
      "fields": [
        {
          "id": "sampleSize",
          "label": "Sample Size (n)",
          "type": "number",
          "required": true
        },
        {
          "id": "meanAge",
          "label": "Mean Age",
          "type": "number"
        }
      ]
    }
  ]
}
```

### SchemaForm Component Usage

```typescript
import { SchemaForm } from "@/components/SchemaForm";
import { parseSchema } from "@/utils/schemaParser";

function PDFViewer() {
  const [schemaData, setSchemaData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<ParsedSchema | null>(null);

  // Load schema on mount
  useEffect(() => {
    fetch('/schema.json')
      .then(res => res.json())
      .then(data => {
        const parsed = parseSchema(data);
        setSchema(parsed);
      });
  }, []);

  const handleSchemaChange = (fieldPath: string, value: any) => {
    setSchemaData(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };

  return (
    <div>
      {schema && (
        <SchemaForm
          schema={schema}
          data={schemaData}
          onChange={handleSchemaChange}
        />
      )}
    </div>
  );
}
```

### Data Storage Pattern

Schema form data uses **path-based keys** to maintain hierarchical structure:

```typescript
// Data structure
const schemaData = {
  "I_StudyMetadata.studyID": "10.1161/STROKEAHA.116.014078",
  "I_StudyMetadata.authors": "Smith, Jones, Williams",
  "I_StudyMetadata.studyType": "Retrospective cohort",
  "II_PatientData.sampleSize": 145,
  "II_PatientData.meanAge": 67.5,
};

// Stored in localStorage with project prefix
localStorage.setItem(`proj:${projectName}:schemaForm`, JSON.stringify(schemaData));
```

### Advanced: Source Tracking

Track where data was extracted from using `SourcedValue<T>`:

```typescript
import { SourcedValue } from "@/types";

// Store value with source metadata
const sourcedValue: SourcedValue<string> = {
  value: "10.1161/STROKEAHA.116.014078",
  source: {
    page: 1,
    highlight: highlightId,
    confidence: 0.95
  }
};

// Schema data with sources
const schemaDataWithSources = {
  "I_StudyMetadata.studyID": sourcedValue,
  "II_PatientData.sampleSize": {
    value: 145,
    source: { page: 2 }
  }
};
```

### Schema Parser API

```typescript
import { parseSchema, type ParsedSchema, type SchemaField } from "@/utils/schemaParser";

// Parse schema JSON
const schema: ParsedSchema = parseSchema(schemaJson);

// Schema structure
interface ParsedSchema {
  version: string;
  sections: Array<{
    id: string;
    label: string;
    fields: SchemaField[];
  }>;
}

interface SchemaField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];  // For select fields
}
```

### Best Practices

- ✅ Use hierarchical IDs (`I_`, `II_`, `III_`) for sections to maintain order
- ✅ Mark critical fields as `required: true`
- ✅ Provide helpful placeholders with examples
- ✅ Use `select` type for controlled vocabularies
- ✅ Use `textarea` for multi-line text (authors, abstracts)
- ✅ Store schema in `public/` directory for easy access
- ✅ Validate schema structure before parsing
- ✅ Consider version compatibility when updating schemas
- ✅ Export schema data separately from template data for analysis

### Integration with Templates

Schema forms and per-page templates serve different purposes:

| Feature | Schema Forms | Per-Page Templates |
|---------|--------------|-------------------|
| **Structure** | Hierarchical, global | Flat, page-specific |
| **Use Case** | Structured data extraction | Quick page annotations |
| **Storage Key** | Path-based (`section.field`) | Composite (`page:field`) |
| **Flexibility** | Pre-defined schema | User-defined fields |
| **Best For** | Systematic reviews | Ad-hoc data collection |

Both can be used simultaneously in the same project for comprehensive data extraction.

## Known Issues & Gotchas

### ✅ Recently Fixed

1. **Zoom controls context** - ✅ Fixed in commit `cb84e87`: All zoom controls now properly inside Root context
2. **Native dialog replacement** - ✅ Fixed in commit `fcb8ff0`: Modal components replace native `prompt()`/`confirm()` for better E2E testability
3. **Navigation closure bug** - ✅ Fixed: useRef pattern for jumpToPage function prevents stale closures
4. **Page indicator display** - ✅ Fixed: Now correctly shows `{currentPage} / {totalPages}`

### ⚠️ Current Known Issues

1. **E2E Navigation Tests** (2 failing tests)
   - **Symptom**: Page navigation works but indicator doesn't update in E2E tests
   - **Status**: Under investigation
   - **Workaround**: Manually verify page changes in browser
   - **Impact**: Low - navigation works in production, only affects automated tests

2. **E2E Modal Timeout** (4 failing tests)
   - **Symptom**: Modal dialogs timeout during E2E test execution
   - **Status**: Under investigation
   - **Workaround**: Add explicit waits with longer timeouts
   - **Impact**: Medium - affects CI/CD pipeline, modals work in production

3. **LocalStorage limits** - ~5-10MB per domain
   - **Impact**: Large projects with many highlights may hit limits
   - **Mitigation**: PDFs stored in IndexedDB (50-100MB typical limit)
   - **Best Practice**: Regularly export and archive old project data

4. **Multiple App backups** - Many `App-*.tsx` backup files exist
   - **Active File**: `App.tsx` is the current production version
   - **Note**: Backup files are for historical reference only
   - **Action**: Can be safely ignored or deleted

### 🔍 Important Reminders

1. **Lector Hook Context** - ALL Lector hooks MUST be inside `<Root>` component
   - Affects: `usePdfJump`, `useSearch`, `useSelectionDimensions`, `usePdf`, `usePDFPageNumber`
   - Components: `ZoomIn`, `ZoomOut`, `CurrentZoom`, `Thumbnails`, `SelectionTooltip`

2. **Blob URL Management** - Always revoke blob URLs to prevent memory leaks
   - Use `useRef` to track current blob URL
   - Revoke in cleanup functions (`useEffect` return)
   - Revoke before creating new blob URLs

3. **Search Debouncing** - Implemented with 500ms delay
   - Prevents excessive re-renders on large PDFs
   - Use `useDebounce` hook for search input

4. **Modal Components** - Never use native browser dialogs
   - ❌ Don't use: `alert()`, `confirm()`, `prompt()`
   - ✅ Use instead: `Toast`, `InputModal`, `ConfirmModal`

5. **Testing with Modals** - E2E tests must wait for modal visibility
   - Always check `await expect(modal).toBeVisible()` before interaction
   - Wait for modal to close before proceeding
   - Use `role="dialog"` selector for modals

### 📊 Test Status

**Current E2E Test Pass Rate**: 79% (23/29 passing)

| Test Suite | Status | Notes |
|------------|--------|-------|
| Basic Features | 79% pass | 2 navigation failures |
| Project Management | In progress | 4 modal timeout issues |
| PDF Upload | ✅ Passing | - |
| Search & Highlight | ✅ Passing | - |

**Unit Tests**: All passing ✅

## Performance Optimizations

```typescript
// Debounce search input
const debouncedSearch = useDebounce(searchTerm, 500);

// Memoize expensive computations
const currentPageTemplate = useMemo(
  () => templates[currentPage] || [],
  [templates, currentPage]
);

// Cleanup async operations
useEffect(() => {
  let cancelled = false;
  async function fetchData() {
    const result = await fetch(...);
    if (!cancelled) setState(result);
  }
  return () => { cancelled = true; };
}, []);
```

## Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard navigation supported (Enter for page jump, Escape for modals)
- Dark mode support via CSS variables
- Focus management in modals

## Troubleshooting

### Common Issues

#### 1. "Hook called outside Root context"

**Error:** `Error: usePdfJump must be called within a Root component`

**Cause:** Lector hooks called in components not rendered inside `<Root>`.

**Solution:**
```typescript
// ❌ Wrong
function App() {
  const { jumpToPage } = usePdfJump(); // ERROR!
  return <Root source={pdf}>...</Root>
}

// ✅ Correct
function App() {
  return (
    <Root source={pdf}>
      <InnerComponent />
    </Root>
  );
}

function InnerComponent() {
  const { jumpToPage } = usePdfJump(); // ✅ Works!
  return <Pages>...</Pages>
}
```

#### 2. PDF not rendering

**Symptoms:** Blank screen, console errors about worker

**Checklist:**
- ✅ Verify PDF.js worker is configured (see [PDF.js Configuration](#pdfjs-configuration))
- ✅ Ensure `pdfjs-dist/web/pdf_viewer.css` is imported in `main.tsx`
- ✅ Check browser console for worker loading errors
- ✅ Verify PDF source path is correct and accessible
- ✅ Check CORS if loading PDF from external URL

**Solution:**
```typescript
// In App.tsx, BEFORE any Lector components
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

#### 3. Selection not working

**Symptoms:** Can't select text, no selection tooltip appears

**Checklist:**
- ✅ Ensure `<TextLayer />` is included in your Page
- ✅ Verify TextLayer is not covered by other elements (z-index)
- ✅ Check that `useSelectionDimensions()` is called inside Root
- ✅ Verify CSS for TextLayer isn't `pointer-events: none`

**Solution:**
```typescript
<Page>
  <CanvasLayer />
  <TextLayer />  {/* Required for text selection */}
  <ColoredHighlightLayer highlights={highlights} />
</Page>
```

#### 4. Zoom controls not responding

**Symptoms:** Zoom buttons don't work, CurrentZoom shows wrong value

**Checklist:**
- ✅ Confirm zoom components are inside `<Root>`
- ✅ Check `zoomOptions` prop on Root component
- ✅ Verify no CSS overrides affecting zoom behavior
- ✅ Check browser console for errors

**Solution:**
```typescript
<Root source={pdf} zoomOptions={{ minZoom: 0.5, maxZoom: 3 }}>
  <div className="zoom-controls">
    <ZoomOut />
    <CurrentZoom />
    <ZoomIn />
  </div>
  <Pages>...</Pages>
</Root>
```

#### 5. Dark mode looks wrong

**Symptoms:** Colors inverted incorrectly, unreadable content

**Cause:** CSS filter approach has limitations with certain PDF types

**Solutions:**
- Adjust filter values for your specific PDFs:
  ```typescript
  // Fine-tune these values
  <Pages className="dark:invert-[94%] dark:hue-rotate-180
    dark:brightness-[80%] dark:contrast-[228%]">
  ```
- Consider disabling dark mode for PDFs with critical color information
- Use conditional dark mode based on PDF type

#### 6. Search highlights not appearing

**Symptoms:** Search completes but no highlights visible

**Checklist:**
- ✅ Verify `calculateHighlightRects()` is being called correctly
- ✅ Check that highlights are being added to state
- ✅ Ensure ColoredHighlightLayer is rendering highlights
- ✅ Verify highlight colors have sufficient opacity
- ✅ Check console for async errors in highlight calculation

**Solution:**
```typescript
// Ensure proper highlight state management
const [highlights, setHighlights] = useState<LabeledHighlight[]>([]);

// Update highlights with search results
useEffect(() => {
  if (searchResults?.exactMatches) {
    const searchHighlights = /* ... convert to highlights ... */;
    setHighlights(prev => {
      const userHighlights = prev.filter(h => h.kind !== "search");
      return [...userHighlights, ...searchHighlights];
    });
  }
}, [searchResults]);
```

#### 7. IndexedDB quota exceeded

**Symptoms:** "QuotaExceededError" when uploading PDFs

**Cause:** Browser storage limits reached (~50MB-100MB typical)

**Solutions:**
- Implement PDF cleanup/deletion feature
- Warn users before large uploads
- Check storage usage:
  ```typescript
  import { getStorageSize, formatFileSize } from "@/utils/pdfStorage";

  const size = await getStorageSize();
  console.log(`Storage used: ${formatFileSize(size)}`);
  ```

#### 8. Page navigation indicator not updating

**Symptoms:** Page changes but indicator shows wrong page number or doesn't update

**Cause:** Stale closure in navigation function stored in state instead of ref

**Checklist:**
- ✅ Use `useRef` instead of `useState` for `jumpToPage` function
- ✅ Verify `usePDFPageNumber()` hook is being called
- ✅ Check that page change events are firing
- ✅ Ensure navigation buttons use latest function reference

**Solution:**
```typescript
// ❌ Wrong - using state for function
const [jumpToPageFn, setJumpToPageFn] = useState<((page: number) => void) | null>(null);

// ✅ Correct - using ref for function
const jumpToPageFn = useRef<((page: number, options?: any) => void) | null>(null);

// Inside component that has access to usePdfJump
const { jumpToPage } = usePdfJump();
jumpToPageFn.current = jumpToPage;

// Usage
const handlePageChange = (page: number) => {
  if (jumpToPageFn.current) {
    jumpToPageFn.current(page, { behavior: "auto" });
  }
};
```

#### 9. Modal dialogs not appearing or timing out

**Symptoms:** Modal doesn't appear when triggered, or E2E tests timeout waiting for modal

**Cause:** State update timing, conditional rendering, or missing modal component

**Checklist:**
- ✅ Verify modal state is being set to `true`
- ✅ Check that modal component is rendered (not behind conditional that filters it out)
- ✅ Ensure modal has `role="dialog"` for accessibility and testing
- ✅ Verify modal backdrop and z-index are correct
- ✅ Check browser console for React errors

**Solution:**
```typescript
// Ensure modal state is properly managed
const [showModal, setShowModal] = useState(false);

const handleOpen = () => {
  setShowModal(true);  // Verify this is called
};

const handleClose = () => {
  setShowModal(false);
};

// Modal should always be in render tree
return (
  <>
    <button onClick={handleOpen}>Open Modal</button>

    {/* ✅ Correct - modal rendered conditionally */}
    {showModal && (
      <InputModal
        title="Enter Name"
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    )}
  </>
);
```

**E2E Testing Considerations:**
- Add explicit waits: `await expect(modal).toBeVisible({ timeout: 5000 })`
- Verify modal appears before interacting
- Check that click handlers are properly attached

#### 10. Memory leaks from blob URLs

**Symptoms:** Increasing memory usage, browser slowdown with many PDF uploads

**Cause:** Blob URLs not being revoked when PDF changes or component unmounts

**Checklist:**
- ✅ Revoke blob URLs in cleanup functions
- ✅ Use refs to track current blob URL
- ✅ Revoke old blob before creating new one
- ✅ Always revoke on component unmount

**Solution:**
```typescript
// ✅ Correct pattern with automatic cleanup
const pdfUrlRef = useRef<string | null>(null);

useEffect(() => {
  const loadPDF = async () => {
    const pdfData = await getPDFFromIndexedDB();

    // Revoke old blob URL if exists
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }

    // Create new blob URL
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    pdfUrlRef.current = url;
    setPdfUrl(url);
  };

  loadPDF();

  // Cleanup on unmount
  return () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  };
}, [pdfName]);
```

**Best Practices:**
- Always pair `URL.createObjectURL()` with `URL.revokeObjectURL()`
- Use refs to maintain reference to current blob URL
- Revoke in cleanup functions and before creating new blobs
- Monitor memory usage in DevTools to verify cleanup

#### 11. Toast notifications not showing

**Symptoms:** `showToast()` called but no toast appears

**Cause:** Toast context not provided or multiple context providers

**Checklist:**
- ✅ Verify `ToastProvider` wraps your app
- ✅ Check that `useToast()` is called inside ToastProvider
- ✅ Ensure toast container is rendered
- ✅ Check z-index of toast container
- ✅ Verify no CSS `display: none` on toast elements

**Solution:**
```typescript
// In main.tsx or App.tsx root
import { ToastProvider } from "@/components/Toast";

function App() {
  return (
    <ToastProvider>
      {/* Rest of app */}
    </ToastProvider>
  );
}

// In any component
import { useToast } from "@/hooks/useToast";

function Component() {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast("Action completed", "success");
  };
}
```

### Verification Checklist

Before starting development or when issues arise:

**Dependencies:**
- [ ] Node.js 16.0+ installed
- [ ] React 16.8+ in `package.json`
- [ ] Both `@anaralabs/lector` AND `pdfjs-dist` installed
- [ ] CSS file imported: `import "pdfjs-dist/web/pdf_viewer.css"`

**Configuration:**
- [ ] PDF.js worker configured in `App.tsx`
- [ ] Worker configuration runs before any Lector components
- [ ] Vite config has `@/` path alias configured

**Component Structure:**
- [ ] All hooks called inside components rendered within `<Root>`
- [ ] Required layers included: `CanvasLayer` at minimum
- [ ] `TextLayer` included if selection needed
- [ ] `AnnotationLayer` included if PDF forms needed

**Data Persistence:**
- [ ] LocalStorage keys follow `proj:{project}:{type}` pattern
- [ ] IndexedDB initialized for PDF storage
- [ ] Proper cleanup of blob URLs

**Testing:**
- [ ] Unit tests passing for utilities
- [ ] E2E tests covering critical flows
- [ ] Manual testing in target browsers

### Getting Help

If issues persist:

1. **Check official Lector docs:** https://lector-weld.vercel.app/docs
2. **Review PDF.js docs:** https://mozilla.github.io/pdf.js/
3. **Check browser console** for specific error messages
4. **Verify versions** match requirements (React 16.8+, Node 16+)
5. **Search GitHub issues:** https://github.com/anaralabs/lector/issues

## Resources

### Official Documentation

- **Lector Documentation:** https://lector-weld.vercel.app/docs
  - [Installation](https://lector-weld.vercel.app/docs/installation)
  - [Basic Usage](https://lector-weld.vercel.app/docs/basic-usage)
  - [Search](https://lector-weld.vercel.app/docs/code/search)
  - [Highlighting](https://lector-weld.vercel.app/docs/code/highlight)
  - [Zoom Controls](https://lector-weld.vercel.app/docs/code/zoom-control)
  - [Thumbnails](https://lector-weld.vercel.app/docs/code/thumbnails)
  - [PDF Forms](https://lector-weld.vercel.app/docs/code/pdf-form)
  - [Dark Mode](https://lector-weld.vercel.app/docs/dark-mode)

- **Lector GitHub:** https://github.com/anaralabs/lector
- **PDF.js Documentation:** https://mozilla.github.io/pdf.js/
- **React Documentation:** https://react.dev/

### Project Configuration

- **Vite Path Aliases:** `@/` resolves to `src/`
- **TypeScript:** Strict mode enabled
- **Tailwind CSS:** v3.4 with custom configuration
