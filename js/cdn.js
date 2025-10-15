// Update footer year
document.getElementById("current-year").textContent = new Date().getFullYear();

// Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const useImrsCheckbox = document.getElementById('useImrs');
const useOfficeCheckbox = document.getElementById('useOfficeViewer');
const locationButtons = document.querySelectorAll('.loc-btn');

let selectedRegion = "";

// Handle location button clicks
locationButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    locationButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRegion = btn.dataset.region;
  });
});

// Drag & drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    updateDropZoneText();
    updateCheckboxVisibility();
  }
});
fileInput.addEventListener('change', () => {
  updateDropZoneText();
  updateCheckboxVisibility();
});

function updateDropZoneText() {
  if (fileInput.files.length) {
    dropZone.querySelector('p').innerHTML = `✅ Selected: ${fileInput.files[0].name}`;
  } else {
    dropZone.querySelector('p').innerHTML = `<i class="fa-solid fa-upload"></i> Drag & drop your file here, or click to select`;
  }
}

// Show or hide IMRS and Office checkboxes depending on file type
function updateCheckboxVisibility() {
  if (!fileInput.files.length) {
    useImrsCheckbox.parentElement.style.display = "none";
    useOfficeCheckbox.parentElement.style.display = "none";
    useImrsCheckbox.checked = true;  // default
    useOfficeCheckbox.checked = false;
    return;
  }

  const file = fileInput.files[0];
  const fileExt = file.name.split('.').pop().toLowerCase();

  // IMRS only for images
  if (file.type.startsWith('image/')) {
    useImrsCheckbox.parentElement.style.display = "block";
  } else {
    useImrsCheckbox.parentElement.style.display = "none";
    useImrsCheckbox.checked = true; // keep default
  }

  // Office Viewer only for Office files
  const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  if (officeExtensions.includes(fileExt)) {
    useOfficeCheckbox.parentElement.style.display = "block";
  } else {
    useOfficeCheckbox.parentElement.style.display = "none";
    useOfficeCheckbox.checked = false;
  }
}

// Upload handler
uploadBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    resultDiv.textContent = "Please select a file first.";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  if (selectedRegion) formData.append('region', selectedRegion);

  resultDiv.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Uploading...';

  try {
    const response = await fetch('https://cdn-upload.madebydanny.uk/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Upload failed');

    let finalUrl = data.url;

    // Image optimization via IMRS
    if (useImrsCheckbox.checked && file.type.startsWith('image/') && !file.name.endsWith('.avif')) {
      finalUrl = `https://imrs.madebydanny.uk?url=${encodeURIComponent(finalUrl)}`;
    }

    // Microsoft Office viewer (optional)
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (useOfficeCheckbox.checked && officeExtensions.includes(fileExt)) {
      finalUrl = `https://madebydanny.uk/src/cdn/office?url=${encodeURIComponent(finalUrl)}`;
    }

    await navigator.clipboard.writeText(finalUrl);
    resultDiv.innerHTML = `✅ Uploaded! URL copied:<br><a href="${finalUrl}" target="_blank">${finalUrl}</a>`;
  } catch (err) {
    resultDiv.textContent = "Error: " + err.message;
  }
});

// Initialize checkboxes visibility on page load
updateCheckboxVisibility();
