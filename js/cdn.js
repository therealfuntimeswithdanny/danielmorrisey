document.getElementById("current-year").textContent = new Date().getFullYear();

    async function uploadFile() {
      const fileInput = document.getElementById('fileInput');
      const resultDiv = document.getElementById('result');
      if (!fileInput.files.length) {
        resultDiv.textContent = "Please select a file first.";
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("file", file);

      resultDiv.textContent = "Uploading...";

      try {
        const response = await fetch("https://cdn-upload.madebydanny.uk/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Upload failed. Status: " + response.status);
        }

        const data = await response.json();
        if (data.url) {
          navigator.clipboard.writeText(data.url);
          resultDiv.innerHTML = `✅ Uploaded! URL copied:<br><a href="${data.url}" target="_blank">${data.url}</a>`;
        } else {
          resultDiv.textContent = "Upload succeeded but no URL returned.";
        }
      } catch (err) {
        resultDiv.textContent = "Error: " + err.message;
      }
    }

    document.getElementById("uploadBtn").addEventListener("click", uploadFile);