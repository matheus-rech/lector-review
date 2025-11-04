# Analysis of Working Lector Documentation Example

**Source:** https://lector-weld.vercel.app/docs/code/page-navigation

## Key Finding: Navigation Works in Documentation Example

**Test Result:** ✅ The page navigation in the official documentation example WORKS perfectly
- Clicking Next button successfully navigated from page 1 to page 2
- Page indicator updated from "1 / 320" to "2 / 320"
- PDF content changed visually (different page displayed)

## Critical Difference Identified

### Working Example Structure (Documentation)

```tsx
const PageNavigation = () => {
  return (
    <Root
      source="/pdf/document.pdf"
      className="flex bg-gray-50 h-[500px]"
      loader={<div className="p-4">Loading...</div>}
    >
      <div className="relative flex-1">
        <Pages className="p-4">
          <Page>
            <CanvasLayer />
            <TextLayer />
          </Page>
        </Pages>
        <PageNavigationButtons />  {/* INSIDE Root component */}
      </div>
    </Root>
  );
};
```

**Key Point:** `PageNavigationButtons` is rendered **INSIDE** the `Root` component, as a sibling to `Pages`.

### Our Implementation Structure

```tsx
<div className="flex h-screen">
  {/* Left Sidebar */}
  <div>...</div>
  
  {/* PDF Viewer */}
  <div className="flex-1">
    <Root>
      <Pages>
        <Page>
          <CanvasLayer />
          <TextLayer />
          <AnnotationLayer />
        </Page>
      </Pages>
    </Root>
  </div>
  
  {/* Right Sidebar with Navigation Buttons */}
  <div>
    {/* Navigation buttons are HERE - OUTSIDE Root */}
    <button onClick={() => jumpToPageFn.current?.(...)}>Next</button>
  </div>
</div>
```

**Problem:** Navigation buttons are in the right sidebar, **OUTSIDE** the `Root` component.

## Working Example Code

### PageNavigationButtons Component

```tsx
import { usePdf, usePdfJump } from "@anaralabs/lector";
import { useEffect, useState } from "react";
import { Button } from "./button";

const PageNavigationButtons = () => {
  const pages = usePdf((state) => state.pdfDocumentProxy?.numPages);
  const currentPage = usePdf((state) => state.currentPage);
  const [pageNumber, setPageNumber] = useState<string | number>(currentPage);
  const { jumpToPage } = usePdfJump();  // Direct hook usage

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      jumpToPage(currentPage - 1, { behavior: "auto" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages) {
      jumpToPage(currentPage + 1, { behavior: "auto" });
    }
  };

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2.5 border border-gray-200">
      <Button
        onClick={handlePreviousPage}
        disabled={currentPage <= 1}
        className="rounded-full disabled:opacity-40"
        aria-label="Previous page"
      >
        {/* Previous icon */}
      </Button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (value >= 1 && value <= pages && currentPage !== value) {
              jumpToPage(value, { behavior: "auto" });
            } else {
              setPageNumber(currentPage);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="w-12 h-7 text-center bg-gray-50 border rounded-md text-sm focus:ring-2"
        />
        <span className="text-sm text-gray-500 font-medium">
          / {pages || 1}
        </span>
      </div>

      <Button
        onClick={handleNextPage}
        disabled={currentPage >= pages}
        className="rounded-full disabled:opacity-40"
        aria-label="Next page"
      >
        {/* Next icon */}
      </Button>
    </div>
  );
};
```

### Key Implementation Details

1. **Direct Hook Usage:** `const { jumpToPage } = usePdfJump();`
   - No ref passing
   - No callback functions
   - Direct access to the hook

2. **Component Placement:** Rendered inside Root component
   - Has access to Lector's React Context
   - Can use all Lector hooks directly

3. **Positioning:** Uses `absolute` positioning
   - Overlays on top of the PDF viewer
   - Centered at the bottom

4. **Behavior Option:** `jumpToPage(page, { behavior: "auto" })`
   - Uses "auto" behavior for instant jumping
   - No smooth scrolling animation

## Why Our Implementation Doesn't Work

### Root Cause

The Lector hooks (`usePdfJump`, `usePdf`, etc.) rely on **React Context** provided by the `Root` component. When components are outside the `Root`, they cannot access this context.

Our navigation buttons are in the right sidebar, which is outside the `Root` component's tree. Therefore:

1. ❌ Cannot use `usePdfJump()` directly
2. ❌ Cannot use `usePdf()` directly
3. ❌ Must pass functions through refs (which we attempted)
4. ❌ The ref-based approach has timing issues and doesn't work reliably

### The Ref Approach Limitation

```tsx
// Our attempted approach
const PDFViewerContent = ({ onJumpToPageReady }) => {
  const { jumpToPage } = usePdfJump();
  
  useEffect(() => {
    onJumpToPageReady(jumpToPage);  // Pass function up
  }, [jumpToPage]);
  
  return <Pages>...</Pages>;
};

// Parent component (outside Root)
const jumpToPageFn = useRef(null);

<Root>
  <PDFViewerContent onJumpToPageReady={(fn) => jumpToPageFn.current = fn} />
</Root>

// Later, outside Root
<button onClick={() => jumpToPageFn.current?.(2)}>Go to page 2</button>
```

**Why this fails:**
- The `jumpToPage` function from `usePdfJump()` is context-dependent
- It needs to be called from within the React Context tree
- Passing it through refs breaks the context chain
- The function may not have the correct scope/closure

## Solution

### Option 1: Move Navigation Inside Root (Recommended)

Restructure the layout so navigation buttons are inside the Root component:

```tsx
<Root>
  <div className="relative flex-1">
    <Pages>
      <Page>
        <CanvasLayer />
        <TextLayer />
        <AnnotationLayer />
      </Page>
    </Pages>
    <PageNavigationButtons />  {/* Move here */}
  </div>
</Root>
```

### Option 2: Create Multiple Root Instances

If the sidebar must stay outside, create separate components inside Root for different features:

```tsx
<Root>
  <PDFViewer />
  <NavigationControls />  {/* Inside Root but positioned absolutely */}
</Root>
```

### Option 3: Use Portal (Advanced)

Use React Portal to render navigation buttons in a different DOM location while keeping them in the React tree inside Root:

```tsx
// Inside Root component
const NavigationButtons = () => {
  const { jumpToPage } = usePdfJump();
  
  return ReactDOM.createPortal(
    <div>{/* Navigation buttons */}</div>,
    document.getElementById('sidebar-portal')
  );
};
```

## Comparison Table

| Aspect | Working Example | Our Implementation | Status |
|--------|----------------|-------------------|--------|
| Navigation buttons location | Inside Root | Outside Root | ❌ Wrong |
| Hook usage | Direct `usePdfJump()` | Ref-based passing | ❌ Wrong |
| Context access | ✅ Has access | ❌ No access | ❌ Wrong |
| Page navigation | ✅ Works | ❌ Doesn't work | ❌ Wrong |
| Button positioning | Absolute overlay | Sidebar | Different |
| Behavior parameter | `{ behavior: "auto" }` | Not used | Minor |

## Action Items

1. ✅ Identified root cause: Context access issue
2. ⏳ Refactor layout to move navigation inside Root
3. ⏳ Update PageNavigationButtons to use hooks directly
4. ⏳ Test page navigation after refactoring
5. ⏳ Verify all features still work

## Conclusion

The page navigation failure is **NOT a Lector library bug**. It's an architectural issue in our implementation where navigation controls are placed outside the Root component's React Context tree.

The GitHub issues #21 and #40 about `jumpToPage` not working with zoom may be real bugs, but they are **not the cause** of our problem. Our issue is simpler: we're trying to use Lector hooks from outside the Lector context.

**Fix:** Move navigation buttons inside the Root component and use hooks directly.
