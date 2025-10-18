const API_URL = "https://altlyapi.madebydanny.uk/api";
const STATS_URL = "https://altlyapi.madebydanny.uk/stats";
const CDN_PATH = "https://public-cdn.madebydanny.uk/alt-text";

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const result = document.getElementById('result');
document.getElementById('year').textContent = new Date().getFullYear();

// Stats auto-refresh
async function updateStats() {
  try {
    const res = await fetch(STATS_URL);
    const data = await res.json();
    if (data.success) {
      document.getElementById('imgCount').textContent = data.images.toLocaleString();
      document.getElementById('userCount').textContent = data.users.toLocaleString();
      document.getElementById('avgTime').textContent = data.avgTime.toLocaleString();
    }
  } catch (err) {
    console.warn("Stats unavailable:", err);
  }
}
updateStats();
setInterval(updateStats, 10000);

// Dropzone logic
dropZone.onclick = () => fileInput.click();
dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  fileInput.files = e.dataTransfer.files;
};

// Upload logic
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select an image first.");
  const form = new FormData();
  form.append("file", file);
  result.innerHTML = "⏳ Uploading & generating alt text...";

  try {
    const res = await fetch(API_URL, { method: "POST", body: form });
    const data = await res.json();

    if (data.success) {
      result.innerHTML = `
        <img src="${data.url}" alt="${data.alt}">
        <p><strong>Alt Text:</strong> "${data.alt}"</p>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${data.alt}')">
          <i class="fa-solid fa-copy"></i> Copy Alt Text
        </button>
      `;
      updateStats();
    } else {
      result.innerHTML = "⚠️ " + (data.error || "Unknown error occurred.");
    }
  } catch (err) {
    result.innerHTML = "❌ Network error: " + err.message;
  }
};
