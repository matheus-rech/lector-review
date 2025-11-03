# Prompt: Integrate Pending Feature

Use this guide when integrating one of the pending features (PDF Upload, Template Manager, or Schema Forms).

## PDF Upload Integration

### Current State
- ✅ Component ready: `src/components/PDFUpload.tsx`
- ✅ Storage utility: `src/utils/pdfStorage.ts`
- ✅ Hook ready: `src/hooks/usePDFManager.ts`

### Integration Steps

1. **Import required modules in App.tsx:**
```typescript
import { PDFUpload, PDFList } from '@/components';
import { usePDFManager } from '@/hooks';
```

2. **Add PDF management state:**
```typescript
const { pdfs, currentPDF, addPDF, removePDF, selectPDF } = usePDFManager();
```

3. **Replace static source with dynamic:**
```typescript
// Before:
const [source, setSource] = useState("/Kim2016.pdf");

// After:
const pdfSource = currentPDF?.blobUrl || "/Kim2016.pdf";
```

4. **Add PDF UI to sidebar:**
```typescript
<PDFUpload onUpload={addPDF} />
<PDFList pdfs={pdfs} onSelect={selectPDF} onRemove={removePDF} />
```

### Testing Checklist
- [ ] Upload PDF file
- [ ] PDF renders correctly
- [ ] Switch between multiple PDFs
- [ ] Remove PDF works
- [ ] Data persists to IndexedDB

---

## Template Manager Integration

### Current State
- ✅ Component ready: `src/components/TemplateManager.tsx`

### Integration Steps

1. **Add modal state:**
```typescript
const [showTemplateManager, setShowTemplateManager] = useState(false);
```

2. **Add button to open template manager:**
```typescript
<button
  onClick={() => setShowTemplateManager(true)}
  aria-label="Manage field templates"
>
  ⚙️ Manage Templates
</button>
```

3. **Add modal with TemplateManager:**
```typescript
<Modal
  isOpen={showTemplateManager}
  onClose={() => setShowTemplateManager(false)}
  title="Field Template Manager"
>
  <TemplateManager
    templates={templates}
    onUpdate={setTemplates}
  />
</Modal>
```

### Testing Checklist
- [ ] Open template manager
- [ ] Add new field to page template
- [ ] Remove field from template
- [ ] Edit field properties
- [ ] Copy template to all pages
- [ ] Templates persist to localStorage

---

## Schema Forms Integration

### Current State
- ✅ Component ready: `src/components/SchemaForm.tsx`
- ✅ Parser ready: `src/utils/schemaParser.ts`
- ✅ Schema file: `schema.json`

### Integration Steps

1. **Load and parse schema:**
```typescript
import { parseSchema } from '@/utils/schemaParser';
import schemaJSON from '../schema.json';

const [parsedSchema, setParsedSchema] = useState(null);

useEffect(() => {
  const schema = parseSchema(schemaJSON);
  setParsedSchema(schema);
}, []);
```

2. **Replace current form with SchemaForm:**
```typescript
// Before:
{currentPageTemplate.map(field => (
  <input key={field.id} ... />
))}

// After:
{parsedSchema && (
  <SchemaForm
    schema={parsedSchema}
    page={currentPage}
    data={pageForm}
    onChange={handleFieldChange}
  />
)}
```

3. **Update data structure for source traceability:**
```typescript
interface SourcedValue<T> {
  value: T;
  source_text?: string;
  source_location?: string;
  highlightId?: string;
}
```

### Testing Checklist
- [ ] Schema loads and parses
- [ ] Forms render from schema
- [ ] Data entry works
- [ ] Source traceability links highlights
- [ ] Validation works
- [ ] Export includes schema structure

---

## Example Prompts

### PDF Upload
"Integrate the PDF upload feature. Import PDFUpload and usePDFManager, add the PDF list UI to the sidebar, and update the source state to use the selected PDF."

### Template Manager
"Add the Template Manager component in a modal that opens when clicking a 'Manage Templates' button. Connect it to the templates state and ensure changes persist."

### Schema Forms
"Replace the current form system with SchemaForm. Load schema.json, parse it with parseSchema, and render forms based on the schema structure."
