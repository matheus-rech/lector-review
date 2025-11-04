# Bugs Found During UI Testing

## Test Session: November 4, 2025

---

## Critical Bugs

### Bug #1: Page Navigation Not Working
**Severity:** HIGH  
**Status:** Identified

**Description:**
Page navigation controls update the page number indicator but do not actually change the displayed PDF content.

**Steps to Reproduce:**
1. Load application with PDF (Kim2016.pdf)
2. Click "Next Page" button (▶)
3. Observe page indicator changes from 1 to 2
4. PDF content remains showing page 1

**Expected Behavior:**
PDF viewer should scroll/jump to the selected page and display that page's content.

**Actual Behavior:**
- Page indicator updates correctly
- PDF content does not change
- Still showing first page content

**Affected Components:**
- Next/Previous page buttons
- First/Last page buttons
- Direct page number input
- Thumbnail navigation

**Evidence:**
- Page indicator shows "3" but PDF content is still from page 1
- User confirmed: "It seems that it continues showing page 1 inspite of reporting page 3"

---

### Bug #2: Search Results Not Highlighted
**Severity:** HIGH  
**Status:** Identified

**Description:**
Search functionality does not visually highlight matching text in the PDF viewer.

**Steps to Reproduce:**
1. Enter search term "cerebellar" in search box
2. Search executes (text appears in search field)
3. No visual highlights appear in PDF

**Expected Behavior:**
- Matching text should be highlighted in yellow
- Search result count should be displayed
- Previous/Next buttons should navigate between results

**Actual Behavior:**
- Search term is entered
- No visual highlights appear
- No search result count displayed
- Text content shows multiple instances of "cerebellar" in references section but not highlighted

**Affected Components:**
- Search input field
- Search highlighting overlay
- Search result navigation

**Evidence:**
- User confirmed: "I am not seeing the highlights you mentioned"
- Multiple instances of "cerebellar" exist in PDF but no yellow highlights visible

---

### Bug #3: Thumbnail Navigation Not Working
**Severity:** MEDIUM  
**Status:** Identified

**Description:**
Clicking on thumbnail images does not navigate to the corresponding page.

**Steps to Reproduce:**
1. Thumbnails panel is visible (left side)
2. Click on second thumbnail (page 2)
3. PDF content does not change

**Expected Behavior:**
Clicking a thumbnail should navigate to that page in the main viewer.

**Actual Behavior:**
- Thumbnail is clickable
- No navigation occurs
- PDF remains on current page

**Affected Components:**
- Thumbnail click handlers
- Page navigation integration

**Evidence:**
- User confirmed: "it seems to me that thumbnails didn't navigate the reader to the second page too"

---

## Medium Priority Issues

### Issue #1: Thumbnail Toggle Button Disappeared
**Severity:** MEDIUM  
**Status:** Observed

**Description:**
After clicking "Hide Thumbnails" button, the button itself disappeared from the UI.

**Steps to Reproduce:**
1. Click "◀ Hide Thumbnails" button
2. Thumbnails panel hides (correct behavior)
3. Button is no longer visible to show thumbnails again

**Expected Behavior:**
Button should change to "▶ Show Thumbnails" and remain visible.

**Actual Behavior:**
Button disappeared entirely after hiding thumbnails.

**Impact:**
User cannot toggle thumbnails back on without refreshing.

---

## Working Features (Verified)

### ✅ Zoom Controls
- Zoom In button: Working
- Zoom Out button: Working
- Zoom level display: Accurate (shows 110%, 100%, etc.)
- PDF content scales correctly

### ✅ Form Input Fields
- Study ID field: Accepts input, displays correctly
- First Author field: Accepts input, displays correctly
- Year field: Accepts input, displays correctly
- Country field: Present in UI

### ✅ Form Switching
- Template Form button: Working
- Schema Form button: Working
- Forms switch correctly between simple and detailed modes
- Schema form shows expandable sections

### ✅ PDF Loading
- PDF loads successfully
- Canvas rendering works
- Text layer present (text is selectable)
- Multiple pages visible in thumbnails

### ✅ Project Management UI
- Project dropdown visible
- Add project button (+) present
- Delete project button (🗑) present

### ✅ Export Buttons
- Export JSON button: Present
- Export CSV button: Present
- (Functionality not yet tested)

---

## Root Cause Analysis

### Page Navigation Issue

**Hypothesis:**
The page navigation state is updating in React state but not triggering the PDF viewer to scroll or jump to the new page.

**Possible Causes:**
1. Missing `usePdfJump()` hook implementation
2. Page state not properly connected to PDF viewer scroll position
3. Virtualization not responding to page changes
4. Missing `onPageChange` handler

**Code to Investigate:**
- `usePdfJump()` hook usage
- Page state management
- Scroll behavior in Pages component
- Thumbnail click handlers

---

### Search Highlighting Issue

**Hypothesis:**
Search is finding results but not rendering highlight overlays in the CustomLayer.

**Possible Causes:**
1. `calculateHighlightRects()` not being called
2. Search results not being converted to highlight rectangles
3. CustomLayer not rendering search highlights
4. CSS styling issue (highlights rendered but invisible)

**Code to Investigate:**
- `useSearch()` hook implementation
- Search result processing
- CustomLayer rendering logic
- Highlight rectangle calculation

---

### Thumbnail Navigation Issue

**Hypothesis:**
Thumbnail click events not properly connected to page navigation.

**Possible Causes:**
1. Missing `onClick` handler on Thumbnail components
2. Click handler not calling page jump function
3. Event propagation issue

**Code to Investigate:**
- Thumbnail component implementation
- Click event handlers
- Integration with page navigation

---

## Next Steps

1. **Examine App.tsx code** to understand current implementation
2. **Review Lector documentation** for correct page navigation patterns
3. **Fix page navigation** to properly scroll/jump to selected pages
4. **Fix search highlighting** to display yellow overlays
5. **Fix thumbnail navigation** to enable click-to-navigate
6. **Fix thumbnail toggle button** to remain visible
7. **Re-test all features** after fixes
8. **Document all changes** made

---

## Testing Environment

- **Browser:** Chromium (stable)
- **Application:** Lector Review v1.0
- **PDF:** Kim2016.pdf (8 pages)
- **Lector Version:** @anaralabs/lector v3.7.2
- **Current Page:** Page 8 (last page of references)
- **Zoom Level:** 100%
- **Thumbnails:** Hidden

---

## User Feedback

> "It seems that it continues showing page 1 inspite of reporting page 3"

> "it seems to me that thumbnails didn't navigate the reader to the second page too"

> "I am not seeing the highlights you mentioned please Took screenshots to share"

---

## Priority Order for Fixes

1. **HIGH:** Fix page navigation (Bug #1) - Critical for usability
2. **HIGH:** Fix search highlighting (Bug #2) - Core feature
3. **MEDIUM:** Fix thumbnail navigation (Bug #3) - Important for UX
4. **MEDIUM:** Fix thumbnail toggle button (Issue #1) - UI polish

