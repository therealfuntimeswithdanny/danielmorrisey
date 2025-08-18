
    async function loadArticles() {
      const RSS_URL = "https://rss.beehiiv.com/feeds/OhvCIep1j1.xml";
      try {
        // fetch RSS feed via CORS proxy
        const response = await fetch("https://corsproxy.io/?" + encodeURIComponent(RSS_URL));
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        const items = [...xml.querySelectorAll("item")].slice(0, 3);
        const container = document.getElementById("articles");
        container.innerHTML = "";

        items.forEach(item => {
          const title = item.querySelector("title")?.textContent || "Untitled";
          const link = item.querySelector("link")?.textContent || "#";
          const description = item.querySelector("description")?.textContent || "";
          let image = "";

          // Try to find an image
          const encoded = item.querySelector("content\\:encoded")?.textContent;
          if (encoded && encoded.match(/<img[^>]+src="([^">]+)"/)) {
            image = encoded.match(/<img[^>]+src="([^">]+)"/)[1];
          }
          const enclosure = item.querySelector("enclosure");
          if (!image && enclosure) {
            image = enclosure.getAttribute("url");
          }

          // Build card
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <a href="${link}" target="_blank">
              <img src="${image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${title}">
            </a>
            <div class="card-content">
              <a href="${link}" target="_blank">
                <h3>${title}</h3>
                <p>${description.replace(/(<([^>]+)>)/gi, "").substring(0, 100)}...</p>
              </a>
            </div>
          `;
          container.appendChild(card);
        });
      } catch (err) {
        console.error("Error loading RSS feed:", err);
      }
    }

    loadArticles();