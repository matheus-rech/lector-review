# Code Patterns - Lector Review

This document describes common code patterns used throughout the Lector Review codebase. Follow these patterns when adding new features or modifying existing code.

---

## Table of Contents

- [Component Patterns](#component-patterns)
- [Hook Patterns](#hook-patterns)
- [Storage Patterns](#storage-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Styling Patterns](#styling-patterns)
- [Testing Patterns](#testing-patterns)

---

## Component Patterns

### Standard Component Structure

```typescript
import { useState, useEffect, useCallback } from "react";
import type { ComponentProps } from "@/types";

/**
 * Component description
 * @component
 * @example
 * <ComponentName prop1="value" onAction={handler} />
 */
interface ComponentNameProps {
  /** Prop description */
  prop1: string;
  onAction: (data: string) => void;
  children?: React.ReactNode;
}

export function ComponentName({
  prop1,
  onAction,
  children,
}: ComponentNameProps) {
  // 1. STATE
  const [localState, setLocalState] = useState<string>("");

  // 2. EFFECTS
  useEffect(
    () => {
      // Effect logic
      return () => {
        // Cleanup
      };
    },
    [
      /* dependencies */
    ]
  );

  // 3. HANDLERS
  const handleClick = useCallback(() => {
    try {
      // Logic
      onAction(localState);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [localState, onAction]);

  // 4. RENDER
  return <div className="component-wrapper">{children}</div>;
}
```

### Modal Dialog Pattern

```typescript
import { Modal } from "@/components";

// Usage
function ParentComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    // Perform action
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
      >
        <p>Are you sure?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      </Modal>
    </>
  );
}
```

### Toast Notification Pattern

```typescript
// Success
showToast("Operation completed successfully!", "success");

// Error
showToast("Failed to save data", "error");

// Info
showToast("Loading PDF...", "info");

// Warning
showToast("Storage limit approaching", "warning");

// With custom duration
showToast("Auto-saved", "info", 2000); // 2 seconds
```

### Loading State Pattern

```typescript
import { Loading } from "@/components";

function DataComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading message="Loading data..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## Hook Patterns

### Custom Hook Structure

```typescript
export function useCustomHook<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    isLoading,
    error,
    updateValue,
    reset,
  };
}
```

### Debounce Hook Pattern

```typescript
import { useDebounce } from "@/hooks";

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### LocalStorage Hook Pattern

```typescript
const [theme, setTheme] = useLocalStorage("theme", "light");

// Update
setTheme("dark");

// Remove
setTheme(null);
```

### Undo/Redo Pattern

```typescript
import { useUndoRedo } from "@/hooks";

function Form() {
  const {
    state: formData,
    setState: setFormData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo({});

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
      {/* Form fields */}
    </div>
  );
}
```

---

## Storage Patterns

### LocalStorage Namespacing

```typescript
// Always use project namespacing
const key = (project: string, dataType: string) =>
  `proj:${project}:${dataType}`;

// Save
localStorage.setItem(
  key(currentProject, "highlights"),
  JSON.stringify(highlights)
);

// Load
const data = localStorage.getItem(key(currentProject, "highlights"));
const highlights = data ? JSON.parse(data) : [];
```

### Composite Key Pattern

```typescript
// For per-page field data
const fieldKey = `${pageNumber}:${fieldId}`;

// Save field
setPageForm((prev) => ({
  ...prev,
  [fieldKey]: value,
}));

// Get field
const value = pageForm[fieldKey] || "";

// Get all fields for page
const pageFields = Object.keys(pageForm)
  .filter((key) => key.startsWith(`${pageNumber}:`))
  .reduce(
    (acc, key) => ({
      ...acc,
      [key.split(":")[1]]: pageForm[key],
    }),
    {}
  );
```

### Safe JSON Parse

```typescript
function safeJSONParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;

  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
}

// Usage
const highlights = safeJSONParse(
  localStorage.getItem(key("default", "highlights")),
  []
);
```

### Batch LocalStorage Updates

```typescript
// ❌ BAD - Multiple writes
fields.forEach((field) => {
  localStorage.setItem(`proj:${project}:${field.id}`, field.value);
});

// ✅ GOOD - Single write
const data = fields.reduce(
  (acc, field) => ({
    ...acc,
    [field.id]: field.value,
  }),
  {}
);
localStorage.setItem(`proj:${project}:data`, JSON.stringify(data));
```

---

## Error Handling Patterns

### Try-Catch with Toast

```typescript
async function saveData() {
  try {
    setIsLoading(true);
    await performSave();
    showToast("Data saved successfully!", "success");
  } catch (error) {
    console.error("Save failed:", error);
    const message = error instanceof Error ? error.message : "Save failed";
    showToast(message, "error");
  } finally {
    setIsLoading(false);
  }
}
```

### Error Boundary Pattern

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Input Validation Pattern

```typescript
import { validateField } from "@/utils/validation";

function handleFieldChange(fieldId: string, value: string) {
  const validation = validateField(fieldId, value);

  if (!validation.valid) {
    showToast(validation.error, "error");
    return;
  }

  setPageForm((prev) => ({
    ...prev,
    [`${currentPage}:${fieldId}`]: value,
  }));
}
```

---

## Styling Patterns

### Tailwind CSS Patterns

```typescript
// Base component styles
const baseStyles = "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2";

// Primary button
<button className={`${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}>
  Primary
</button>

// Input field
<input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  focus:ring-2 focus:ring-blue-500 focus:outline-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />

// Card
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  Content
</div>
```

### Dark Mode Pattern

```typescript
// Always include dark: variants
className = "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";

// Hover states with dark mode
className = "hover:bg-gray-100 dark:hover:bg-gray-700";

// Border colors
className = "border-gray-300 dark:border-gray-600";

// Toggle dark mode
const { isDark, toggleDark } = useDarkMode();

<button onClick={toggleDark} aria-label="Toggle dark mode">
  {isDark ? "☀️" : "🌙"}
</button>;
```

### Responsive Layout Pattern

```typescript
// Mobile-first approach
<div
  className="
  flex flex-col          /* mobile: stack vertically */
  md:flex-row           /* tablet+: horizontal layout */
  lg:gap-6              /* desktop: larger gaps */
"
>
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>
```

---

## Testing Patterns

### Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("utilityFunction", () => {
  beforeEach(() => {
    // Setup
  });

  it("should handle normal case", () => {
    const result = utilityFunction(input);
    expect(result).toBe(expected);
  });

  it("should handle edge case", () => {
    const result = utilityFunction(edgeCase);
    expect(result).toBeDefined();
  });

  it("should throw on invalid input", () => {
    expect(() => utilityFunction(invalid)).toThrow();
  });
});
```

### Component Test Pattern

```typescript
import { render, screen, fireEvent } from "@testing-library/react";

describe("Component", () => {
  it("should render with props", () => {
    render(<Component title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should call handler on click", () => {
    const mockHandler = vi.fn();
    render(<Component onClick={mockHandler} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockHandler).toHaveBeenCalledOnce();
  });
});
```

### E2E Test Pattern

```typescript
import { test, expect } from "@playwright/test";

test("should complete workflow", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForSelector('[data-testid="app-loaded"]');

  await page.fill('[aria-label="Input"]', "test value");
  await page.click('[aria-label="Submit"]');

  await expect(page.locator(".success-message")).toBeVisible();
});
```

---

## Lector-Specific Patterns

### Hook Usage Pattern

```typescript
// ✅ ALWAYS inside Root's children
function PDFViewerContent() {
  const { jumpToPage, currentPageNumber, totalPages } = usePdfJump();
  const { searchResults, findExactMatches } = useSearch();
  const selectionDimensions = useSelectionDimensions();

  // Use hooks...
}
```

### Highlight Layer Pattern

```typescript
// Convert highlights to Lector format
// ColoredHighlight requires pageNumber and rects array (not individual x/y/width/height)
const coloredHighlights: ColoredHighlight[] = highlights.map((h) => ({
  id: h.id,
  pageNumber: h.pageNumber,
  rects: [
    {
      x: h.x,
      y: h.y,
      width: h.width,
      height: h.height,
    },
  ],
  color:
    h.kind === "search" ? "rgba(255, 255, 0, 0.4)" : "rgba(0, 255, 0, 0.3)",
}));

<ColoredHighlightLayer highlights={coloredHighlights} />;
```

### Search Result Pattern

```typescript
useEffect(() => {
  if (searchResults?.exactMatches) {
    const searchHighlights = searchResults.exactMatches.map((match) => ({
      id: `search-${match.pageNumber}-${match.id}`,
      label: match.text,
      kind: "search" as const,
      pageNumber: match.pageNumber,
      x: match.x,
      y: match.y,
      width: match.width,
      height: match.height,
    }));

    setHighlights(searchHighlights);
  }
}, [searchResults]);
```

---

## Best Practices Summary

### ✅ DO

- Use TypeScript for all new code
- Add JSDoc comments to functions
- Handle errors with try-catch
- Provide user feedback with Toast
- Use semantic HTML and ARIA labels
- Follow the LocalStorage namespacing pattern
- Debounce expensive operations
- Memoize computed values
- Write tests for utilities and critical logic

### ❌ DON'T

- Call Lector hooks outside Root context
- Use browser prompts (alert, confirm, prompt)
- Mutate state directly
- Forget cleanup in useEffect
- Store sensitive data in LocalStorage
- Skip error handling
- Forget accessibility attributes
- Use class components (use functional)
- Hardcode values (use constants)

---

**Last Updated:** November 2025
**Maintained by:** Lector Review Team
