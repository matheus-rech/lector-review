# Lector Review - Production

A production-ready **PDF viewer and systematic review data extraction application** built with React, TypeScript, and the Lector PDF library. This application provides comprehensive tools for managing multiple projects, annotating PDFs, extracting structured data, and exporting results for systematic reviews and meta-analyses.

![Lector Review](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)

## 🎯 Features

### Multi-Project Management
- Create and manage multiple isolated projects
- Switch between projects seamlessly
- Delete projects (except the default one)
- All data persisted in browser localStorage

### PDF Viewing & Navigation
- High-quality PDF rendering with Canvas, Text, and Annotation layers
- **Collapsible thumbnail panel** with page previews
- **Floating page navigation** with Previous/Next/First/Last buttons
- **Direct page jump** via input field
- **Zoom controls** (50%-300%) with visual feedback
- **Dark mode support** with proper color inversion
- **Single-page view** for focused reading

### Text Selection & Highlighting
- Select text directly in the PDF with custom tooltip
- Create labeled highlights with custom names
- Visual highlight rendering (green for user highlights, yellow for search)
- Highlight management (rename, delete, jump to)
- Persistent storage per project

### Search Functionality
- Full-text search across the PDF
- Search term processing and result tracking
- Real-time search result count

### Data Extraction System

#### Document-Level Template Form
- **17 pre-configured fields** for systematic review data extraction
- Fields available on **all pages** (not page-specific)
- Organized by category:
  - **Study Identification**: DOI/PMID, First Author, Year, Country
  - **Study Design**: Research Question, Study Design, Control Definition
  - **Sample Size**: Total Patients, Intervention/Control Group Sizes
  - **Demographics**: Age, Gender, Baseline Status
  - **Outcomes**: Primary Outcome, Effect Measure, 95% CI, P-value
- Data persists across page navigation

#### Comprehensive Schema Form
- Structured form with nested sections
- **I. Study Metadata and Identification**
- **II. Risk of Bias Assessment**
- **III. Study Design and Purpose**
- Each field includes value, source text, and source location
- Document-level data storage

### Export Capabilities
- **Export JSON**: Complete project data including highlights, templates, and form data
- **Export CSV**: Tabular format with highlights, page fields, and PDF form data
- Easy integration with statistical analysis tools

### Embedded PDF Form Support
- Capture data from PDF AcroForms
- Submit and save form values locally
- Persist form data per project

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/matheus-rech/lector-review-production.git
cd lector-review-production

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Usage

1. **Open the application** in your browser (default: http://localhost:5173)
2. **Select or create a project** using the dropdown and buttons in the left sidebar
3. **Load a PDF** by:
   - Uploading a file using the file input
   - Entering a PDF URL in the URL field
   - Default sample PDF loads automatically
4. **Navigate the PDF** using:
   - Thumbnail panel (click thumbnails to jump to pages)
   - Floating navigation buttons at the bottom center
   - Zoom controls for better readability
5. **Extract data**:
   - Use **Template Form** for quick extraction with pre-configured fields
   - Use **Schema Form** for comprehensive structured data extraction
   - Fill in fields from any page in the PDF
6. **Create highlights**:
   - Select text in the PDF
   - Add custom labels to highlights
   - Manage highlights in the right sidebar
7. **Search the PDF**:
   - Enter search terms in the search box
   - Navigate between search results
8. **Export your data**:
   - Click "Export JSON" for complete project data
   - Click "Export CSV" for tabular format

## 📚 Technology Stack

- **React 19** - UI framework with latest features
- **TypeScript 5.6** - Type safety and developer experience
- **Vite 5.4** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **@anaralabs/lector 3.7.2** - PDF viewer component library
- **pdfjs-dist 4.9** - PDF.js library for PDF rendering

## 🏗️ Project Structure

```
lector-review-production/
├── public/
│   └── sample.pdf              # Sample PDF for testing
├── src/
│   ├── components/
│   │   ├── Modal.tsx           # Modal dialogs
│   │   ├── PageNavigationButtons.tsx  # Floating navigation
│   │   ├── SchemaForm.tsx      # Comprehensive form
│   │   ├── TemplateManager.tsx # Template management
│   │   └── index.ts            # Component exports
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # TypeScript declarations
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🔧 Configuration

### PDF Worker
The application uses PDF.js worker for rendering. The worker is configured in `src/main.tsx`:

```typescript
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

### Local Storage
All project data is stored in browser localStorage with the following keys:
- `proj:{projectName}:highlights` - Highlight data
- `proj:{projectName}:templates` - Template configuration
- `proj:{projectName}:pageForm` - Form data
- `proj:{projectName}:searchTerm` - Search state

## 🎨 Customization

### Adding Custom Fields
Edit the `defaultTemplates` array in `src/App.tsx` to add or modify extraction fields:

```typescript
const defaultTemplates: FieldTemplate[] = [
  {
    id: "custom_field",
    label: "Custom Field Label",
    placeholder: "Placeholder text",
  },
  // ... more fields
];
```

### Styling
The application uses Tailwind CSS. Customize styles by:
1. Editing `tailwind.config.js` for theme customization
2. Modifying component classes in `src/App.tsx` and components
3. Adding custom CSS in `src/index.css`

## 🐛 Known Issues

### Lector Library Limitations
- The Lector v3.7.2 library has some known limitations documented in the [official repository](https://github.com/anaralabs/lector/issues)
- All documented features from Lector are properly implemented in this application

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- [Lector PDF Library](https://lector-weld.vercel.app/) by Anara Labs
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [React](https://react.dev/) by Meta
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

## 📊 Version History

### v1.0.0 (2024-11-04)
- ✅ Full compliance with Lector v3.7.2 documentation
- ✅ Fixed page navigation (moved inside Root component)
- ✅ Fixed thumbnail toggle functionality
- ✅ Dynamic page count detection
- ✅ Document-level Template Form (not page-specific)
- ✅ Single-page view for better readability
- ✅ Removed duplicate navigation controls
- ✅ Comprehensive data extraction system
- ✅ Multi-project management
- ✅ Export to JSON and CSV formats
