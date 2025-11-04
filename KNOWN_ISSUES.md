# Known Issues with Lector Library

## Critical: Page Navigation Broken with Zoom

**Status:** Known bug in @anaralabs/lector library (not our implementation)

### Description

The `usePdfJump()` hook's `jumpToPage()` function does not work correctly when zoom is applied. This is a confirmed bug in the Lector library itself.

### GitHub Issues

- [Issue #21: Page Navigation is not working properly when zoom level is scaled out](https://github.com/anaralabs/lector/issues/21)
- [Issue #40: IMP:Jump to page doesnt work correctly with isZoomFitWidth](https://github.com/anaralabs/lector/issues/40)

### Symptoms

1. Clicking Next/Previous page buttons updates the page indicator but doesn't scroll the PDF
2. Entering a page number directly doesn't navigate to that page
3. Clicking thumbnails doesn't jump to the selected page
4. The issue occurs at any zoom level (100%, 110%, etc.)

### Root Cause

According to the Lector maintainer (andrewdoro):
> "yeah sometimes is broken because of the zoom"
> "the cause of this is related to the visualizer and offset"

The `jumpToPage` function calculates scroll positions incorrectly when zoom is applied, causing it to jump to the wrong offset or not jump at all.

### Current Status

- **No fix available** as of February 2025
- Maintainer acknowledges the issue but hasn't implemented a fix yet
- Suggested workaround: "clone the repo and maybe tweak values there"

### Impact on Our Application

- **HIGH PRIORITY**: Users cannot navigate between pages using any of the navigation controls
- All page navigation features are non-functional:
  - Next/Previous buttons
  - First/Last buttons
  - Direct page input
  - Thumbnail navigation
  - Jump to highlight

### Potential Workarounds

#### Option 1: Disable Zoom (Not Recommended)
- Remove zoom controls entirely
- Set zoom to 100% and lock it
- **Downside**: Loses important accessibility feature

#### Option 2: Manual Scroll Calculation (Complex)
- Calculate scroll position manually based on:
  - Page dimensions
  - Current zoom level
  - Page padding/margins
- Use `scrollTo()` instead of `jumpToPage()`
- **Downside**: Fragile, may break with library updates

#### Option 3: Use Alternative Navigation
- Implement scroll-based navigation
- Use IntersectionObserver to detect current page
- **Downside**: Different UX than expected

#### Option 4: Fork Lector and Fix (Most Reliable)
- Clone the Lector repository
- Fix the offset calculation in the jump logic
- Maintain our own fork until upstream fix
- **Downside**: Maintenance burden

#### Option 5: Wait for Upstream Fix (Current Choice)
- Document the limitation
- Inform users that page navigation is temporarily unavailable
- Monitor the GitHub issues for updates
- **Downside**: Feature is broken

### Recommended Action

For now, we should:

1. **Document the limitation** in the README and user documentation
2. **Add a prominent notice** in the UI that page navigation is temporarily unavailable
3. **Keep zoom controls** as they still work for viewing
4. **Enable scrolling** so users can manually scroll through pages
5. **Monitor the GitHub issues** and update when a fix is available

### Alternative: Implement Manual Scroll Workaround

If page navigation is critical, we can implement a manual scroll calculation:

```typescript
const jumpToPageManual = (pageNumber: number) => {
  const pagesContainer = document.querySelector('[data-lector-pages]');
  if (!pagesContainer) return;
  
  // Get page dimensions
  const pageElements = pagesContainer.querySelectorAll('[data-page-number]');
  const targetPage = Array.from(pageElements).find(
    el => el.getAttribute('data-page-number') === String(pageNumber)
  );
  
  if (targetPage) {
    targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
```

This would bypass the broken `jumpToPage()` function and use native browser scrolling instead.

### Testing Notes

- Tested with Lector v3.7.2
- Issue reproduces at 100%, 110%, and all zoom levels
- Issue occurs in both development and production builds
- Browser: Chromium (stable)

### Updates

- **2025-11-04**: Issue identified and documented
- **2025-02-07**: Lector maintainer acknowledged bug, no fix timeline provided

