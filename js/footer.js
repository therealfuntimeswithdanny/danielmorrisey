// footer.js
function initFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  footer.innerHTML = `
    <p>
      &copy; 2024-<span id="current-year"></span> Made by Danny UK,
      <i>by Daniel Morrisey</i> / <a><i class="fa-solid fa-magnifying-glass"></i></a> /
      <button id="theme-toggle">Switch to Light Mode</button>
    </p>
    <iframe src="https://status.madebydanny.uk/badge?theme=dark" width="200" height="24" frameborder="0" scrolling="no" style="color-scheme: normal"></iframe>
  `;

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", initFooter);
