# Integration Guide - Lector Review

This guide provides step-by-step instructions for integrating the pending features in Lector Review.

---

## Table of Contents
- [PDF Upload Integration](#pdf-upload-integration)
- [Template Manager Integration](#template-manager-integration)
- [Schema-Based Forms Integration](#schema-based-forms-integration)
- [Testing After Integration](#testing-after-integration)

---

## PDF Upload Integration

### Current State
✅ Components ready: `src/components/PDFUpload.tsx`, `src/components/PDFList.tsx`
✅ Storage utility: `src/utils/pdfStorage.ts`
✅ Hook ready: `src/hooks/usePDFManager.ts`
⏱️ Estimated time: **2 hours**

### Step 1: Import Required Modules

Add to `src/App.tsx`:

```typescript
// Add these imports at the top
import { PDFUpload, PDFList } from './components/PDFUpload';
import { PDFList } from './components/PDFList';
import { usePDFManager } from './hooks/usePDFManager';
```

### Step 2: Add PDF Management State

Inside the `App` component, add the PDF manager hook:

```typescript
function App() {
  // Add this after existing state declarations
  const {
    pdfs,           // Array of uploaded PDFs
    currentPDF,     // Currently selected PDF
    addPDF,         // Upload new PDF
    removePDF,      // Delete PDF
    selectPDF       // Switch to different PDF
  } = usePDFManager();

  // ... rest of component
}
```

### Step 3: Update PDF Source Logic

Replace the static PDF source with dynamic selection:

```typescript
// BEFORE:
const [source, setSource] = useState("/Kim2016.pdf");

// AFTER:
const pdfSource = currentPDF?.blobUrl || "/Kim2016.pdf";

// Update the Root component:
<Root documentSource={pdfSource}>
  {/* ... */}
</Root>
```

### Step 4: Add PDF Upload UI

Add the PDF upload and list components to the left sidebar:

```typescript
{/* In the left sidebar, after the project selector */}
<div className="mt-6">
  <h3 className="text-sm font-semibold mb-2">PDF Management</h3>

  <PDFUpload
    onUpload={addPDF}
    accept=".pdf"
    maxSize={50 * 1024 * 1024} // 50MB
  />

  {pdfs.length > 0 && (
    <PDFList
      pdfs={pdfs}
      currentPDF={currentPDF}
      onSelect={selectPDF}
      onRemove={removePDF}
    />
  )}
</div>
```

### Step 5: Add PDF Source Input (Optional Fallback)

Keep the URL input as a fallback option:

```typescript
<div className="mt-4">
  <label className="block text-sm font-medium mb-1">
    Or load from URL:
  </label>
  <input
    type="text"
    value={pdfSource}
    onChange={(e) => {
      // Create custom PDF metadata for URL
      const urlPDF: PDFMetadata = {
        id: 'url-pdf',
        name: 'URL PDF',
        blobUrl: e.target.value,
        size: 0,
        uploadDate: new Date().toISOString()
      };
      selectPDF(urlPDF);
    }}
    placeholder="Enter PDF URL..."
    className="w-full px-3 py-2 border rounded"
  />
</div>
```

### Step 6: Handle PDF Deletion

Update the PDF removal handler to confirm before deleting:

```typescript
const handleRemovePDF = (pdfId: string) => {
  if (confirm('Are you sure you want to remove this PDF?')) {
    removePDF(pdfId);
    showToast('PDF removed', 'success');
  }
};

// Use in PDFList:
<PDFList
  pdfs={pdfs}
  currentPDF={currentPDF}
  onSelect={selectPDF}
  onRemove={handleRemovePDF}
/>
```

### Testing Checklist

- [ ] Click "Upload PDF" button
- [ ] Select a PDF file from computer
- [ ] Verify PDF appears in list
- [ ] Click on PDF to view it
- [ ] Verify PDF renders correctly
- [ ] Upload multiple PDFs
- [ ] Switch between PDFs
- [ ] Remove a PDF
- [ ] Verify data persists in IndexedDB
- [ ] Test with large PDF (> 10MB)
- [ ] Test error handling (invalid file)

---

## Template Manager Integration

### Current State
✅ Component ready: `src/components/TemplateManager.tsx`
⏱️ Estimated time: **2 hours**

### Step 1: Add Modal State

Add state to control the template manager modal:

```typescript
function App() {
  // Add this state
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // ... rest of component
}
```

### Step 2: Add Button to Open Template Manager

Add a button in the right sidebar to open the template manager:

```typescript
{/* In the right sidebar, before the field form */}
<div className="mb-4">
  <button
    onClick={() => setShowTemplateManager(true)}
    aria-label="Manage field templates"
    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700
               flex items-center justify-center space-x-2"
  >
    <span>⚙️</span>
    <span>Manage Templates</span>
  </button>
</div>
```

### Step 3: Add Template Manager Modal

Import and add the Modal and TemplateManager:

```typescript
import { Modal } from './components/Modal';
import { TemplateManager } from './components/TemplateManager';

// In the App component JSX, add:
<Modal
  isOpen={showTemplateManager}
  onClose={() => setShowTemplateManager(false)}
  title="Field Template Manager"
>
  <TemplateManager
    templates={templates}
    onUpdate={(newTemplates) => {
      setTemplates(newTemplates);
      showToast('Templates updated', 'success');
    }}
    currentPage={currentPage}
  />
</Modal>
```

### Step 4: Add Template Import/Export

Add buttons for template import/export:

```typescript
// Import template from JSON
const handleImportTemplate = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setTemplates(imported);
          showToast('Template imported', 'success');
        } catch (error) {
          showToast('Invalid template file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Export template to JSON
const handleExportTemplate = () => {
  const blob = new Blob([JSON.stringify(templates, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProject}_templates.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Template exported', 'success');
};
```

### Step 5: Connect to Form Generation

Ensure the current form system uses the updated templates:

```typescript
const currentPageTemplate = useMemo(
  () => templates[currentPage] || [],
  [templates, currentPage]
);

// Render fields from template
{currentPageTemplate.map(field => (
  <div key={field.id} className="mb-4">
    <label className="block text-sm font-medium mb-1">
      {field.label}
      {field.required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={field.type || 'text'}
      value={pageForm[`${currentPage}:${field.id}`] || ''}
      onChange={(e) => handleFieldChange(field.id, e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 border rounded"
    />
  </div>
))}
```

### Testing Checklist

- [ ] Click "Manage Templates" button
- [ ] Modal opens with TemplateManager
- [ ] View existing templates for current page
- [ ] Add new field to template
- [ ] Edit existing field
- [ ] Remove field from template
- [ ] Copy template to all pages
- [ ] Close modal and verify form updated
- [ ] Export templates to JSON
- [ ] Import templates from JSON
- [ ] Verify templates persist in LocalStorage
- [ ] Switch pages and verify different templates

---

## Schema-Based Forms Integration

### Current State
✅ Component ready: `src/components/SchemaForm.tsx`
✅ Parser ready: `src/utils/schemaParser.ts`
✅ Schema file: `schema.json`
⏱️ Estimated time: **3 hours**

### Step 1: Import Required Modules

```typescript
import { SchemaForm } from './components/SchemaForm';
import { parseSchema } from './utils/schemaParser';
import schemaJSON from '../schema.json';
```

### Step 2: Parse Schema on Mount

```typescript
function App() {
  const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);

  useEffect(() => {
    try {
      const schema = parseSchema(schemaJSON);
      setParsedSchema(schema);
    } catch (error) {
      console.error('Schema parse error:', error);
      showToast('Failed to load schema', 'error');
    }
  }, []);

  // ... rest of component
}
```

### Step 3: Replace Current Form with SchemaForm

Replace the current field rendering with SchemaForm:

```typescript
// BEFORE:
{currentPageTemplate.map(field => (
  <input key={field.id} {...} />
))}

// AFTER:
{parsedSchema ? (
  <SchemaForm
    schema={parsedSchema}
    page={currentPage}
    data={pageForm}
    onChange={handleFieldChange}
    highlights={highlights}
  />
) : (
  <Loading message="Loading form schema..." />
)}
```

### Step 4: Update Data Structure

Modify the data structure to support source traceability:

```typescript
interface SourcedFieldData {
  value: string;
  source_text?: string;
  source_location?: string;
  highlightId?: string;
}

type SchemaPageFormData = Record<string, SourcedFieldData>;

// Update handleFieldChange:
const handleFieldChange = (fieldId: string, value: string, highlight?: LabeledHighlight) => {
  const fieldKey = `${currentPage}:${fieldId}`;

  setPageForm(prev => ({
    ...prev,
    [fieldKey]: {
      value,
      source_text: highlight?.label,
      source_location: highlight ? `Page ${highlight.pageNumber}` : undefined,
      highlightId: highlight?.id
    }
  }));
};
```

### Step 5: Link Highlights to Fields

Add functionality to link highlights to specific fields:

```typescript
const linkHighlightToField = (fieldId: string, highlightId: string) => {
  const highlight = highlights.find(h => h.id === highlightId);
  if (!highlight) return;

  handleFieldChange(fieldId, highlight.label, highlight);
  showToast('Highlight linked to field', 'success');
};

// Add to SchemaForm component:
<SchemaForm
  schema={parsedSchema}
  page={currentPage}
  data={pageForm}
  onChange={handleFieldChange}
  highlights={highlights}
  onLinkHighlight={linkHighlightToField}
/>
```

### Step 6: Update Export Functions

Modify export functions to include schema-structured data:

```typescript
const exportSchemaData = () => {
  const schemaData = {
    project: currentProject,
    schema_version: schemaJSON.version || "1.0",
    data: Object.entries(pageForm).reduce((acc, [key, value]) => {
      const [page, fieldId] = key.split(':');
      const schemaPath = getSchemaPath(fieldId); // Map field to schema

      if (!acc[schemaPath]) {
        acc[schemaPath] = value;
      }

      return acc;
    }, {}),
    highlights: highlights,
    exportedAt: new Date().toISOString()
  };

  // Export as JSON
  const blob = new Blob([JSON.stringify(schemaData, null, 2)], {
    type: 'application/json'
  });
  // ... download logic
};
```

### Step 7: Add Schema Validation

Implement validation based on schema rules:

```typescript
const validateAgainstSchema = (fieldId: string, value: string): boolean => {
  const schemaField = findSchemaField(parsedSchema, fieldId);

  if (!schemaField) return true;

  // Required field check
  if (schemaField.required && !value) {
    showToast(`${schemaField.label} is required`, 'error');
    return false;
  }

  // Type validation
  if (schemaField.type === 'number' && isNaN(Number(value))) {
    showToast(`${schemaField.label} must be a number`, 'error');
    return false;
  }

  // Enum validation
  if (schemaField.enum && !schemaField.enum.includes(value)) {
    showToast(`${schemaField.label} must be one of: ${schemaField.enum.join(', ')}`, 'error');
    return false;
  }

  return true;
};
```

### Testing Checklist

- [ ] Schema loads and parses correctly
- [ ] SchemaForm renders with schema fields
- [ ] Fields are organized by schema sections
- [ ] Data entry works
- [ ] Validation rules apply
- [ ] Required fields are marked
- [ ] Enum fields show dropdowns
- [ ] Number fields validate numeric input
- [ ] Link highlight to field works
- [ ] Source traceability appears
- [ ] Export includes schema structure
- [ ] Import validates against schema
- [ ] Switch between pages maintains data
- [ ] Error handling for invalid schema

---

## Testing After Integration

### Unit Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage
```

Create test files:
- `src/__tests__/pdfUpload.test.ts`
- `src/__tests__/templateManager.test.ts`
- `src/__tests__/schemaForm.test.ts`

### E2E Testing

```bash
# Run E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui
```

Create E2E tests:
- `e2e/pdf-upload.spec.ts`
- `e2e/template-manager.spec.ts`
- `e2e/schema-forms.spec.ts`

### Manual Testing Workflow

1. **PDF Upload**
   - Upload PDF → View → Switch → Delete

2. **Template Manager**
   - Open → Edit template → Save → Verify form updates

3. **Schema Forms**
   - Load schema → Fill fields → Link highlights → Export

4. **Integration**
   - Upload PDF → Manage templates → Extract data → Export

### Regression Testing

After each integration, verify:
- [ ] Existing features still work
- [ ] No console errors
- [ ] Dark mode works
- [ ] Keyboard shortcuts work
- [ ] Export functions work
- [ ] LocalStorage persistence works
- [ ] Project switching works

---

## Rollback Plan

If integration causes issues:

1. **Revert Git commits:**
   ```bash
   git revert <commit-hash>
   ```

2. **Use feature flags:**
   ```typescript
   const ENABLE_PDF_UPLOAD = false;
   const ENABLE_SCHEMA_FORMS = false;

   {ENABLE_PDF_UPLOAD && <PDFUpload />}
   {ENABLE_SCHEMA_FORMS ? <SchemaForm /> : <LegacyForm />}
   ```

3. **Isolate in separate branch:**
   ```bash
   git checkout -b feature/pdf-upload
   # Test thoroughly before merging
   ```

---

## Post-Integration Tasks

- [ ] Update README.md with new features
- [ ] Add to CHANGELOG.md
- [ ] Update USER_GUIDE.md
- [ ] Record demo video
- [ ] Deploy to staging for testing
- [ ] Collect user feedback
- [ ] Fix any reported issues
- [ ] Deploy to production

---

**Last Updated:** November 2025
**Maintained by:** Lector Review Team
