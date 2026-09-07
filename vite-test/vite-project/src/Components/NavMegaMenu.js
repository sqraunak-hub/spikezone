import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronRight,
  FaDove,
  FaScrewdriverWrench,
  FaTableCellsLarge,
  FaLayerGroup,
  FaLocationDot,
  FaCircleQuestion,
} from "react-icons/fa6";
import { navGroups } from "../Utils/productFamilies";

/**
 * Dropdown for one product family.
 *
 * The menu is organised by family rather than by site section, so a visitor
 * picks what they have a problem with first and then how they want to look at
 * it. Every family shows the same four columns:
 *
 *   Bird Control | Solution | Application
 *   Location     | Types    | FAQs
 *
 * Six across would be ~1250px of columns, wider than a 1280px laptop can
 * show, so they wrap three to a row — the same arrangement as the home panel.
 *
 * The links come from Utils/productFamilies.js, which the home page panels
 * read too — there is one list, not two.
 */
const GROUP_ICONS = {
  "bird-control": <FaDove />,
  solution: <FaScrewdriverWrench />,
  application: <FaTableCellsLarge />,
  location: <FaLocationDot />,
  types: <FaLayerGroup />,
  faqs: <FaCircleQuestion />,
};

export default function NavMegaMenu({ family, icon }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const closeTimer = useRef(null);
  const [shift, setShift] = useState(0);

  // The panel is centred on its trigger, which pushes the wider menus
  // off-screen on narrower laptops. Measure once open and nudge it back in.
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    setShift(0);
    const margin = 16;
    const r = panelRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    if (r.right > vw - margin) setShift(-(r.right - vw + margin));
    else if (r.left < margin) setShift(margin - r.left);
  }, [open]);

  // Close on outside click and on Escape, so it behaves for keyboard users too.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hoverOpen = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Small delay so the pointer can cross the gap to the panel.
  const hoverClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const columns = navGroups(family);
  const close = () => setOpen(false);

  return (
    <div
      className={`szmm szmm-h${family.hue}${open ? " szmm-open" : ""}`}
      ref={wrapRef}
      onMouseEnter={hoverOpen}
      onMouseLeave={hoverClose}
    >
      <Link
        to={family.to}
        className="cat-bar-link szmm-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={hoverOpen}
        onClick={close}
      >
        {icon && (
          <span className="cat-bar-ico" aria-hidden="true">
            {icon}
          </span>
        )}
        {family.title}
        <span className="szmm-caret" aria-hidden="true" />
      </Link>

      <div
        className="szmm-panel"
        role="menu"
        ref={panelRef}
        style={shift ? { marginLeft: `${shift}px` } : undefined}
      >
        <div className="szmm-cols">
          {columns.map((col) => (
            <div className="szmm-col" key={col.id}>
              <div className="szmm-colhead">
                <span className="szmm-colicon" aria-hidden="true">
                  {GROUP_ICONS[col.id]}
                </span>
                <span className="szmm-coltitles">
                  <span className="szmm-heading">{col.heading}</span>
                  <span className="szmm-subheading">{col.sub}</span>
                </span>
              </div>

              <ul>
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} onClick={close}>
                      <span className="szmm-dot" aria-hidden="true">
                        {GROUP_ICONS[col.id]}
                      </span>
                      <span className="szmm-label">{l.label}</span>
                      <FaChevronRight className="szmm-chev" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link className="szmm-colall" to={col.all.to} onClick={close}>
                {col.all.label} <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>

        <Link className="szmm-all" to={family.to} onClick={close}>
          {family.title} — full guide <FaArrowRight />
        </Link>
      </div>
    </div>
  );
}
