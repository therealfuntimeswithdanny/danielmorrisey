  document.addEventListener("DOMContentLoaded", () => {
    // Set current year
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const resultDiv = document.getElementById('result');
    const useImrsCheckbox = document.getElementById('useImrs');
    const useOfficeCheckbox = document.getElementById('useOfficeViewer');

    // Handle clicks and touches on drop zone
    ['click', 'touchend'].forEach(event =>
      dropZone.addEventListener(event, () => fileInput.click())
    );

    // Drag and drop
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        updateDropZoneText();
        updateCheckboxVisibility();
      }
    });

    // File selection
    fileInput.addEventListener('change', () => {
      updateDropZoneText();
      updateCheckboxVisibility();
    });

    function updateDropZoneText() {
      const textEl = dropZone.querySelector('p');
      if (!textEl) return;
      if (fileInput.files.length) {
        textEl.innerHTML = `✅ Selected: ${fileInput.files[0].name}`;
      } else {
        textEl.innerHTML = `<i class="fa-solid fa-upload"></i> Drag & drop your file here, or tap to select`;
      }
    }

    function updateCheckboxVisibility() {
      if (!fileInput.files.length) {
        useImrsCheckbox.parentElement.style.display = "none";
        useOfficeCheckbox.parentElement.style.display = "none";
        return;
      }
      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop().toLowerCase();
      useImrsCheckbox.parentElement.style.display = file.type.startsWith('image/') ? "block" : "none";
      const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      useOfficeCheckbox.parentElement.style.display = officeExts.includes(fileExt) ? "block" : "none";
    }

    uploadBtn.addEventListener('click', async () => {
      if (!fileInput.files.length) {
        resultDiv.textContent = "Please select a file first.";
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      resultDiv.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Uploading...';

      try {
        const response = await fetch('https://cdn.madebydanny.uk/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');

        let finalUrl = data.url;
        if (useImrsCheckbox.checked && file.type.startsWith('image/')) {
          finalUrl = `https://imrs.madebydanny.uk?url=${encodeURIComponent(finalUrl)}`;
        }

        // Copy URL to clipboard with fallback
        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(finalUrl);
            copied = true;
          } catch { copied = false; }
        }
        if (!copied) {
          const tempInput = document.createElement("input");
          tempInput.value = finalUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }

        resultDiv.innerHTML = `
          ✅ Uploaded! URL copied:<br>
          <a href="${finalUrl}" target="_blank">${finalUrl}</a><br>
          ${file.type.startsWith('image/') ? `<img src="${data.url}" alt="Uploaded Image" style="max-width: 100%; margin-top: 1rem;">` : ''}
        `;

        fetchStats();
      } catch (err) {
        resultDiv.textContent = "Error: " + err.message;
      }
    });

    async function fetchStats() {
      try {
        const res = await fetch('https://cdn.madebydanny.uk/stats');
        const stats = await res.json();
        document.getElementById('fileCount').textContent = stats.filesUploaded.toLocaleString();
        document.getElementById('bandwidthUsed').textContent = `${stats.totalBandwidth} GB`;
        document.getElementById('regionsSupported').textContent = stats.regionsSupported;
      } catch {
        const statsEl = document.querySelector('.stats');
        if (statsEl) statsEl.innerHTML = '<p>Unable to load CDN stats.</p>';
      }
    }

    fetchStats();
  });
