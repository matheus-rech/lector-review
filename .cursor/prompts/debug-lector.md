# Prompt: Debug Lector Issues

Common Lector library issues and solutions for Lector Review.

## Issue 1: "Hook called outside of Root context"

### Error Message

```
Error: usePdfJump must be called inside a Root component
```

### Cause

Lector hooks (`usePdfJump`, `useSearch`, `useSelectionDimensions`) must be called from a component that is a **child** of the `<Root>` component.

### Solution

```typescript
// ❌ WRONG
function App() {
  const { jumpToPage } = usePdfJump(); // ERROR!

  return (
    <Root source={pdf}>
      <Pages>
        <Page pageNumber={1} />
      </Pages>
    </Root>
  );
}

// ✅ CORRECT
function App() {
  return (
    <Root source={pdf}>
      <PDFViewerContent /> {/* Hooks work here */}
    </Root>
  );
}

function PDFViewerContent() {
  const { jumpToPage } = usePdfJump(); // ✅ Works!
  // ... use hook
}
```

---

## Issue 2: PDF Not Loading / "Loading..." Forever

### Possible Causes

#### 1. PDF.js Worker Not Configured

```typescript
// ✅ Add this BEFORE Root component
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

#### 2. Invalid PDF Source

```typescript
// ✅ Check if source is valid
const [source, setSource] = useState("/Kim2016.pdf");

// For uploaded PDFs:
const blobUrl = URL.createObjectURL(pdfFile);
setSource(blobUrl);
```

#### 3. CORS Issues (Remote PDFs)

```typescript
// ✅ Use proxy or ensure CORS headers
// Or use local/blob URLs instead
```

### Debug Steps

1. Check browser console for errors
2. Verify PDF file exists: `public/Kim2016.pdf`
3. Check worker path is correct
4. Try with different PDF
5. Check network tab for failed requests

---

## Issue 3: Text Selection Not Working

### Cause

Missing `TextLayer` component in page rendering.

### Solution

```typescript
// ✅ Include TextLayer in Pages > Page
<Pages>
  <Page pageNumber={currentPage}>
    <CanvasLayer />
    <TextLayer /> {/* Required for text selection */}
  </Page>
</Pages>
```

---

## Issue 4: Highlights Not Showing

### Cause

`ColoredHighlightLayer` not included or highlights not in correct format.

### Solution

```typescript
// 1. Include ColoredHighlightLayer
<Page pageNumber={currentPage}>
  <CanvasLayer />
  <TextLayer />
  <ColoredHighlightLayer highlights={pageHighlights} />
</Page>;

// 2. Ensure highlights format is correct
// ColoredHighlight type is imported from @anaralabs/lector
type ColoredHighlight = {
  id: string;
  pageNumber: number;
  rects: Array<{
    // Array of rectangles for the highlight
    x: number; // PDF coordinates (not pixels)
    y: number;
    width: number;
    height: number;
  }>;
  color?: string; // Optional, default yellow
};

// 3. Filter highlights for current page
const pageHighlights = highlights.filter((h) => h.pageNumber === currentPage);
```

---

## Issue 5: Search Not Working

### Possible Causes

#### 1. useSearch Hook Not Called

```typescript
// ✅ Call useSearch inside PDFViewerContent
function PDFViewerContent() {
  const { searchResults, findExactMatches } = useSearch();

  useEffect(() => {
    if (searchTerm) {
      findExactMatches({ searchText: searchTerm });
    }
  }, [searchTerm, findExactMatches]);
}
```

#### 2. Search Results Not Converted to Highlights

```typescript
// ✅ Convert search results to highlight format
useEffect(() => {
  if (searchResults?.exactMatches) {
    const searchHighlights = searchResults.exactMatches.map((match) => ({
      id: `search-${match.pageNumber}-${match.id}`,
      x: match.x,
      y: match.y,
      width: match.width,
      height: match.height,
      pageNumber: match.pageNumber,
      color: "#FFFF00", // Yellow for search results
    }));
    setHighlights(searchHighlights);
  }
}, [searchResults]);
```

---

## Issue 6: Page Navigation Slow/Janky

### Optimization

```typescript
// ✅ Use memoization
const currentPageTemplate = useMemo(
  () => templates[currentPage] || [],
  [templates, currentPage]
);

// ✅ Debounce page changes if triggered by slider
const debouncedPage = useDebounce(selectedPage, 100);
```

---

## Issue 7: Memory Leak with Large PDFs

### Solution

```typescript
// ✅ Cleanup blob URLs when done
useEffect(() => {
  return () => {
    if (blobUrl && blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrl);
    }
  };
}, [blobUrl]);
```

---

## Common Debug Commands

```typescript
// Log hook values
console.log("usePdfJump:", usePdfJump());
console.log("useSearch:", useSearch());
console.log("useSelectionDimensions:", useSelectionDimensions());

// Check if inside Root
console.log("Root context:", useContext(RootContext)); // Should not be undefined

// Check PDF loading
console.log("PDF Source:", source);
console.log("Worker:", GlobalWorkerOptions.workerSrc);
```

---

## Example Debug Prompts

"I'm getting 'usePdfJump must be called inside Root' error. Help me restructure the component to fix this."

"PDF is showing 'Loading...' forever. Walk through the debugging steps to identify the issue."

"Text selection isn't working on the PDF. What components am I missing?"

"Search results aren't appearing as highlights. How do I convert search results to the highlight format?"
