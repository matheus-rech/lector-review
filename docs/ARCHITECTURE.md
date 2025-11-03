# Lector Review - Architecture Documentation

## Table of Contents
- [System Overview](#system-overview)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [Lector Integration](#lector-integration)
- [State Management](#state-management)
- [Storage Architecture](#storage-architecture)
- [Performance Considerations](#performance-considerations)

---

## System Overview

Lector Review is a **client-side systematic review tool** built with React 19, TypeScript, and the Lector PDF library. It enables researchers to:

- View and annotate PDF research papers
- Extract structured data using customizable templates
- Manage multiple review projects
- Export data for meta-analysis

**Architecture Pattern:** Single-page application (SPA) with component-based architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                             │
├────────────────────────────────────────────────────────────┤
│  React Application (Lector Review)                         │
│  ├─ PDF Rendering (PDF.js + Lector)                        │
│  ├─ Data Extraction (Per-page Forms)                       │
│  ├─ Project Management (Multi-project Support)             │
│  └─ Export System (JSON/CSV)                               │
├────────────────────────────────────────────────────────────┤
│  LocalStorage            IndexedDB                         │
│  (Metadata, Forms)       (PDFs)                            │
└────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Application Structure

```
App.tsx (Root Container)
│
├─ Sidebar (Left)
│  ├─ Dark Mode Toggle
│  ├─ Project Selector
│  │  ├─ Project Dropdown
│  │  ├─ New Project Button
│  │  └─ Delete Project Button
│  ├─ PDF Source Input
│  ├─ Search Box
│  │  └─ Search Results Count
│  └─ Your Highlights List
│     └─ Highlight Items
│
├─ PDF Viewer (Center)
│  └─ Lector Root Component
│     └─ Lector Pages Component
│        └─ Lector Page Component
│           ├─ CanvasLayer (PDF rendering)
│           ├─ TextLayer (text selection)
│           └─ ColoredHighlightLayer (highlights)
│
└─ Data Sidebar (Right)
   ├─ Help Button
   ├─ Page Navigation
   │  ├─ Previous Page Button
   │  ├─ Page Indicator
   │  └─ Next Page Button
   ├─ Per-Page Field Form
   │  └─ Dynamic Fields (based on template)
   └─ Export Buttons
      ├─ Export JSON
      └─ Export CSV
```

### Component Responsibilities

| Component | Responsibility | State Management |
|-----------|----------------|------------------|
| **App.tsx** | Main container, orchestration | All application state |
| **PDFViewerContent** | Lector hooks integration | Local PDF state |
| **Modal** | Dialog display | Props-based |
| **Toast** | Notifications | Context/Props |
| **HelpModal** | Documentation | Props-based |
| **Loading** | Loading indicator | Props-based |

---

## Lector Integration

### Official Lector Documentation

**Source:** https://lector-weld.vercel.app/docs/basic-usage

### Component Hierarchy (Lector)

```
Root (Document Container)
  │
  ├─ Props:
  │   source: string (PDF URL or blob)
  │   className: string
  │   loader: ReactNode
  │   onLoad: () => void
  │   onError: (error: Error) => void
  │
  └─ Pages (Page Layout Manager)
      │
      ├─ Props:
      │   className: string
      │
      └─ Page (Individual Page)
          │
          ├─ CanvasLayer (Visual Rendering)
          ├─ TextLayer (Text Selection)
          ├─ AnnotationLayer (Forms, Links)
          └─ ColoredHighlightLayer (Custom Highlights)
```

### Critical Pattern: Hook Context

**⚠️ MANDATORY RULE:** Lector hooks MUST be called inside a component that is a **child** of `<Root>`

```typescript
// ❌ WRONG - Hook called at top level
function App() {
  const { jumpToPage } = usePdfJump(); // ERROR!

  return (
    <Root documentSource={pdf}>
      <Pages>
        <Page pageNumber={1}>
          <CanvasLayer />
        </Page>
      </Pages>
    </Root>
  );
}

// ✅ CORRECT - Hook called inside Root's children
function App() {
  return (
    <Root documentSource={pdf}>
      <PDFViewerContent /> {/* Hooks work here */}
    </Root>
  );
}

function PDFViewerContent() {
  const { jumpToPage, currentPageNumber } = usePdfJump(); // ✅ Works!
  const { searchResults, findExactMatches } = useSearch();
  const selectionDimensions = useSelectionDimensions();

  // Use hooks here...
}
```

### Lector Hooks API

#### usePdfJump
```typescript
const {
  jumpToPage,        // (page: number) => void
  currentPageNumber, // number
  totalPages         // number
} = usePdfJump();
```

#### useSearch
```typescript
const {
  searchResults,     // { exactMatches: SearchMatch[], totalMatches: number }
  findExactMatches,  // (options: { searchText: string }) => void
  clearSearch        // () => void
} = useSearch();
```

#### useSelectionDimensions
```typescript
const selectionDimensions = useSelectionDimensions();
// Returns: { rects: Rect[], text: string, pageNumber: number } | null
```

### Layer Components

```typescript
// Canvas Layer - Renders PDF content
<CanvasLayer />

// Text Layer - Enables text selection and copying
<TextLayer />

// Annotation Layer - Renders PDF forms, links, widgets
<AnnotationLayer />

// Colored Highlight Layer - Custom highlight overlays
<ColoredHighlightLayer
  highlights={[
    { id: "1", x: 100, y: 200, width: 300, height: 20, color: "#FFFF00" }
  ]}
/>
```

---

## Data Flow

### Application State Flow

```
User Action
    ↓
Event Handler
    ↓
State Update (React setState)
    ↓
useEffect Trigger
    ↓
LocalStorage Persistence
    ↓
UI Re-render
```

### PDF Rendering Flow

```
PDF Source Changed
    ↓
Root Component Receives New Source
    ↓
PDF.js Loads Document
    ↓
Pages Component Requests Pages
    ↓
Page Component Renders
    ↓
Layers Render (Canvas, Text, Highlights)
    ↓
User Can Interact
```

### Data Extraction Flow

```
User Fills Field
    ↓
handleFieldChange(fieldId, value)
    ↓
setPageForm({ ...prev, [`${page}:${fieldId}`]: value })
    ↓
useEffect → saveToLocalStorage
    ↓
Data Available for Export
```

### Highlight Creation Flow

```
User Selects Text
    ↓
useSelectionDimensions() Captures Rects
    ↓
setPendingSelection({ rects, pageNumber, text })
    ↓
User Clicks "Highlight" Button
    ↓
Prompt for Label
    ↓
Create LabeledHighlight Object
    ↓
Add to highlights Array
    ↓
Save to LocalStorage
    ↓
ColoredHighlightLayer Renders
```

---

## State Management

### Global State (App.tsx)

```typescript
// Projects
const [projects, setProjects] = useState<string[]>(['default']);
const [currentProject, setCurrentProject] = useState<string>('default');

// PDF
const [source, setSource] = useState<string>('/Kim2016.pdf');
const [currentPage, setCurrentPage] = useState<number>(1);

// Data Extraction
const [highlights, setHighlights] = useState<LabeledHighlight[]>([]);
const [pageForm, setPageForm] = useState<PageFormData>({});
const [templates, setTemplates] = useState<PageTemplates>(defaultTemplates);

// UI State
const [searchTerm, setSearchTerm] = useState<string>('');
const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
const [showHelp, setShowHelp] = useState<boolean>(false);
```

### Local State (Component-Level)

```typescript
// PDFViewerContent
const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
const [searchHighlights, setSearchHighlights] = useState<LabeledHighlight[]>([]);

// Modal
const [isOpen, setIsOpen] = useState<boolean>(false);

// Toast
const [toasts, setToasts] = useState<Toast[]>([]);
```

### State Persistence Strategy

| Data Type | Storage | Key Pattern | Persistence |
|-----------|---------|-------------|-------------|
| Projects list | LocalStorage | `projects` | Always |
| Current project | LocalStorage | `current-project` | Always |
| Highlights | LocalStorage | `proj:{name}:highlights` | Per-project |
| Form data | LocalStorage | `proj:{name}:pageForm` | Per-project |
| Templates | LocalStorage | `proj:{name}:templates` | Per-project |
| PDFs (future) | IndexedDB | `pdf:{id}` | Per-PDF |
| Dark mode | LocalStorage | `dark-mode` | Global |

---

## Storage Architecture

### LocalStorage Namespacing

```typescript
// Pattern
const key = (project: string, dataType: string) => `proj:${project}:${dataType}`;

// Examples
key("default", "highlights")     → "proj:default:highlights"
key("study-2024", "pageForm")    → "proj:study-2024:pageForm"
key("meta-analysis", "templates") → "proj:meta-analysis:templates"
```

### Composite Keys for Fields

```typescript
// Pattern: "pageNumber:fieldId"
const fieldKey = `${pageNumber}:${fieldId}`;

// Example Storage
{
  "1:study_id": "10.1161/STROKEAHA.116.014078",
  "1:first_author": "Kim",
  "1:year": "2016",
  "2:study_design": "Retrospective Case-Control",
  "3:total_patients": "112"
}
```

### Storage Limits

| Storage Type | Typical Limit | Use Case |
|--------------|---------------|----------|
| LocalStorage | 5-10 MB | Metadata, forms, small data |
| IndexedDB | 50 MB+ | PDFs, large files |
| SessionStorage | 5-10 MB | Temporary UI state |

---

## Performance Considerations

### React Optimizations

#### 1. Memoization
```typescript
// Expensive computations
const currentPageTemplate = useMemo(
  () => templates[currentPage] || [],
  [templates, currentPage]
);

// Filtered data
const pageHighlights = useMemo(
  () => highlights.filter(h => h.pageNumber === currentPage),
  [highlights, currentPage]
);
```

#### 2. Callback Optimization
```typescript
const handleFieldChange = useCallback((fieldId: string, value: string) => {
  setPageForm(prev => ({
    ...prev,
    [`${currentPage}:${fieldId}`]: value
  }));
}, [currentPage]);
```

#### 3. Debouncing
```typescript
// Search input (500ms)
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    findExactMatches({ searchText: debouncedSearch });
  }
}, [debouncedSearch, findExactMatches]);
```

### PDF Rendering Optimizations

1. **Virtual Scrolling:** Only render visible pages
2. **Lazy Loading:** Load pages on demand
3. **Canvas Caching:** PDF.js caches rendered pages
4. **Text Layer Optimization:** Only render when needed

### Storage Optimizations

1. **Batch Updates:** Combine multiple localStorage writes
2. **Lazy Loading:** Load project data only when needed
3. **Cleanup:** Remove old project data on delete
4. **Compression:** Consider compressing large data (future)

---

## Integration Points

### Pending Component Integrations

#### 1. PDF Upload
**Location:** `src/components/PDFUpload.tsx`, `src/utils/pdfStorage.ts`
**Integration Point:** App.tsx sidebar
**Estimated Effort:** 2 hours

```typescript
import { PDFUpload, PDFList } from '@/components';
import { usePDFManager } from '@/hooks';

// In App.tsx:
const { pdfs, currentPDF, addPDF, removePDF, selectPDF } = usePDFManager();

// In JSX:
<PDFUpload onUpload={addPDF} />
<PDFList pdfs={pdfs} onSelect={selectPDF} onRemove={removePDF} />
```

#### 2. Template Manager
**Location:** `src/components/TemplateManager.tsx`
**Integration Point:** App.tsx modal
**Estimated Effort:** 2 hours

```typescript
<Modal isOpen={showTemplateManager} onClose={() => setShowTemplateManager(false)}>
  <TemplateManager templates={templates} onUpdate={setTemplates} />
</Modal>
```

#### 3. Schema Forms
**Location:** `src/components/SchemaForm.tsx`, `src/utils/schemaParser.ts`
**Integration Point:** Replace current form system
**Estimated Effort:** 3 hours

```typescript
import { SchemaForm } from '@/components';
import { parseSchema } from '@/utils';

const parsedSchema = parseSchema(schemaJSON);

<SchemaForm
  schema={parsedSchema}
  page={currentPage}
  data={pageForm}
  onChange={handleFieldChange}
/>
```

---

## Architecture Decisions

### Why This Architecture?

1. **Component-Based:** React's component model provides reusability and maintainability
2. **LocalStorage:** Simplicity for single-user, client-side app
3. **Lector Integration:** Composable, headless PDF viewer with React hooks
4. **TypeScript:** Type safety prevents bugs and improves DX
5. **Tailwind CSS:** Rapid UI development with utility classes

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| Client-side only | Simple deployment, no server costs, privacy | No collaboration, limited by browser storage |
| LocalStorage | Fast, simple API, synchronous | 5-10MB limit, no encryption |
| Single component (App.tsx) | Simple state management | Can become large (current: 800+ lines) |
| Lector library | Excellent PDF rendering, hooks API | Learning curve for context requirements |

### Future Considerations

1. **Backend Integration:** Optional cloud sync, collaboration
2. **Component Splitting:** Break App.tsx into smaller components
3. **State Library:** Consider Zustand/Jotai for complex state
4. **Offline Support:** Service worker for PWA capabilities
5. **Mobile App:** React Native version

---

## References

- **Lector Documentation:** https://lector-weld.vercel.app/docs
- **Lector GitHub:** https://github.com/matheus-rech/lector
- **PDF.js Documentation:** https://mozilla.github.io/pdf.js/
- **React Documentation:** https://react.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

---

**Last Updated:** November 2025
**Version:** 2.0.0
**Maintained by:** Lector Review Team
