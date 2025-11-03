# Prompt: Add Tests

Use this guide when adding tests to Lector Review.

## Unit Test Template (Vitest)

### Utility Function Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '@/utils';

describe('functionToTest', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle normal case', () => {
    const result = functionToTest(normalInput);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge case', () => {
    const result = functionToTest(edgeCase);
    expect(result).toBeDefined();
  });

  it('should throw error on invalid input', () => {
    expect(() => functionToTest(invalidInput)).toThrow();
  });
});
```

### Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '@/hooks';

describe('useCustomHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('should update value on action', () => {
    const { result } = renderHook(() => useCustomHook());
    act(() => {
      result.current.updateValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

### Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '@/components';

describe('Component', () => {
  it('should render with props', () => {
    render(<Component prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should call handler on click', () => {
    const mockHandler = vi.fn();
    render(<Component onClick={mockHandler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledOnce();
  });
});
```

---

## E2E Test Template (Playwright)

### Basic Flow Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user workflow', async ({ page }) => {
    // 1. Navigate
    await page.goto('http://localhost:5173');

    // 2. Wait for load
    await page.waitForSelector('[data-testid="app-loaded"]');

    // 3. Perform actions
    await page.fill('[aria-label="Field name"]', 'test value');
    await page.click('[aria-label="Submit button"]');

    // 4. Assert results
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### PDF Interaction Test
```typescript
test('should navigate PDF pages', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for PDF to load
  await page.waitForSelector('.pdf-page');

  // Check initial page
  await expect(page.locator('.page-indicator')).toHaveText('1 / 9');

  // Navigate to next page
  await page.click('[aria-label="Next page"]');
  await expect(page.locator('.page-indicator')).toHaveText('2 / 9');
});
```

### Export Test
```typescript
test('should export data', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Enter test data
  await page.fill('[data-testid="field-input"]', '112');

  // Trigger export
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[aria-label="Export CSV"]')
  ]);

  // Verify download
  expect(download.suggestedFilename()).toContain('.csv');
});
```

---

## Testing Best Practices

### 1. Test File Naming
- Unit tests: `functionName.test.ts`
- Component tests: `ComponentName.test.tsx`
- E2E tests: `feature-name.spec.ts`

### 2. Test Organization
```typescript
describe('Feature/Component Name', () => {
  describe('initialization', () => {
    // Tests for initial state
  });

  describe('user interactions', () => {
    // Tests for user actions
  });

  describe('edge cases', () => {
    // Tests for edge cases
  });
});
```

### 3. What to Test

**Unit Tests:**
- ✅ Utility functions
- ✅ Data transformations
- ✅ Validation logic
- ✅ Export functions
- ✅ Storage operations

**Component Tests:**
- ✅ Rendering with props
- ✅ User interactions
- ✅ State changes
- ✅ Error handling

**E2E Tests:**
- ✅ Critical user flows
- ✅ Data persistence
- ✅ Export functionality
- ✅ PDF navigation
- ✅ Project management

### 4. Common Test Utilities

```typescript
// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();

// Mock toast
const mockToast = vi.fn();

// Wait for async
await waitFor(() => {
  expect(result).toBeDefined();
});
```

---

## Running Tests

```bash
# Unit tests
pnpm test                  # Run once
pnpm test:watch            # Watch mode
pnpm test:coverage         # With coverage

# E2E tests
pnpm test:e2e              # Run E2E tests
pnpm test:e2e:ui           # With UI
```

---

## Example Prompts

"Write unit tests for the exportToJSON function in src/utils/importExport.ts. Include tests for normal data, empty data, and error cases."

"Create an E2E test that verifies the complete workflow: navigate to page 3, enter data in Total Patients field, export to CSV, and verify the CSV contains the entered data."

"Add component tests for the Modal component. Test opening, closing, and rendering children."
