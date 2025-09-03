/* ------------------------------------------------------------------ *
 * Footer injection
 * ------------------------------------------------------------------ */
export function initFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  // Inject footer HTML
  footer.innerHTML = `
    <p>
      &copy; 2024-<span id="current-year"></span> Made by Danny UK,
      <i>by Daniel Morrisey</i> / <a><i class="fa-solid fa-magnifying-glass"></i></a>
      <button id="theme-toggle">Switch to Light Mode</button>
    </p>
  `;

  // Set current year
  document.getElementById('current-year').textContent = new Date().getFullYear();
}
