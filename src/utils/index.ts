/**
 * Utility Functions Barrel Exports
 *
 * This file provides a single import point for all utility functions.
 * Usage: import { exportToJSON, validateField } from '@/utils'
 */

// Import/Export Utilities
export {
  exportToJSON,
  exportToCSV,
  importFromJSON,
  type ExportData,
  type CSVRow
} from './importExport';

// Validation Utilities
export {
  validateField,
  validateYear,
  validateNumber,
  validatePercentage,
  validateDOI,
  type ValidationResult
} from './validation';

// PDF Storage Utilities
export {
  savePDFToStorage,
  loadPDFFromStorage,
  removePDFFromStorage,
  getAllPDFs,
  formatFileSize,
  type PDFStorageEntry
} from './pdfStorage';

// Schema Parsing Utilities
export {
  parseSchema,
  validateAgainstSchema,
  getSchemaField,
  type ParsedSchema,
  type SchemaField
} from './schemaParser';
