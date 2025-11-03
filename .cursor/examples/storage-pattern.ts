/**
 * LocalStorage Pattern Examples for Lector Review
 *
 * This demonstrates the standard data persistence patterns used in this project.
 * All project data uses namespaced keys to prevent conflicts.
 */

// ==================== NAMESPACING PATTERN ====================

/**
 * Generate namespaced localStorage key
 * Pattern: proj:{projectName}:{dataType}
 */
function storageKey(project: string, dataType: string): string {
  return `proj:${project}:${dataType}`;
}

// Examples:
// storageKey("default", "highlights") → "proj:default:highlights"
// storageKey("study-2024", "pageForm") → "proj:study-2024:pageForm"
// storageKey("meta-analysis", "templates") → "proj:meta-analysis:templates"

// ==================== DATA TYPES ====================

interface LabeledHighlight {
  id: string;
  label: string;
  kind: "user" | "search";
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FieldTemplate {
  id: string;
  label: string;
  placeholder?: string;
}

type PageTemplates = Record<number, FieldTemplate[]>;
type PageFormData = Record<string, string>; // key: "pageNum:fieldId", value: field value

// ==================== SAVING DATA ====================

/**
 * Save highlights for a project
 */
function saveHighlights(projectName: string, highlights: LabeledHighlight[]): void {
  try {
    const key = storageKey(projectName, 'highlights');
    localStorage.setItem(key, JSON.stringify(highlights));
  } catch (error) {
    console.error('Failed to save highlights:', error);
    throw new Error('Storage limit reached or localStorage unavailable');
  }
}

/**
 * Save page form data for a project
 */
function savePageForm(projectName: string, formData: PageFormData): void {
  try {
    const key = storageKey(projectName, 'pageForm');
    localStorage.setItem(key, JSON.stringify(formData));
  } catch (error) {
    console.error('Failed to save form data:', error);
    throw new Error('Storage limit reached');
  }
}

/**
 * Save field templates for a project
 */
function saveTemplates(projectName: string, templates: PageTemplates): void {
  try {
    const key = storageKey(projectName, 'templates');
    localStorage.setItem(key, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save templates:', error);
    throw new Error('Storage limit reached');
  }
}

// ==================== LOADING DATA ====================

/**
 * Load highlights for a project
 */
function loadHighlights(projectName: string): LabeledHighlight[] {
  try {
    const key = storageKey(projectName, 'highlights');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load highlights:', error);
    return [];
  }
}

/**
 * Load page form data for a project
 */
function loadPageForm(projectName: string): PageFormData {
  try {
    const key = storageKey(projectName, 'pageForm');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load form data:', error);
    return {};
  }
}

/**
 * Load field templates for a project
 */
function loadTemplates(projectName: string, defaultTemplates: PageTemplates): PageTemplates {
  try {
    const key = storageKey(projectName, 'templates');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultTemplates;
  } catch (error) {
    console.error('Failed to load templates:', error);
    return defaultTemplates;
  }
}

// ==================== PROJECT MANAGEMENT ====================

/**
 * Load list of all projects
 */
function loadProjects(): string[] {
  try {
    const data = localStorage.getItem('projects');
    return data ? JSON.parse(data) : ['default'];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return ['default'];
  }
}

/**
 * Save list of all projects
 */
function saveProjects(projects: string[]): void {
  try {
    localStorage.setItem('projects', JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
    throw new Error('Storage limit reached');
  }
}

/**
 * Get current project name
 */
function getCurrentProject(): string {
  return localStorage.getItem('current-project') || 'default';
}

/**
 * Set current project name
 */
function setCurrentProject(projectName: string): void {
  localStorage.setItem('current-project', projectName);
}

// ==================== PROJECT OPERATIONS ====================

/**
 * Create new project
 */
function createProject(projectName: string): void {
  const projects = loadProjects();

  if (projects.includes(projectName)) {
    throw new Error('Project already exists');
  }

  projects.push(projectName);
  saveProjects(projects);
  setCurrentProject(projectName);
}

/**
 * Delete project and all its data
 */
function deleteProject(projectName: string): void {
  if (projectName === 'default') {
    throw new Error('Cannot delete default project');
  }

  const projects = loadProjects();
  const updatedProjects = projects.filter(p => p !== projectName);
  saveProjects(updatedProjects);

  // Delete all project data
  localStorage.removeItem(storageKey(projectName, 'highlights'));
  localStorage.removeItem(storageKey(projectName, 'pageForm'));
  localStorage.removeItem(storageKey(projectName, 'templates'));
  localStorage.removeItem(storageKey(projectName, 'pdfFormData'));

  // Switch to default project if current project was deleted
  if (getCurrentProject() === projectName) {
    setCurrentProject('default');
  }
}

/**
 * Switch to a different project
 */
function switchProject(projectName: string): ProjectData {
  setCurrentProject(projectName);

  return {
    highlights: loadHighlights(projectName),
    pageForm: loadPageForm(projectName),
    templates: loadTemplates(projectName, defaultTemplates),
  };
}

interface ProjectData {
  highlights: LabeledHighlight[];
  pageForm: PageFormData;
  templates: PageTemplates;
}

// ==================== COMPOSITE KEY PATTERN ====================

/**
 * Per-page field storage pattern
 * Field values are stored with composite keys: "pageNum:fieldId"
 */

// Example data:
const formData: PageFormData = {
  "1:study_id": "10.1161/STROKEAHA.116.014078",
  "1:first_author": "Kim",
  "1:year": "2016",
  "2:study_design": "Retrospective Case-Control",
  "3:total_patients": "112",
  "3:intervention_size": "28"
};

/**
 * Get value for specific field on specific page
 */
function getFieldValue(
  pageForm: PageFormData,
  pageNumber: number,
  fieldId: string
): string {
  return pageForm[`${pageNumber}:${fieldId}`] || '';
}

/**
 * Set value for specific field on specific page
 */
function setFieldValue(
  pageForm: PageFormData,
  pageNumber: number,
  fieldId: string,
  value: string
): PageFormData {
  return {
    ...pageForm,
    [`${pageNumber}:${fieldId}`]: value
  };
}

/**
 * Get all fields for a specific page
 */
function getPageFields(
  pageForm: PageFormData,
  pageNumber: number
): Record<string, string> {
  const prefix = `${pageNumber}:`;
  const pageFields: Record<string, string> = {};

  Object.keys(pageForm).forEach(key => {
    if (key.startsWith(prefix)) {
      const fieldId = key.slice(prefix.length);
      pageFields[fieldId] = pageForm[key];
    }
  });

  return pageFields;
}

// ==================== STORAGE LIMITS ====================

/**
 * Check approximate localStorage usage
 */
function getStorageUsage(): { used: number; limit: number } {
  let used = 0;

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Typical limit is 5-10MB, we'll estimate 5MB
  const limit = 5 * 1024 * 1024; // 5MB in bytes

  return { used, limit };
}

/**
 * Check if storage is approaching limit
 */
function isStorageNearLimit(): boolean {
  const { used, limit } = getStorageUsage();
  return used / limit > 0.9; // 90% full
}

// ==================== DEFAULT TEMPLATES ====================

const defaultTemplates: PageTemplates = {
  1: [
    { id: "study_id", label: "Study ID (DOI/PMID)", placeholder: "e.g., 10.1161/STROKEAHA.116.014078" },
    { id: "first_author", label: "First Author", placeholder: "e.g., Kim" },
    { id: "year", label: "Year of Publication", placeholder: "e.g., 2016" },
    { id: "country", label: "Country", placeholder: "e.g., Korea" }
  ],
  2: [
    { id: "research_question", label: "Research Question", placeholder: "Primary research question" },
    { id: "study_design", label: "Study Design", placeholder: "e.g., Retrospective-Matched Case-Control" }
  ],
  3: [
    { id: "total_patients", label: "Total Patients (N)", placeholder: "e.g., 112" },
    { id: "intervention_size", label: "Intervention Group Size", placeholder: "e.g., 28" }
  ]
};

// ==================== USAGE IN COMPONENT ====================

/*
import { useState, useEffect } from 'react';

function App() {
  const [currentProject, setCurrentProject] = useState(getCurrentProject());
  const [highlights, setHighlights] = useState<LabeledHighlight[]>([]);
  const [pageForm, setPageForm] = useState<PageFormData>({});
  const [templates, setTemplates] = useState<PageTemplates>(defaultTemplates);

  // Load project data on mount or when project changes
  useEffect(() => {
    const data = switchProject(currentProject);
    setHighlights(data.highlights);
    setPageForm(data.pageForm);
    setTemplates(data.templates);
  }, [currentProject]);

  // Save data when it changes
  useEffect(() => {
    saveHighlights(currentProject, highlights);
  }, [currentProject, highlights]);

  useEffect(() => {
    savePageForm(currentProject, pageForm);
  }, [currentProject, pageForm]);

  useEffect(() => {
    saveTemplates(currentProject, templates);
  }, [currentProject, templates]);

  return (
    // ... component JSX
  );
}
*/

// ==================== BEST PRACTICES ====================

/*
1. ✅ Always use namespaced keys
2. ✅ Handle JSON parse errors
3. ✅ Provide default values when loading
4. ✅ Wrap operations in try/catch
5. ✅ Check storage limits before saving large data
6. ✅ Use composite keys for related data
7. ✅ Batch updates when possible
8. ✅ Cleanup old project data on delete

❌ Don't save directly to root-level keys
❌ Don't assume localStorage is always available
❌ Don't save sensitive data (no encryption)
❌ Don't save binary data (use IndexedDB instead)
❌ Don't forget to delete data when removing projects
*/
