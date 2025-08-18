async function loadArticles() {
  const RSS_URL = "/textbites/feed.xml"; // your local file
  const PROXY = "https://corsproxy.io/?"; // proxy base

  try {
    const response = await fetch(RSS_URL);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const items = [...xml.querySelectorAll("item")].slice(0, 3);
    const container = document.getElementById("textbites");
    container.innerHTML = "";

    items.forEach(item => {
      const title = item.querySelector("title")?.textContent || "Untitled";
      const link = item.querySelector("link")?.textContent || "#";
      const description = item.querySelector("description")?.textContent || "";
      let image = "";

      // 1. Try <img> inside description
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
      }

      // 2. Try <content:encoded>
      const encoded = item.querySelector("content\\:encoded")?.textContent;
      if (!image && encoded) {
        const encodedMatch = encoded.match(/<img[^>]+src="([^">]+)"/);
        if (encodedMatch) {
          image = encodedMatch[1];
        }
      }

      // 3. Try <enclosure>
      const enclosure = item.querySelector("enclosure");
      if (!image && enclosure) {
        image = enclosure.getAttribute("url");
      }

      // 4. Try <media:content>
      const media = item.querySelector("media\\:content");
      if (!image && media) {
        image = media.getAttribute("url");
      }

      // Wrap image with proxy if found
      if (image) {
        image = PROXY + encodeURIComponent(image);
      } else {
        image = "https://placehold.co/300x200?text=No+Image";
      }

      // Build card
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <a href="${link}" target="_blank">
          <img src="${image}" alt="${title}">
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
