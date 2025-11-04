# Page Display Mode Issue Analysis

## Problem Description

The user reports two issues:
1. **Inaccurate page numbering**: The page indicator doesn't match what's actually visible
2. **Not showing the whole PDF**: The PDF viewer is displaying pages in a two-page spread layout

## Current Behavior

- The PDF is being displayed in a **two-page spread** (side-by-side) layout
- The page indicator shows "8 / 8" but we're actually viewing pages 7-8 together
- When navigating, the page number updates but it's unclear which pages are actually visible

## Expected Behavior (from Documentation)

Looking at the Lector documentation examples:
- The basic example shows **single-page view** - one page at a time
- The page navigation example also shows single-page view
- Page indicator accurately reflects the visible page

## Root Cause Analysis

The Lector library's `Pages` component has different display modes:
1. **Single page mode**: Shows one page at a time (default in examples)
2. **Spread mode**: Shows two pages side-by-side (what we're currently seeing)

The issue is that our implementation is somehow triggering spread mode, but:
- The Lector documentation doesn't explicitly mention how to control this
- The basic example code doesn't show any props for controlling page layout
- The GitHub repository README shows the same basic example without spread mode configuration

## Investigation Findings

### From Lector Documentation

```tsx
// Basic example from docs - shows single page
<Root source="/sample.pdf" className="w-full h-[500px]">
  <Pages className="p-4">
    <Page>
      <CanvasLayer />
      <TextLayer />
    </Page>
  </Pages>
</Root>
```

### Our Implementation

```tsx
// Our implementation - also looks correct
<Root source={...} className="..." loader={...}>
  <Pages className="p-6 dark:invert-[94%] ...">
    <Page>
      <CanvasLayer />
      <TextLayer />
      <AnnotationLayer />
      <CustomLayer>...</CustomLayer>
    </Page>
  </Pages>
  <PageNavigationButtons onPageChange={onPageChange} />
</Root>
```

## Possible Causes

1. **CSS/Layout Issue**: The container width might be triggering spread mode
   - Our PDF viewer container is `flex-1` which makes it take full width
   - Wide containers might automatically trigger two-page layout

2. **PDF.js Internal Behavior**: PDF.js might have automatic spread mode based on viewport size
   - When the viewport is wide enough, it shows two pages
   - This is common in PDF viewers (Adobe Reader does this)

3. **Missing Configuration**: There might be a prop or configuration we're missing
   - The Lector library might have a `spreadMode` or `pageLayout` prop
   - This might not be documented in the public API

4. **Zoom Level Impact**: The zoom level might affect page layout
   - At certain zoom levels, PDF.js might switch to spread mode

## Potential Solutions

### Option 1: Control Container Width
Limit the PDF viewer container width to force single-page mode:

```tsx
<div className="overflow-y-auto max-w-[800px] mx-auto">
  <PDFViewerContent ... />
</div>
```

### Option 2: Check PDF.js Configuration
Look for PDF.js spread mode configuration in the Root component:

```tsx
<Root
  source={...}
  spreadMode={0}  // 0 = no spread, 1 = odd spread, 2 = even spread
  // or
  pageLayout="single"
/>
```

### Option 3: Investigate Lector Source Code
- Check the Lector library source code for spread mode configuration
- Look at how `Pages` component handles layout
- Check if there's an undocumented prop

### Option 4: Use CSS to Force Single Column
Force the Pages component to display in a single column:

```tsx
<Pages className="p-6 grid grid-cols-1">
  <Page>...</Page>
</Pages>
```

### Option 5: Check PDF.js Viewer CSS
The `pdfjs-dist/web/pdf_viewer.css` might have styles that control spread mode. We might need to override these styles.

## Next Steps

1. ✅ Check Lector TypeScript types for Root and Pages props
2. ✅ Inspect the rendered DOM to see how pages are being laid out
3. ✅ Check if there's a CSS class controlling the spread mode
4. ✅ Look at PDF.js documentation for spread mode configuration
5. ✅ Test with a narrower container width

## Additional Notes

- The page navigation IS working now (pages change when clicking buttons)
- The issue is purely about page layout and numbering accuracy
- The user expects single-page view like in the documentation examples
