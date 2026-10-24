// 1. ELEMENT REFERENCES
// (For education) Grab the page elements once so the rest of the script can reuse them.
const navButtons = document.querySelectorAll('[data-view]');            // the five floating buttons
const views = document.querySelectorAll('.river-view');                 // the five river sections
const viewNames = Array.from(navButtons).map(b => b.dataset.view);      // ["beginning", "meme", "fact", "art", "culture"]

// 2. VIEW SWITCHING
// (For education) One function does everything needed to "float" to a river. Call showView('fact') and the whole page updates.
function showView(name, moveFocus) {

  // 2A. Fall back to the first river if the name is unknown
  // (For education) Protects against typos in the URL, like gambia.html#banana.
  if (!viewNames.includes(name)) name = 'beginning';

  // 2B. Show the chosen view, hide the rest
  // (For education) A view is shown when its id matches "view-" plus the name.
  views.forEach(v => { v.hidden = (v.id !== 'view-' + name); });

  // 2C. Swap the palette
  // (For education) Changing data-river makes the matching CSS palette take over, including the river band color.
  document.body.dataset.river = name;

  // 2D. Update the nav state
  // (For education) aria-current marks the active button for screen readers, and the CSS styles it as the active river.
  navButtons.forEach(b => {
    if (b.dataset.view === name) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });

  // 2E. Move focus to the new heading and scroll to top
  // (For education) Only when a person clicks. On first page load we skip it so no focus outline appears out of nowhere.
  if (moveFocus) {
    const heading = document.querySelector('#view-' + name + ' h1');
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }
}

// 3. NAV CLICKS
// (For education) Each button listens for a click, updates the URL hash (so the link is shareable), then switches view.
navButtons.forEach(b => {
  b.addEventListener('click', () => {
    history.replaceState(null, '', '#' + b.dataset.view);
    showView(b.dataset.view, true);
  });
});

// 4. INITIAL LOAD
// (For education) Supports direct links like gambia.html#fact. With no hash it opens The Beginning.
showView(location.hash.replace('#', ''), false);