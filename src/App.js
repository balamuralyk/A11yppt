import { useState, useCallback } from "react";

const ELEMENT_TYPES = [
  { value: "image", label: "Image / Photo" },
  { value: "chart", label: "Chart / Graph" },
  { value: "shape", label: "Shape / Icon" },
  { value: "table", label: "Table" },
  { value: "textbox", label: "Text Box" },
  { value: "title", label: "Title" },
  { value: "placeholder", label: "Content Placeholder" },
  { value: "smartart", label: "SmartArt" },
  { value: "video", label: "Video / Media" },
  { value: "decorative", label: "Decorative (no alt-text needed)" },
];

const TAG_TYPES = [
  "Figure",
  "InlineShape",
  "Table",
  "P",
  "H1",
  "H2",
  "H3",
  "Span",
  "Caption",
  "Artifact",
];

const ALT_TIPS = {
  image:
    "Describe the key content and context. Mention people, setting, and any visible text. Aim for 1–2 sentences.",
  chart:
    "Describe the chart type, trend/main finding, axes labels, and key data point(s). Don't just say 'bar chart'.",
  shape:
    "Describe the shape's meaning or function (e.g., 'Arrow pointing right indicating next step').",
  table:
    "Describe the table's purpose and structure in a summary. Ensure all headers are marked in the tag order.",
  textbox:
    "Usually no alt-text needed — text is read directly. Use if the box has a decorative/stylized role.",
  smartart:
    "Describe the process/relationship being shown, including all labels in sequence.",
  video:
    "Describe the video content and its relevance. Captions/transcript should also be provided.",
  decorative:
    "Mark as decorative — screen readers will skip it. Use only for purely ornamental elements.",
  title:
    "Usually no alt-text needed — it's read as text. Ensure it uses the Title placeholder.",
  placeholder:
    "If it contains only text, no alt-text needed. If it contains images, describe them.",
  a,
};

function generateAltSuggestion(element) {
  if (!element.description) return "";
  const type = element.type;
  if (type === "decorative")
    return "(Decorative — mark as decorative in Format > Alt Text)";
  if (type === "image") return `Photograph showing ${element.description}.`;
  if (type === "chart")
    return `${element.chartType || "Chart"} showing ${element.description}.`;
  if (type === "shape") return `${element.description}.`;
  if (type === "table") return `Table summarizing ${element.description}.`;
  if (type === "smartart")
    return `Diagram illustrating ${element.description}.`;
  return element.description;
}

function SlideCard({ slide, onChange, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  const addElement = () => {
    onChange({
      ...slide,
      elements: [
        ...slide.elements,
        {
          id: Date.now(),
          name: `Element ${slide.elements.length + 1}`,
          type: "image",
          description: "",
          altText: "",
          tagType: "Figure",
          readingOrder: slide.elements.length + 1,
          notes: "",
        },
      ],
    });
  };

  const updateElement = (idx, updated) => {
    const els = [...slide.elements];
    els[idx] = updated;
    onChange({ ...slide, elements: els });
  };

  const removeElement = (idx) => {
    const els = slide.elements.filter((_, i) => i !== idx);
    // re-number reading order
    els.forEach((el, i) => {
      el.readingOrder = i + 1;
    });
    onChange({ ...slide, elements: els });
  };

  const moveElement = (idx, dir) => {
    const els = [...slide.elements];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= els.length) return;
    [els[idx], els[swapIdx]] = [els[swapIdx], els[idx]];
    els.forEach((el, i) => {
      el.readingOrder = i + 1;
    });
    onChange({ ...slide, elements: els });
  };

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        marginBottom: "20px",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Slide Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div
          style={{
            background: "#E94560",
            color: "white",
            borderRadius: "6px",
            padding: "2px 10px",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "0.5px",
          }}
        >
          {String(slide.number).padStart(2, "0")}
        </div>
        <input
          value={slide.title}
          onChange={(e) => onChange({ ...slide, title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Slide title..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "15px",
            fontFamily: "'Georgia', serif",
            fontWeight: "600",
            outline: "none",
          }}
        />
        <span style={{ color: "#8892B0", fontSize: "12px" }}>
          {slide.elements.length} element
          {slide.elements.length !== 1 ? "s" : ""}
        </span>
        <span style={{ color: "#8892B0", fontSize: "16px" }}>
          {collapsed ? "▶" : "▼"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: "rgba(233,69,96,0.2)",
            border: "1px solid rgba(233,69,96,0.4)",
            color: "#E94560",
            borderRadius: "6px",
            padding: "3px 10px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Remove
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: "20px" }}>
          {/* Slide notes */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Speaker Notes (aids accessibility review)
            </label>
            <textarea
              value={slide.notes}
              onChange={(e) => onChange({ ...slide, notes: e.target.value })}
              placeholder="Add speaker notes here..."
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "10px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontFamily: "inherit",
                fontSize: "13px",
                resize: "vertical",
                minHeight: "60px",
                boxSizing: "border-box",
                color: "#334155",
              }}
            />
          </div>

          {/* Reading order visual */}
          {slide.elements.length > 0 && (
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                📖 Reading / Tab Order (drag rows to reorder)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {slide.elements.map((el, idx) => (
                  <div
                    key={el.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "white",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      color: "#334155",
                    }}
                  >
                    <span
                      style={{
                        background: "#E94560",
                        color: "white",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: "700",
                      }}
                    >
                      {idx + 1}
                    </span>
                    {el.name || `Element ${idx + 1}`}
                    <span style={{ color: "#94A3B8" }}>({el.tagType})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elements */}
          {slide.elements.map((el, idx) => (
            <ElementCard
              key={el.id}
              element={el}
              idx={idx}
              total={slide.elements.length}
              onChange={(updated) => updateElement(idx, updated)}
              onRemove={() => removeElement(idx)}
              onMove={(dir) => moveElement(idx, dir)}
            />
          ))}

          <button
            onClick={addElement}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              border: "2px dashed #CBD5E1",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#64748B",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              width: "100%",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#E94560")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
          >
            ＋ Add Slide Element
          </button>
        </div>
      )}
    </div>
  );
}

function ElementCard({ element, idx, total, onChange, onRemove, onMove }) {
  const [open, setOpen] = useState(true);
  const tip = ALT_TIPS[element.type] || "";
  const suggested = generateAltSuggestion(element);
  const isDecorative = element.type === "decorative";

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      {/* Element header */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <div
          style={{
            background: "#E94560",
            color: "white",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "800",
            flexShrink: 0,
          }}
        >
          {idx + 1}
        </div>

        <input
          value={element.name}
          onChange={(e) => onChange({ ...element, name: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Element name (e.g. 'Hero image')..."
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: "13px",
            fontWeight: "600",
            color: "#334155",
            outline: "none",
          }}
        />

        <select
          value={element.type}
          onChange={(e) =>
            onChange({ ...element, type: e.target.value, altText: "" })
          }
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: "12px",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "3px 6px",
            background: "white",
            color: "#334155",
          }}
        >
          {ELEMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
            disabled={idx === 0}
            style={{
              background: "none",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              padding: "2px 6px",
              cursor: "pointer",
              fontSize: "11px",
              color: "#64748B",
            }}
          >
            ▲
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
            disabled={idx === total - 1}
            style={{
              background: "none",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              padding: "2px 6px",
              cursor: "pointer",
              fontSize: "11px",
              color: "#64748B",
            }}
          >
            ▼
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              background: "none",
              border: "1px solid #FECACA",
              borderRadius: "4px",
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "11px",
              color: "#EF4444",
            }}
          >
            ✕
          </button>
        </div>
        <span style={{ color: "#94A3B8", fontSize: "14px" }}>
          {open ? "▾" : "▸"}
        </span>
      </div>

      {open && (
        <div
          style={{
            padding: "14px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {/* Left: Alt Text */}
          <div>
            {!isDecorative && (
              <>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Alt Text *
                </label>
                <div
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    margin: "6px 0",
                    fontSize: "12px",
                    color: "#92400E",
                    lineHeight: "1.5",
                  }}
                >
                  💡 {tip}
                </div>
                <textarea
                  value={element.altText}
                  onChange={(e) =>
                    onChange({ ...element, altText: e.target.value })
                  }
                  placeholder="Write alt text here..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "80px",
                    boxSizing: "border-box",
                    color: "#334155",
                  }}
                />
                {element.description && (
                  <button
                    onClick={() => onChange({ ...element, altText: suggested })}
                    style={{
                      marginTop: "6px",
                      background: "#EEF2FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      fontSize: "12px",
                      color: "#4338CA",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ✨ Use AI suggestion
                  </button>
                )}
              </>
            )}
            {isDecorative && (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#166534",
                  fontSize: "13px",
                }}
              >
                ✅ <strong>Decorative element</strong> — no alt text needed.
                <br />
                In PowerPoint: Format &gt; Alt Text &gt; check "Mark as
                decorative."
              </div>
            )}
          </div>

          {/* Right: Tag + description */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Accessibility Tag (for tag tree / PDF export)
            </label>
            <select
              value={element.tagType}
              onChange={(e) =>
                onChange({ ...element, tagType: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "8px 10px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "13px",
                background: "white",
                color: "#334155",
                boxSizing: "border-box",
              }}
            >
              {TAG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginTop: "10px",
              }}
            >
              Brief description (to generate alt-text)
            </label>
            <textarea
              value={element.description}
              onChange={(e) =>
                onChange({ ...element, description: e.target.value })
              }
              placeholder="e.g. 'team of 5 people in a meeting room'"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "10px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "60px",
                boxSizing: "border-box",
                color: "#334155",
              }}
            />

            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginTop: "10px",
              }}
            >
              Accessibility Notes
            </label>
            <input
              value={element.notes}
              onChange={(e) => onChange({ ...element, notes: e.target.value })}
              placeholder="e.g. 'ensure color contrast is 4.5:1'"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "8px 10px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "#334155",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ExportPanel({ slides }) {
  const [format, setFormat] = useState("checklist");

  const generateExport = () => {
    if (format === "checklist") {
      let out = "# Accessibility Checklist\n\n";
      slides.forEach((slide) => {
        out += `## Slide ${slide.number}: ${slide.title || "(Untitled)"}\n\n`;
        if (slide.elements.length === 0) {
          out += "_No elements added._\n\n";
          return;
        }
        out += "### Reading/Tab Order:\n";
        slide.elements.forEach((el, i) => {
          out += `${i + 1}. **${el.name || "Element " + (i + 1)}** (${
            el.tagType
          })\n`;
        });
        out += "\n### Elements:\n\n";
        slide.elements.forEach((el, i) => {
          out += `**${i + 1}. ${el.name || "Element " + (i + 1)}** — Type: ${
            el.type
          }, Tag: \`${el.tagType}\`\n`;
          if (el.type === "decorative") {
            out += "  - ✅ Mark as decorative\n";
          } else {
            out += `  - Alt text: "${el.altText || "(MISSING)"}"\n`;
            if (!el.altText) out += "  - ⚠️ ALT TEXT MISSING\n";
          }
          if (el.notes) out += `  - Notes: ${el.notes}\n`;
          out += "\n";
        });
        if (slide.notes) out += `**Speaker Notes:** ${slide.notes}\n\n`;
        out += "---\n\n";
      });
      return out;
    }

    if (format === "json") {
      return JSON.stringify(slides, null, 2);
    }

    if (format === "pptx-guide") {
      let out = "# PowerPoint Accessibility Implementation Guide\n\n";
      out += "## How to apply these settings in PowerPoint\n\n";
      out +=
        "### Alt Text\n1. Right-click the element > Format > Alt Text\n2. Paste the alt text into the Description field\n3. For decorative elements, check 'Mark as decorative'\n\n";
      out +=
        "### Reading / Tab Order (Selection Pane)\n1. Go to Home > Arrange > Selection Pane\n2. Reorder items to match the reading order below (top = last read, bottom = first read in PPTX)\n3. Name each element clearly using the names below\n\n";
      out +=
        "### Tag Order (for PDF export)\n1. After saving as PDF: open in Acrobat > Tools > Accessibility > Reading Order\n2. Verify the tag tree matches the order specified\n\n---\n\n";
      slides.forEach((slide) => {
        out += `## Slide ${slide.number}: ${slide.title || "(Untitled)"}\n\n`;
        out +=
          "**Selection Pane order (bottom to top in PPT = reading order 1→N):**\n\n";
        [...slide.elements].reverse().forEach((el, i) => {
          out += `- ${el.name || "Element"} | Tag: ${el.tagType}\n`;
        });
        out += "\n**Alt texts to apply:**\n\n";
        slide.elements.forEach((el) => {
          if (el.type !== "decorative") {
            out += `- **${el.name}**: ${el.altText || "⚠️ MISSING"}\n`;
          } else {
            out += `- **${el.name}**: Mark as decorative\n`;
          }
        });
        out += "\n---\n\n";
      });
      return out;
    }
  };

  const content = generateExport();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const issues = slides.flatMap((slide) =>
    slide.elements
      .filter((el) => el.type !== "decorative" && !el.altText)
      .map(
        (el) =>
          `Slide ${slide.number} "${slide.title}": "${
            el.name || "unnamed element"
          }" is missing alt text`
      )
  );

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
          padding: "14px 20px",
          color: "white",
          fontFamily: "'Georgia', serif",
          fontWeight: "600",
          fontSize: "15px",
        }}
      >
        📋 Export & Review
      </div>
      <div style={{ padding: "20px" }}>
        {/* Issues */}
        {issues.length > 0 && (
          <div
            style={{
              background: "#FFF1F2",
              border: "1px solid #FECDD3",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "#BE123C",
                marginBottom: "6px",
                fontSize: "13px",
              }}
            >
              ⚠️ {issues.length} issue{issues.length !== 1 ? "s" : ""} found
            </div>
            {issues.map((issue, i) => (
              <div
                key={i}
                style={{
                  fontSize: "12px",
                  color: "#9F1239",
                  marginBottom: "2px",
                }}
              >
                • {issue}
              </div>
            ))}
          </div>
        )}

        {issues.length === 0 && slides.some((s) => s.elements.length > 0) && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#166534",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            ✅ All elements have alt text — great work!
          </div>
        )}

        {/* Format selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {[
            { id: "checklist", label: "Checklist" },
            { id: "pptx-guide", label: "PPT Guide" },
            { id: "json", label: "JSON" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid",
                background: format === f.id ? "#E94560" : "white",
                color: format === f.id ? "white" : "#64748B",
                borderColor: format === f.id ? "#E94560" : "#E2E8F0",
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={copyToClipboard}
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#334155",
            }}
          >
            📋 Copy
          </button>
        </div>

        <pre
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "11.5px",
            lineHeight: "1.7",
            maxHeight: "300px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "'Courier New', monospace",
            color: "#334155",
          }}
        >
          {content}
        </pre>
      </div>
    </div>
  );
}

export default function App() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      number: 1,
      title: "Title Slide",
      notes: "",
      elements: [
        {
          id: 101,
          name: "Title Text",
          type: "title",
          description: "",
          altText: "",
          tagType: "H1",
          readingOrder: 1,
          notes: "",
        },
        {
          id: 102,
          name: "Subtitle Text",
          type: "textbox",
          description: "",
          altText: "",
          tagType: "P",
          readingOrder: 2,
          notes: "",
        },
      ],
    },
  ]);

  const addSlide = () => {
    const num = slides.length + 1;
    setSlides([
      ...slides,
      {
        id: Date.now(),
        number: num,
        title: `Slide ${num}`,
        notes: "",
        elements: [],
      },
    ]);
  };

  const updateSlide = (idx, updated) => {
    const s = [...slides];
    s[idx] = updated;
    setSlides(s);
  };

  const deleteSlide = (idx) => {
    const s = slides.filter((_, i) => i !== idx);
    s.forEach((sl, i) => {
      sl.number = i + 1;
    });
    setSlides(s);
  };

  const totalElements = slides.reduce((acc, s) => acc + s.elements.length, 0);
  const altTextComplete = slides.every((s) =>
    s.elements.every(
      (el) => el.type === "decorative" || el.altText.trim().length > 0
    )
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F5F9",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)",
          padding: "28px 32px",
          borderBottom: "3px solid #E94560",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "14px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: "#E94560",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "22px",
              }}
            >
              ♿
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "white",
                  fontFamily: "'Georgia', serif",
                  fontSize: "24px",
                  fontWeight: "700",
                }}
              >
                Accessible PowerPoint Builder
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "#8892B0",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                Alt text · Reading order · Tag tree · WCAG 2.1 guidance
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
            {[
              { label: "Slides", value: slides.length },
              { label: "Elements", value: totalElements },
              {
                label: "Alt Text Status",
                value: altTextComplete ? "✅ Complete" : "⚠️ Incomplete",
                highlight: !altTextComplete,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
              >
                <div
                  style={{
                    color: "#8892B0",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    color: stat.highlight ? "#FBBF24" : "#E2E8F0",
                    fontSize: "15px",
                    fontWeight: "700",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div
        style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 20px" }}
      >
        {/* Quick guide */}
        <div
          style={{
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
          }}
        >
          {[
            {
              icon: "🖼️",
              title: "Alt Text",
              desc: "Describe images, charts, and shapes for screen readers",
            },
            {
              icon: "🔢",
              title: "Reading Order",
              desc: "Use ▲▼ arrows to set the tab/reading sequence",
            },
            {
              icon: "🏷️",
              title: "Tag Types",
              desc: "Assign semantic tags for proper PDF/HTML export",
            },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: "10px" }}>
              <div style={{ fontSize: "22px" }}>{item.icon}</div>
              <div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "13px",
                    color: "#1E293B",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    lineHeight: "1.4",
                    marginTop: "2px",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slides */}
        {slides.map((slide, idx) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            onChange={(updated) => updateSlide(idx, updated)}
            onDelete={() => deleteSlide(idx)}
          />
        ))}

        {/* Add slide */}
        <button
          onClick={addSlide}
          style={{
            width: "100%",
            padding: "14px",
            background: "white",
            border: "2px dashed #CBD5E1",
            borderRadius: "12px",
            color: "#64748B",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "28px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#E94560";
            e.currentTarget.style.color = "#E94560";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#CBD5E1";
            e.currentTarget.style.color = "#64748B";
          }}
        >
          ＋ Add Slide
        </button>

        {/* Export */}
        <ExportPanel slides={slides} />

        {/* Footer tips */}
        <div
          style={{
            background: "#1A1A2E",
            borderRadius: "12px",
            padding: "20px 24px",
            marginTop: "24px",
            color: "#8892B0",
            fontSize: "12px",
            lineHeight: "1.8",
          }}
        >
          <div
            style={{
              color: "#E94560",
              fontWeight: "700",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            📌 PowerPoint Accessibility Checklist
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 24px",
            }}
          >
            {[
              "Use built-in slide layouts (not blank slides with text boxes)",
              "Ensure font size ≥ 18pt for body text",
              "Color contrast ratio ≥ 4.5:1 for normal text",
              "Never use color alone to convey meaning",
              "Hyperlinks have descriptive text (not 'click here')",
              "Tables have defined header rows",
              "Videos have captions and audio descriptions",
              "Reading order set via Selection Pane",
              "All images have alt text or marked decorative",
              "Slide titles are unique and descriptive",
            ].map((tip) => (
              <div key={tip} style={{ display: "flex", gap: "6px" }}>
                <span style={{ color: "#E94560", flexShrink: 0 }}>✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
