/* ------------------------------------------------------------------ *
 * Theme Toggle and State Management
 * ------------------------------------------------------------------ */

// Reference to the HTML body element
const body = document.body;

// Helper function to update the button text based on the theme
function updateButtonText(isDarkMode) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDarkMode
      ? 'Switch to Light Mode'
      : 'Switch to Dark Mode';
  }
}

// Function to apply a theme and save it to localStorage
function applyTheme(theme) {
  const isDarkMode = theme === 'dark';
  body.classList.remove('light-mode', 'dark-mode');
  body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
  localStorage.setItem('theme', theme);
  updateButtonText(isDarkMode);
}

// Function to toggle the theme
function toggleTheme() {
  const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

// Initial theme setup on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  // Add event listener to the toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// Run the initialization function when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeTheme);