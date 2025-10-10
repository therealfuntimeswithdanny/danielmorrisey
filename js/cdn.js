document.getElementById("current-year").textContent = new Date().getFullYear();

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const useImrsCheckbox = document.getElementById('useImrs');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    updateDropZoneText();
  }
});

fileInput.addEventListener('change', updateDropZoneText);

function updateDropZoneText() {
  if (fileInput.files.length > 0) {
    dropZone.querySelector('p').textContent = `✅ File selected: ${fileInput.files[0].name}`;
  }
}

async function uploadFile() {
  if (!fileInput.files.length) {
    resultDiv.textContent = "Please select a file first.";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  resultDiv.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Uploading...';

  try {
    const response = await fetch("https://cdn-upload.madebydanny.uk/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed. Status: " + response.status);

    const data = await response.json();
    if (!data.url) {
      resultDiv.textContent = "Upload succeeded but no URL returned.";
      return;
    }

    let finalUrl = data.url;

    // If IMRS is checked and file is an image
    if (useImrsCheckbox.checked && file.type.startsWith("image/")) {
      finalUrl = `https://imrs.madebydanny.uk?url=${encodeURIComponent(data.url)}`;
    }

    // Detect Office file types
    const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    const isOfficeFile = officeExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    // Build readable text-based output
    let outputHTML = `
      <p>✅ Uploaded Successfully!</p>
      <p><strong>CDN Link:</strong> <a href="${finalUrl}" target="_blank">${finalUrl}</a></p>
    `;

    if (isOfficeFile) {
      const officeViewerUrl = `office.html?file=${encodeURIComponent(finalUrl)}`;
      outputHTML += `
        <p><strong>Office Viewer:</strong> <a href="${officeViewerUrl}" target="_blank">${officeViewerUrl}</a></p>
      `;
    }

    resultDiv.innerHTML = outputHTML;

  } catch (err) {
    resultDiv.textContent = "Error: " + err.message;
  }
}

uploadBtn.addEventListener("click", uploadFile);
