import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { apiRequest } from "../lib/api";
import { showcaseItems } from "../content/schoolData";

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
          title: item.title,
          description: item.description || "Photo update from the school gallery.",
          src: item.imageUrl
        }));
        setItems([...publishedItems, ...showcaseItems]);
      })
      .catch(() => setItems(showcaseItems));
  }, []);

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const visibleItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <Shell>
      <section className="page-section">
        <div className="container">
          <span className="eyebrow">Gallery</span>
          <h1>Weekly school showcase</h1>
          <p className="lede">A warm collection of classroom moments, celebrations, campus life, and student activities.</p>
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
          <div className="gallery-grid-web">
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
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
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
              <h3>{selectedItem.title}</h3>
              <p>{selectedItem.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
