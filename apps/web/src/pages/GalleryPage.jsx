import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { apiRequest } from "../lib/api";
import { galleryCollections, showcaseItems } from "../content/schoolData";

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.src?.toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default function GalleryPage() {
  const [items, setItems] = useState(showcaseItems);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    apiRequest("/public/gallery")
      .then((data) => {
        const publishedItems = (data.data || []).map((item) => ({
          id: `published-${item.id}`,
          type: "image",
          category: item.category || "Updates",
          title: item.category || "School Update",
          description: item.description || "Photo update from the school gallery.",
          src: item.imageUrl
        }));
        setItems(dedupeItems([...publishedItems, ...showcaseItems]));
      })
      .catch(() => setItems(showcaseItems));
  }, []);

  const categories = ["All", ...galleryCollections.map((collection) => collection.name)];
  const visibleItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);
  const activeCollection = galleryCollections.find((collection) => collection.name === activeCategory);
  const featuredCollections = galleryCollections
    .map((collection) => ({
      ...collection,
      count: items.filter((item) => item.category === collection.name).length,
      cover: items.find((item) => item.category === collection.name && item.type === "image")?.src
    }))
    .filter((collection) => collection.count > 0);

  return (
    <Shell>
      <section className="page-section">
        <div className="container">
          <span className="eyebrow">Gallery</span>
          <h1>Functions, events, and school memories</h1>
          <p className="lede">Organized collections for parents and visitors to watch school life without repeated photos or file-name labels.</p>
          <div className="collection-grid">
            {featuredCollections.map((collection) => (
              <button
                className={`collection-card${activeCategory === collection.name ? " active" : ""}`}
                key={collection.name}
                onClick={() => setActiveCategory(collection.name)}
                type="button"
              >
                {collection.cover ? <img src={collection.cover} alt="" /> : null}
                <span>{collection.name}</span>
                <small>{collection.count} moments</small>
              </button>
            ))}
          </div>
          <div className="filter-row">
            {categories.map((category) => (
              <button
                className={`filter-chip${category === activeCategory ? " active" : ""}`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          {activeCollection ? <p className="collection-note">{activeCollection.note}</p> : null}
          <div className="gallery-grid-web event-gallery-grid">
            {visibleItems.length
              ? visibleItems.map((item) => (
                  <article className="card media-card" key={item.id}>
                    {item.type === "video" ? (
                      <video controls preload="metadata" src={item.src} />
                    ) : (
                      <button className="media-button" onClick={() => setSelectedItem(item)} type="button">
                        <img src={item.src} alt={item.title} />
                      </button>
                    )}
                    <div>
                      <span className="chip">{item.category}</span>
                    </div>
                  </article>
                ))
              : <p className="empty-copy">No gallery items published yet.</p>}
          </div>
        </div>
      </section>
      {selectedItem ? (
        <div className="lightbox" onClick={() => setSelectedItem(null)} role="presentation">
          <div className="lightbox-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button className="lightbox-close" onClick={() => setSelectedItem(null)} type="button">Close</button>
            <img src={selectedItem.src} alt={selectedItem.title} />
            <div className="lightbox-copy">
              <span className="chip">{selectedItem.category}</span>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
