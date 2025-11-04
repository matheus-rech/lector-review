# Comprehensive UI Testing Log

## Test Session Information
- **Date:** November 4, 2025
- **Application:** Lector Review - Systematic Review Tool
- **Test Type:** Comprehensive UI/UX Testing
- **Tester:** Automated Testing System
- **Browser:** Chromium (stable)

---

## Testing Methodology

Each UI element will be tested in the following order:
1. **Left Sidebar** - Project management and PDF controls
2. **Main PDF Viewer** - Zoom, thumbnails, and navigation
3. **Right Sidebar** - Page navigation and form controls
4. **Interactive PDF Features** - Text selection, search, highlights

---

## Test Results

### Section 1: Left Sidebar - Project Management

#### Test 1.1: Project Selector Dropdown
- **Element:** Project dropdown (index 2)
- **Current Value:** "default"
- **Action:** Click to view options
- **Status:** Pending test

#### Test 1.2: Add Project Button (+)
- **Element:** Add project button (index 3)
- **Action:** Click to create new project
- **Expected:** Modal dialog for project name input
- **Status:** Pending test

#### Test 1.3: Delete Project Button (🗑)
- **Element:** Delete project button (index 4)
- **Action:** Click to delete current project
- **Expected:** Confirmation dialog (cannot delete default)
- **Status:** Pending test

---

### Section 2: Left Sidebar - PDF Management

#### Test 2.1: PDF File Upload
- **Element:** File input (index 6)
- **Action:** Upload a PDF file
- **Expected:** PDF loads and displays in viewer
- **Status:** Pending test

#### Test 2.2: PDF URL Input
- **Element:** URL input field (index 8)
- **Action:** Enter PDF URL and load
- **Expected:** PDF loads from URL
- **Status:** Pending test

#### Test 2.3: PDF List Display
- **Element:** PDF list showing "/Kim2016.pdf"
- **Action:** Click to switch between PDFs
- **Expected:** PDF changes in viewer
- **Status:** Visible and ready for test

---

### Section 3: Left Sidebar - Search

#### Test 3.1: Search Input Field
- **Element:** Search input (index 10)
- **Action:** Type search term
- **Expected:** Real-time search with highlighting
- **Status:** Pending test

---

### Section 4: Left Sidebar - Export Functions

#### Test 4.1: Export JSON Button
- **Element:** Export JSON button (index 11)
- **Action:** Click to export data
- **Expected:** JSON file download with project data
- **Status:** Pending test

#### Test 4.2: Export CSV Button
- **Element:** Export CSV button (index 12)
- **Action:** Click to export data
- **Expected:** CSV file download with structured data
- **Status:** Pending test

---

### Section 5: Main Viewer - Thumbnail Controls

#### Test 5.1: Toggle Thumbnails Button
- **Element:** "◀ Hide Thumbnails" button (index 13)
- **Current State:** Thumbnails visible
- **Action:** Click to hide thumbnails
- **Expected:** Thumbnails panel collapses, button text changes to "▶ Show Thumbnails"
- **Status:** Pending test

---

### Section 6: Main Viewer - Zoom Controls

#### Test 6.1: Zoom Out Button
- **Element:** Zoom out button (index 14)
- **Action:** Click to decrease zoom
- **Expected:** PDF zooms out (minimum 50%)
- **Status:** Pending test

#### Test 6.2: Zoom Level Display
- **Element:** Zoom level input (index 15)
- **Current Value:** "1.00" (100%)
- **Action:** View current zoom level
- **Expected:** Displays current zoom percentage
- **Status:** Visible

#### Test 6.3: Zoom In Button
- **Element:** Zoom in button (index 16)
- **Action:** Click to increase zoom
- **Expected:** PDF zooms in (maximum 300%)
- **Status:** Pending test

---

### Section 7: Main Viewer - PDF Display

#### Test 7.1: PDF Canvas Rendering
- **Element:** Canvas elements (index 17, 18)
- **Status:** ✅ PASS - PDF rendering correctly
- **Observation:** Multiple pages visible in thumbnail view

#### Test 7.2: Text Selection
- **Element:** PDF text layer
- **Action:** Select text in PDF
- **Expected:** SelectionTooltip appears with highlight button
- **Status:** Pending test

---

### Section 8: Right Sidebar - Page Navigation

#### Test 8.1: Previous Page Button (◀)
- **Element:** Previous page button (index 20)
- **Current Page:** 1
- **Action:** Click to go to previous page
- **Expected:** Button disabled (already on page 1)
- **Status:** Pending test

#### Test 8.2: Page Number Input
- **Element:** Page input field (index 21)
- **Current Value:** 1
- **Action:** Type page number and press Enter
- **Expected:** Navigate to specified page
- **Status:** Pending test

#### Test 8.3: Next Page Button (▶)
- **Element:** Next page button (index 22)
- **Action:** Click to go to next page
- **Expected:** Navigate to page 2
- **Status:** Pending test

#### Test 8.4: First Page Button
- **Element:** First page button (index 23)
- **Action:** Click to jump to first page
- **Expected:** Navigate to page 1
- **Status:** Pending test

#### Test 8.5: Last Page Button
- **Element:** Last page button (index 24)
- **Action:** Click to jump to last page
- **Expected:** Navigate to page 8 (last page)
- **Status:** Pending test

---

### Section 9: Right Sidebar - Form Controls

#### Test 9.1: Template Form Button
- **Element:** Template Form button (index 25)
- **Current State:** Active (blue background)
- **Action:** Click to activate template form
- **Expected:** Template form fields display
- **Status:** ✅ Currently active

#### Test 9.2: Schema Form Button
- **Element:** Schema Form button (index 26)
- **Action:** Click to switch to schema form
- **Expected:** Schema form fields display
- **Status:** Pending test

#### Test 9.3: Manage Templates Button
- **Element:** Manage Templates button (index 27)
- **Action:** Click to open template manager
- **Expected:** Template management modal opens
- **Status:** Pending test

---

### Section 10: Right Sidebar - Template Form Fields

#### Test 10.1: Study ID Field
- **Element:** Study ID input (index 29)
- **Label:** "Study ID (DOI/PMID)"
- **Placeholder:** "e.g., 10.1161/STROKEAHA.116.014078"
- **Action:** Enter study ID
- **Expected:** Value saved to project data
- **Status:** Pending test

#### Test 10.2: First Author Field
- **Element:** First Author input (index 31)
- **Label:** "First Author"
- **Placeholder:** "e.g., Kim"
- **Action:** Enter author name
- **Expected:** Value saved to project data
- **Status:** Pending test

#### Test 10.3: Year of Publication Field
- **Element:** Year input (index 33)
- **Label:** "Year of Publication"
- **Placeholder:** "e.g., 2016"
- **Action:** Enter year
- **Expected:** Value saved to project data
- **Status:** Pending test

#### Test 10.4: Country Field
- **Element:** Country input (index 35)
- **Label:** "Country"
- **Placeholder:** "e.g., Korea"
- **Action:** Enter country
- **Expected:** Value saved to project data
- **Status:** Pending test

---

## Test Execution Plan

The tests will be executed in the following sequence:

1. **Page Navigation Tests** (Section 8)
2. **Zoom Controls Tests** (Section 6)
3. **Thumbnail Toggle Test** (Section 5)
4. **Form Input Tests** (Section 10)
5. **Form Switching Tests** (Section 9)
6. **Search Functionality Test** (Section 3)
7. **Text Selection and Highlighting** (Section 7.2)
8. **Export Functions** (Section 4)
9. **Project Management** (Section 1)
10. **PDF Management** (Section 2)

---

## Notes

- All tests will be performed on the currently loaded PDF: Kim2016.pdf
- Current page: 1 of 8
- Current zoom: 100%
- Thumbnails: Visible
- Active form: Template Form
- Project: default

---

## Test Execution Begins Below

