# Prompt: Add New Component

Use this template when creating new React components for Lector Review.

## Component Template

```typescript
import { useState } from 'react';

/**
 * [Component Description]
 * @component
 * @example
 * <ComponentName prop1="value" prop2={handler} />
 */
interface ComponentNameProps {
  // Define props with JSDoc comments
  /** Description of prop1 */
  prop1: string;
  /** Description of prop2 */
  prop2: () => void;
  children?: React.ReactNode;
}

export function ComponentName({ prop1, prop2, children }: ComponentNameProps) {
  // 1. State declarations
  const [localState, setLocalState] = useState<string>('');

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [/* dependencies */]);

  // 3. Event handlers
  const handleClick = () => {
    try {
      // Handler logic
      showToast("Success!", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Operation failed", "error");
    }
  };

  // 4. Render
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      {/* Component content */}
    </div>
  );
}
```

## Checklist

- [ ] Component uses TypeScript with proper interface
- [ ] Props have JSDoc documentation
- [ ] Event handlers have error handling
- [ ] Uses Tailwind CSS for styling
- [ ] Supports dark mode (`dark:` classes)
- [ ] Has ARIA labels on interactive elements
- [ ] Uses semantic HTML
- [ ] Exported from `src/components/index.ts`
- [ ] Unit test created (if contains logic)

## Common Patterns

### Modal Component
```typescript
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

### Toast Notifications
```typescript
showToast("Operation successful", "success");
showToast("Something went wrong", "error");
showToast("Loading...", "info");
```

### Loading State
```typescript
{isLoading && <Loading message="Loading data..." />}
```

## Example Prompt

"Create a new component called `SearchResults` that displays a list of PDF search matches. It should accept an array of results and a callback for when a result is clicked. Include dark mode support and ARIA labels."
