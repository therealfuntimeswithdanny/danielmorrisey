document.addEventListener('DOMContentLoaded', function() {
    // This array acts as our JavaScript database
    const images = [
        // --- mbdcdn ---
        "https://public-cdn.madebydanny.uk/user-content/2025-09-01/IMG_0310.jpeg",
        "https://public-cdn.madebydanny.uk/user-content/2025-09-01/IMG_0282.jpeg",
        "https://public-cdn.madebydanny.uk/user-content/2025-08-30/IMG_2100.jpeg",
        "https://public-cdn.madebydanny.uk/user-content/2025-08-30/IMG_1818.jpeg",
        // --- root ---
        "https://img.madebydanny.uk/img/DSC_4726.avif",
        "https://img.madebydanny.uk/img/IMG_1489.avif",
        "https://img.madebydanny.uk/img/IMG_1593.avif",
        "https://img.madebydanny.uk/img/IMG_1594.avif",
        "https://img.madebydanny.uk/img/IMG_1595.avif",
        "https://img.madebydanny.uk/img/IMG_1596.avif",
        "https://img.madebydanny.uk/img/IMG_1597.avif",
        "https://img.madebydanny.uk/img/IMG_1598.avif",
        "https://img.madebydanny.uk/img/IMG_1599.avif",
        "https://img.madebydanny.uk/img/IMG_1600.avif",
        "https://img.madebydanny.uk/img/IMG_1601.avif",
        "https://img.madebydanny.uk/img/IMG_1602.avif",
        "https://img.madebydanny.uk/img/IMG_1603.avif",
        "https://img.madebydanny.uk/img/IMG_1604.avif",
        "https://img.madebydanny.uk/img/IMG_1605.avif",
        "https://img.madebydanny.uk/img/IMG_1606.avif",
        "https://img.madebydanny.uk/img/IMG_1607.avif",
        "https://img.madebydanny.uk/img/IMG_1608.avif",
        "https://img.madebydanny.uk/img/IMG_1609.avif",
        "https://img.madebydanny.uk/img/IMG_1610.avif",
        "https://img.madebydanny.uk/img/IMG_1611.avif",
        "https://img.madebydanny.uk/img/IMG_1612.avif",
        "https://img.madebydanny.uk/img/IMG_1613.avif",
        "https://img.madebydanny.uk/img/IMG_1676.avif",
        "https://img.madebydanny.uk/img/IMG_1678.avif",
        "https://img.madebydanny.uk/img/IMG_1685.avif",
        "https://img.madebydanny.uk/img/IMG_1686.avif",
        "https://img.madebydanny.uk/img/IMG_1689.avif",
        "https://img.madebydanny.uk/img/IMG_1690.avif",
        "https://img.madebydanny.uk/img/IMG_1708.avif",
        "https://img.madebydanny.uk/img/IMG_1710.avif",
        "https://img.madebydanny.uk/img/IMG_1711.avif",
        "https://img.madebydanny.uk/img/IMG_1726.avif",
        "https://img.madebydanny.uk/img/IMG_1728.avif",
        "https://img.madebydanny.uk/img/IMG_1729.avif",
        "https://img.madebydanny.uk/img/IMG_1730.avif",
        "https://img.madebydanny.uk/img/IMG_1734.avif",
        "https://img.madebydanny.uk/img/IMG_1735.avif",
        "https://img.madebydanny.uk/img/IMG_1737.avif",
        "https://img.madebydanny.uk/img/IMG_1738.avif",
        "https://img.madebydanny.uk/img/IMG_1739.avif",
        "https://img.madebydanny.uk/img/IMG_1740.avif",
        "https://img.madebydanny.uk/img/IMG_1747.avif",
        "https://img.madebydanny.uk/img/IMG_1749.avif",
        "https://img.madebydanny.uk/img/IMG_1751.avif",
        "https://img.madebydanny.uk/img/IMG_1752.avif",
        "https://img.madebydanny.uk/img/IMG_1753.avif",
        "https://img.madebydanny.uk/img/IMG_1754.avif",
        "https://img.madebydanny.uk/img/IMG_1756.avif",
        "https://img.madebydanny.uk/img/IMG_1757.avif",
        "https://img.madebydanny.uk/img/IMG_1758.avif",
        "https://img.madebydanny.uk/img/IMG_1759.avif",
        "https://img.madebydanny.uk/img/IMG_1760.avif",
        "https://img.madebydanny.uk/img/IMG_1761.avif",
        "https://img.madebydanny.uk/img/IMG_1763.avif",
        "https://img.madebydanny.uk/img/IMG_1764.avif",
        "https://img.madebydanny.uk/img/IMG_1766.avif",
        "https://img.madebydanny.uk/img/JPEG image 2.avif",
        "https://img.madebydanny.uk/img/JPEG image 3.avif",
        "https://img.madebydanny.uk/img/JPEG image.avif",
      
        // --- upload-2 ---
        "https://img.madebydanny.uk/img/upload-2/DSC_2753.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2754.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2758.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2772.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2791.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2817.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2850.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2852.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2863.avif",
        "https://img.madebydanny.uk/img/upload-2/DSC_2879.avif",
      
        // --- upload-3 ---
        "https://img.madebydanny.uk/img/upload-3/CSC_3608.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3535.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3622.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3633.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3636.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3692.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3764.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3765.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3767.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3773.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3793.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3811.avif",
        "https://img.madebydanny.uk/img/upload-3/DSC_3827.avif",
      
        // --- upload-4 ---
        "https://img.madebydanny.uk/img/upload-4/DSC_0114.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0126.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0140.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0141.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0142.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0144.avif",
        "https://img.madebydanny.uk/img/upload-4/DSC_0152.avif",
      
        // --- upload-5 ---
        "https://img.madebydanny.uk/img/upload-5/DSC_0007.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0009.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0010.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0012.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0015.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0017.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0019.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0044.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0046.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0050.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0065.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0073.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0080.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0093.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0096.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0097.avif",
        "https://img.madebydanny.uk/img/upload-5/DSC_0115.avif",
    ];

    const gallery = document.getElementById('photo-gallery');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const downloadMessage = document.getElementById('downloadMessage');

    // Dynamically create and add images to the gallery
    images.forEach(imageUrl => {
        const photoItem = document.createElement('div');
        photoItem.classList.add('photo-item');

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = imageUrl.split('/').pop().split('.')[0]; // Set alt text from filename

        // Add an onerror listener to handle failed images
        img.onerror = function() {
            console.error(`Failed to load image: ${this.src}. Replacing with placeholder.`);
            this.src = "https://placehold.co/600x400/94a3b8/e2e8f0?text=Image+Failed";
        };

        const overlay = document.createElement('div');
        overlay.classList.add('image-overlay');
        overlay.textContent = img.alt;

        photoItem.appendChild(img);
        photoItem.appendChild(overlay);
        gallery.appendChild(photoItem);
    });
    
    // Set the current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Bulk download functionality
    downloadAllBtn.addEventListener('click', async () => {
        downloadMessage.textContent = 'Preparing files...';
        const zip = new JSZip();
        let filesProcessed = 0;

        for (const imageUrl of images) {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
                }
                const blob = await response.blob();
                const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                zip.file(filename, blob, { binary: true });
                filesProcessed++;
                downloadMessage.textContent = `Downloaded ${filesProcessed} of ${images.length} files...`;
            } catch (error) {
                console.error('Error fetching image for download:', error);
                // We'll continue to the next image even if one fails
            }
        }

        downloadMessage.textContent = `Creating zip file...`;
        zip.generateAsync({ type: "blob" }).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "photos.zip";
            link.click();
            link.remove();
            downloadMessage.textContent = 'Download complete!';
            setTimeout(() => downloadMessage.textContent = '', 3000);
        });
    });
});
