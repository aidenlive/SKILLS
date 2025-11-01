# WCAG 2.1 Level AA Compliance Checklist

Complete checklist for ensuring WCAG 2.1 Level AA conformance.

## Perceivable

### 1.1 Text Alternatives

- [ ] **1.1.1 Non-text Content (A)** - All non-text content has text alternatives
  - Images have meaningful alt text
  - Decorative images have empty alt=""
  - Form inputs have associated labels
  - Icons have aria-label when standalone

### 1.2 Time-based Media

- [ ] **1.2.1 Audio-only and Video-only (A)** - Alternatives provided
- [ ] **1.2.2 Captions (A)** - Captions for all prerecorded audio
- [ ] **1.2.3 Audio Description or Media Alternative (A)** - Description of visual content
- [ ] **1.2.4 Captions (Live) (AA)** - Captions for live audio content
- [ ] **1.2.5 Audio Description (AA)** - Audio description for video

### 1.3 Adaptable

- [ ] **1.3.1 Info and Relationships (A)** - Semantic markup for all content
  - Proper heading hierarchy (h1 → h2 → h3)
  - Lists use ul/ol/dl
  - Tables have proper headers
  - Form labels associated with inputs

- [ ] **1.3.2 Meaningful Sequence (A)** - Content order makes sense
  - Tab order is logical
  - Reading order follows visual order
  - DOM order matches visual order

- [ ] **1.3.3 Sensory Characteristics (A)** - Not dependent on sensory characteristics
  - Don't rely solely on "click the round button"
  - Don't rely on color alone for meaning

- [ ] **1.3.4 Orientation (AA)** - No restriction on orientation

- [ ] **1.3.5 Identify Input Purpose (AA)** - Autocomplete attributes on inputs

### 1.4 Distinguishable

- [ ] **1.4.1 Use of Color (A)** - Color not the only visual means
  - Links distinguishable without color
  - Error states have icons or text
  - Charts have patterns or labels

- [ ] **1.4.2 Audio Control (A)** - Mechanism to pause/stop/control audio

- [ ] **1.4.3 Contrast (Minimum) (AA)** - 4.5:1 for normal text, 3:1 for large text
  - Check all text against backgrounds
  - Check interactive elements (buttons, inputs)
  - Use contrast checker tool

- [ ] **1.4.4 Resize Text (AA)** - Text can be resized up to 200% without loss
  - Test at 200% zoom
  - No horizontal scrolling
  - No content cutoff

- [ ] **1.4.5 Images of Text (AA)** - Use actual text instead of images

- [ ] **1.4.10 Reflow (AA)** - No 2D scrolling at 320px width

- [ ] **1.4.11 Non-text Contrast (AA)** - 3:1 for UI components and graphics

- [ ] **1.4.12 Text Spacing (AA)** - No loss of content when adjusting spacing

- [ ] **1.4.13 Content on Hover or Focus (AA)** - Dismissible, hoverable, persistent

## Operable

### 2.1 Keyboard Accessible

- [ ] **2.1.1 Keyboard (A)** - All functionality available via keyboard
  - Tab through entire page
  - All interactive elements reachable
  - No keyboard traps
  - Custom controls have keyboard support

- [ ] **2.1.2 No Keyboard Trap (A)** - Can navigate away from all components

- [ ] **2.1.4 Character Key Shortcuts (A)** - Can be turned off or remapped

### 2.2 Enough Time

- [ ] **2.2.1 Timing Adjustable (A)** - Can extend/disable time limits

- [ ] **2.2.2 Pause, Stop, Hide (A)** - Can pause auto-updating content

### 2.3 Seizures

- [ ] **2.3.1 Three Flashes or Below (A)** - No content flashes > 3 times per second

### 2.4 Navigable

- [ ] **2.4.1 Bypass Blocks (A)** - Skip links to main content
  - Skip to main content link
  - Skip to navigation link
  - ARIA landmarks present

- [ ] **2.4.2 Page Titled (A)** - Unique, descriptive page titles

- [ ] **2.4.3 Focus Order (A)** - Focus order is logical
  - Tab order matches visual order
  - No unexpected focus jumps

- [ ] **2.4.4 Link Purpose (A)** - Link text describes destination
  - No "click here" links
  - Links are descriptive
  - aria-label for icon-only links

- [ ] **2.4.5 Multiple Ways (AA)** - More than one way to find pages
  - Site map
  - Search
  - Navigation menu

- [ ] **2.4.6 Headings and Labels (AA)** - Descriptive headings and labels

- [ ] **2.4.7 Focus Visible (AA)** - Keyboard focus indicator visible
  - Focus outline always visible
  - Custom focus styles have 3:1 contrast

### 2.5 Input Modalities

- [ ] **2.5.1 Pointer Gestures (A)** - Alternative for multipoint/path gestures

- [ ] **2.5.2 Pointer Cancellation (A)** - Can abort pointer actions

- [ ] **2.5.3 Label in Name (A)** - Visible label matches accessible name

- [ ] **2.5.4 Motion Actuation (A)** - Can disable motion-triggered functionality

## Understandable

### 3.1 Readable

- [ ] **3.1.1 Language of Page (A)** - lang attribute on html element

- [ ] **3.1.2 Language of Parts (AA)** - lang attribute on foreign language content

### 3.2 Predictable

- [ ] **3.2.1 On Focus (A)** - Focus doesn't cause unexpected changes

- [ ] **3.2.2 On Input (A)** - Changing settings doesn't cause unexpected changes

- [ ] **3.2.3 Consistent Navigation (AA)** - Navigation consistent across pages

- [ ] **3.2.4 Consistent Identification (AA)** - Same functionality labeled consistently

### 3.3 Input Assistance

- [ ] **3.3.1 Error Identification (A)** - Errors identified in text
  - Form validation messages clear
  - Error messages explain what's wrong
  - Errors associated with fields (aria-describedby)

- [ ] **3.3.2 Labels or Instructions (A)** - Labels/instructions provided
  - All inputs have labels
  - Required fields marked
  - Format expectations explained

- [ ] **3.3.3 Error Suggestion (AA)** - Suggestions provided for errors

- [ ] **3.3.4 Error Prevention (AA)** - Can review/correct before submission
  - Confirmation pages
  - Edit buttons
  - Undo functionality

## Robust

### 4.1 Compatible

- [ ] **4.1.1 Parsing (A)** - Valid HTML (deprecated in WCAG 2.2)
  - No duplicate IDs
  - Properly nested elements
  - Valid ARIA

- [ ] **4.1.2 Name, Role, Value (A)** - All UI components have accessible names
  - Custom controls have roles
  - States communicated (aria-expanded, etc.)
  - Values exposed to assistive tech

- [ ] **4.1.3 Status Messages (AA)** - Status messages programmatically available
  - Use role="status" for updates
  - Use role="alert" for errors
  - Use aria-live regions

## Testing Checklist

### Automated Testing

- [ ] Run axe DevTools
- [ ] Run Lighthouse accessibility audit
- [ ] Run WAVE browser extension
- [ ] Run Pa11y CI in build pipeline

### Manual Testing

- [ ] **Keyboard Navigation**
  - Tab through entire page
  - Test all interactive elements
  - Check focus indicators
  - Ensure no keyboard traps

- [ ] **Screen Reader Testing**
  - Test with NVDA (Windows)
  - Test with JAWS (Windows)
  - Test with VoiceOver (Mac)
  - Test on mobile (iOS/Android)

- [ ] **Visual Testing**
  - Test at 200% zoom
  - Test at 400% zoom
  - Test in high contrast mode
  - Check color contrast ratios

- [ ] **Form Testing**
  - Submit with errors
  - Check error messages
  - Verify labels and instructions
  - Test autocomplete

### Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Android Chrome)

## Common Issues

### High Priority Fixes

1. **Missing alt text on images**
   - Add descriptive alt text
   - Use alt="" for decorative images

2. **Low color contrast**
   - Ensure 4.5:1 for normal text
   - Ensure 3:1 for large text and UI components

3. **Missing form labels**
   - Associate labels with inputs
   - Add aria-label for icon buttons

4. **Poor keyboard navigation**
   - Make all interactive elements focusable
   - Add visible focus indicators
   - Ensure logical tab order

5. **Missing ARIA attributes**
   - Add aria-expanded to disclosure widgets
   - Add aria-selected to tabs
   - Add aria-current to current page link

### Quick Wins

- Add skip links
- Fix heading hierarchy
- Add lang attribute to html
- Use semantic HTML
- Add focus indicators

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Contrast Checker](/design-system/oklch-tokens/resources/contrast-calculator.html)
