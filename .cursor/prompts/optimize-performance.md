# Prompt: Optimize Performance

Performance optimization patterns for Lector Review.

## React Performance

### 1. Memoization with useMemo
```typescript
// ✅ Memoize expensive computations
const currentPageTemplate = useMemo(
  () => templates[currentPage] || [],
  [templates, currentPage]
);

const filteredHighlights = useMemo(
  () => highlights.filter(h => h.pageNumber === currentPage),
  [highlights, currentPage]
);

const sortedProjects = useMemo(
  () => projects.sort((a, b) => a.localeCompare(b)),
  [projects]
);
```

### 2. Callback Memoization with useCallback
```typescript
// ✅ Memoize callbacks to prevent re-renders
const handleFieldChange = useCallback((fieldId: string, value: string) => {
  setPageForm(prev => ({
    ...prev,
    [`${currentPage}:${fieldId}`]: value
  }));
}, [currentPage]);

const handleAddHighlight = useCallback((rect: Rect, label: string) => {
  const newHighlight = {
    id: uid(),
    ...rect,
    label,
    pageNumber: currentPage
  };
  setHighlights(prev => [...prev, newHighlight]);
}, [currentPage]);
```

### 3. Component Memoization with React.memo
```typescript
// ✅ Prevent unnecessary re-renders
export const FieldInput = React.memo(({
  field,
  value,
  onChange
}: FieldInputProps) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(field.id, e.target.value)}
    />
  );
});
```

---

## Input Debouncing

### Search Input
```typescript
import { useDebounce } from '@/hooks';

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      findExactMatches({ searchText: debouncedSearch });
    }
  }, [debouncedSearch, findExactMatches]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search PDF..."
    />
  );
}
```

### Field Input
```typescript
function FieldForm() {
  const [localValue, setLocalValue] = useState('');
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    // Save to localStorage after debounce
    saveToLocalStorage(debouncedValue);
  }, [debouncedValue]);

  return (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
}
```

---

## LocalStorage Optimization

### Batch Updates
```typescript
// ❌ BAD - Multiple writes
fields.forEach(field => {
  localStorage.setItem(`proj:${project}:${field.id}`, field.value);
});

// ✅ GOOD - Single write
const data = fields.reduce((acc, field) => ({
  ...acc,
  [field.id]: field.value
}), {});
localStorage.setItem(`proj:${project}:data`, JSON.stringify(data));
```

### Lazy Loading
```typescript
// ✅ Load data only when needed
const loadProjectData = useCallback((projectName: string) => {
  const data = localStorage.getItem(`proj:${projectName}:data`);
  return data ? JSON.parse(data) : {};
}, []);
```

---

## PDF Rendering Optimization

### Virtual Pages (For Large PDFs)
```typescript
// ✅ Render only visible pages + buffer
const visiblePages = useMemo(() => {
  const buffer = 2;
  return Array.from(
    { length: buffer * 2 + 1 },
    (_, i) => currentPage - buffer + i
  ).filter(page => page >= 1 && page <= totalPages);
}, [currentPage, totalPages]);

return (
  <Pages>
    {visiblePages.map(pageNum => (
      <Page key={pageNum} pageNumber={pageNum}>
        <CanvasLayer />
        <TextLayer />
      </Page>
    ))}
  </Pages>
);
```

### Lazy Image Loading
```typescript
// ✅ Load PDF pages on demand
<Page
  pageNumber={pageNum}
  loading="lazy"
  scale={scale}
/>
```

---

## List Optimization

### Virtual Lists (For Long Highlight Lists)
```typescript
// ✅ Use virtualization for > 100 items
import { FixedSizeList } from 'react-window';

function HighlightList({ highlights }: { highlights: LabeledHighlight[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <HighlightItem highlight={highlights[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={highlights.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Pagination
```typescript
// ✅ Paginate long lists
const ITEMS_PER_PAGE = 20;
const [currentPage, setCurrentPage] = useState(1);

const paginatedItems = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return items.slice(start, start + ITEMS_PER_PAGE);
}, [items, currentPage]);
```

---

## Bundle Size Optimization

### Code Splitting
```typescript
// ✅ Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {showHeavy && <HeavyComponent />}
    </Suspense>
  );
}
```

### Tree Shaking
```typescript
// ✅ Import only what you need
import { debounce } from 'lodash-es';  // Good
import debounce from 'lodash/debounce';  // Better

// ❌ Avoid importing entire library
import _ from 'lodash';
```

---

## Network Optimization

### Prefetch Critical Assets
```typescript
// ✅ Preload PDF
<link rel="prefetch" href="/Kim2016.pdf" />

// ✅ Preconnect to CDN
<link rel="preconnect" href="https://cdn.example.com" />
```

### Compression
```typescript
// ✅ Enable gzip/brotli in deployment
// Vite handles this automatically in production build
pnpm build  // Creates compressed assets
```

---

## Monitoring Performance

### React DevTools Profiler
```typescript
// ✅ Wrap components to profile
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number,
) {
  console.log(`${id} took ${actualDuration}ms to ${phase}`);
}

<Profiler id="PDFViewer" onRender={onRenderCallback}>
  <PDFViewer />
</Profiler>
```

### Web Vitals
```typescript
// ✅ Measure performance
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Performance Checklist

- [ ] Expensive computations wrapped in useMemo
- [ ] Event handlers wrapped in useCallback
- [ ] Heavy components wrapped in React.memo
- [ ] Search input debounced (500ms)
- [ ] Field inputs debounced (300ms)
- [ ] LocalStorage updates batched
- [ ] Long lists virtualized or paginated
- [ ] Heavy components lazy loaded
- [ ] Bundle size optimized (< 500KB gzipped)
- [ ] Images lazy loaded
- [ ] Code split by route/feature

---

## Example Prompts

"Optimize the highlight list rendering for 1000+ items. Use virtualization or pagination."

"The search input is causing lag with rapid typing. Add debouncing to fix the performance issue."

"Batch the localStorage updates in the field form to prevent multiple writes."

"Add useMemo to the template filtering logic to prevent re-computation on every render."
