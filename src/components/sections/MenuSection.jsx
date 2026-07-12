import { useState } from "react";
import { Clock } from "lucide-react";

import styles from "./MenuSection.module.css";
import shared from "./shared.module.css";
import { MENU_CATEGORIES } from "./data";

function DrinkTable({ section, items, note, columns }) {
  const colCount = columns.length;

  return (
    <div className={styles.drinkTableWrap}>
      <div className={styles.drinkTableHeader}>
        <h4 className={styles.drinkSectionTitle}>{section}</h4>
        {note ? <span className={styles.drinkSectionNote}>{note}</span> : null}
      </div>

      <div className={styles.drinkTableShell}>
        <div
          className={styles.drinkTableHeaderRow}
          style={{ gridTemplateColumns: `1fr repeat(${colCount}, 80px)` }}
        >
          <span />
          {columns.map((col) => (
            <span key={col.key} style={{ textAlign: "right" }}>{col.label}</span>
          ))}
        </div>

        {items.map((item) => (
          <div
            className={styles.drinkTableRow}
            key={item.name}
            style={{ gridTemplateColumns: `1fr repeat(${colCount}, 80px)` }}
          >
            <span className={styles.drinkItemName}>{item.name}</span>
            {columns.map((col) => (
              <span className={styles.drinkPriceCell} key={col.key}>
                {item[col.key] ? `₱${item[col.key]}` : "—"}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("mains");
  const category = MENU_CATEGORIES.find((item) => item.id === activeCategory);

  return (
    <section id="menu" className={styles.menuSection}>
      <div className={shared.content}>
        <div className={styles.titleBlock}>
          <p className={shared.eyebrow}>Our Menu</p>
          <h2 className={shared.heading}>Simple. Honest. Delicious.</h2>
          <p className={shared.description}>
            Filipino comfort food, pasta, snacks, and specialty drinks — enjoyed best
            with a view of the lake.
          </p>
        </div>

        <section className={styles.signaturePanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Cafe Museo&apos;s Signatures</span>
            <span className={styles.panelLine} />
          </div>

          <div className={styles.cardGrid}>
            {[
              {
                name: "Croffle",
                desc: "Banana & Almond, Banana & Nutella, or Biscoff Cookie & Syrup",
                price: "₱120",
              },
              {
                name: "Cheesecake French Toast",
                desc: "Brioche stuffed with cheesecake, topped with whipped cream",
                price: "₱195",
                newLabel: "New",
              },
              {
                name: "Special Sizzling Sisig",
                desc: "Sizzling plate with egg, calamansi, and mayo",
                price: "₱180",
              },
              {
                name: "Waffle",
                desc: "Add Oreo +₱15, Add Banana & Almond +₱30.",
                price: "from ₱65",
              },
            ].map((item) => (
              <article className={styles.signatureCard} key={item.name}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                  {item.newLabel ? <span className={shared.badge}>{item.newLabel}</span> : null}
                </div>
                <p className={styles.cardDescription}>{item.desc}</p>
                <p className={styles.cardPrice}>{item.price}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.filterRow}>
          {MENU_CATEGORIES.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;

            return (
              <button
                type="button"
                key={item.id}
                className={`${styles.filterChip} ${isActive ? styles.activeChip : ""}`}
                onClick={() => setActiveCategory(item.id)}
              >
                <span className={styles.iconCircle}>
                  <Icon size={15} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {category?.timeNote ? (
          <div className={styles.timeNote}>
            <Clock size={13} className={styles.timeNoteIcon} />
            <span>{category.timeNote}</span>
          </div>
        ) : null}

        {category?.id === "drinks" && category.drinkSections ? (
          <div className={styles.drinksLayout}>
            {category.drinkSections.map((section) => (
              <DrinkTable key={section.section} {...section} />
            ))}
          </div>
        ) : null}

        {category?.items ? (
          <div className={styles.menuGrid}>
            {category.items.map((item) => (
              <article className={styles.menuCard} key={item.name}>
                <div className={styles.menuCardInner}>
                  <div className={styles.menuCardText}>
                    <div className={styles.menuTitleRow}>
                      <h3 className={styles.menuCardTitle}>{item.name}</h3>
                      {item.isNew ? <span className={shared.badge}>New</span> : null}
                    </div>
                    <p className={styles.menuCardDescription}>{item.desc}</p>
                  </div>
                  <span className={styles.menuCardPrice}>{item.price}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className={styles.menuFooter}>
          <p className={styles.menuFooterNote}>
            Menu subject to availability. For dietary inquiries please ask our staff.
          </p>
          <a
            href="/MainMenu.pdf"
            target="_blank"
            rel="noreferrer"
            className={styles.menuPdfLink}
          >
            View full menu PDF ↗
          </a>
          <a
            href="/SignaturesMenu.pdf"
            target="_blank"
            rel="noreferrer"
            className={styles.menuPdfLink}
            style={{ marginLeft: 16 }}
          >
            View signatures menu PDF ↗
          </a>
        </div>
      </div>
    </section>
  );
}
