/**
 * Example Component Template for Lector Review
 *
 * This demonstrates the standard component pattern used in this project.
 * Copy and adapt this template when creating new components.
 */

import { useState, useEffect } from 'react';

/**
 * Component description
 * @component
 * @example
 * <ExampleComponent
 *   title="Hello"
 *   onAction={handleAction}
 *   isActive={true}
 * />
 */
interface ExampleComponentProps {
  /** Title text to display */
  title: string;
  /** Callback when action is triggered */
  onAction: (data: string) => void;
  /** Whether component is in active state */
  isActive?: boolean;
  /** Optional children elements */
  children?: React.ReactNode;
}

export function ExampleComponent({
  title,
  onAction,
  isActive = false,
  children
}: ExampleComponentProps) {
  // ==================== STATE ====================
  const [localValue, setLocalValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Effect logic
    console.log('Component mounted or updated');

    // Cleanup function
    return () => {
      console.log('Component cleanup');
    };
  }, [/* dependencies */]);

  // ==================== HANDLERS ====================
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Perform operation
      await someAsyncOperation(localValue);

      // Success feedback
      showToast('Operation successful!', 'success');
      onAction(localValue);

    } catch (err) {
      console.error('Operation failed:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      showToast(`Failed: ${message}`, 'error');

    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null); // Clear error on change
  };

  // ==================== RENDER ====================
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {isActive && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Active
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder="Enter value..."
          aria-label="Example input field"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                     rounded focus:ring-2 focus:ring-blue-500 focus:outline-none
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Children slot */}
        {children}
      </div>

      {/* Footer with actions */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !localValue}
          aria-label="Submit action"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

async function someAsyncOperation(value: string): Promise<void> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (!value) throw new Error('Value is required');
}

function showToast(message: string, type: 'success' | 'error' | 'info') {
  // Toast implementation (would come from context or import)
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// ==================== USAGE EXAMPLE ====================

/*
import { ExampleComponent } from '@/components';

function Parent() {
  const handleAction = (data: string) => {
    console.log('Received:', data);
  };

  return (
    <ExampleComponent
      title="My Component"
      onAction={handleAction}
      isActive={true}
    >
      <p>Optional children content</p>
    </ExampleComponent>
  );
}
*/
