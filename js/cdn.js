// Update current year in footer
document.getElementById("current-year").textContent = new Date().getFullYear();

// DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const useImrsCheckbox = document.getElementById('useImrs');

// --- Drag & Drop functionality ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    updateDropZoneText();
  }
});

// Update drop zone text when file is selected
fileInput.addEventListener('change', updateDropZoneText);

function updateDropZoneText() {
  if (fileInput.files.length) {
    dropZone.querySelector('p').innerHTML = `✅ Selected: ${fileInput.files[0].name}`;
  } else {
    dropZone.querySelector('p').innerHTML = `<i class="fa-solid fa-upload"></i> Drag & drop your file here, or click to select`;
  }
}

// --- Upload function ---
async function uploadFile() {
  if (!fileInput.files.length) {
    resultDiv.textContent = "Please select a file first.";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  resultDiv.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Uploading...';

  try {
    const response = await fetch('https://cdn-upload.madebydanny.uk/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Upload failed');

    // Construct final URL
    let finalUrl = data.url;

    // Apply IMRS if checked and file is an image (avoid .avif)
    if (useImrsCheckbox.checked && file.type.startsWith('image/') && !file.name.endsWith('.avif')) {
      finalUrl = `https://imrs.madebydanny.uk?url=${encodeURIComponent(finalUrl)}`;
    }

    // Copy URL to clipboard
    await navigator.clipboard.writeText(finalUrl);

    resultDiv.innerHTML = `✅ Uploaded! URL copied:<br><a href="${finalUrl}" target="_blank">${finalUrl}</a>`;
  } catch (err) {
    resultDiv.textContent = "Error: " + err.message;
  }
}

// Attach upload function to button
uploadBtn.addEventListener('click', uploadFile);
