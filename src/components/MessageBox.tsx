import { useState, useEffect, useRef, useMemo } from "react";
import hljs from "highlight.js";
import { Remarkable } from "remarkable";
import SidePanel from "./SidePanel";
import MemorySelect from "./MemorySelect";

type WhyType = {
  intermediate_steps?: [[string, string], string][];
  memory?: any;
};

type MessageBoxProps = {
  sender: "bot" | "user";
  text: string;
  why?: WhyType | null;
};

const maxLength = 3000;

export default function MessageBox({ sender, text, why }: MessageBoxProps) {
  const [showReadMore, setShowReadMore] = useState(true);
  const elementContentRef = useRef<HTMLParagraphElement>(null);
  const [isLengthy, setIsLengthy] = useState(false);

  const md = useMemo(() => {
    const mdInstance = new Remarkable({
      html: true,
      breaks: true,
      xhtmlOut: true,
      typographer: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch {}
        }
        try {
          return hljs.highlightAuto(str).value;
        } catch {
          return "";
        }
      },
    });

    mdInstance.inline.ruler.enable(["sup", "sub"]);
    mdInstance.core.ruler.enable(["abbr"]);
    mdInstance.block.ruler.enable(["footnote", "deflist"]);

    return mdInstance;
  }, []);

  const renderedText = useMemo(() => {
    const content = showReadMore ? text.slice(0, maxLength) : text;
    return md.render(content);
  }, [md, text, showReadMore]);

  useEffect(() => {
    if (!elementContentRef.current) return;
    const el = elementContentRef.current;
    const content = (el.textContent || el.innerText || "").replace(/\n/g, "");
    setIsLengthy(content.length >= maxLength);
  }, [renderedText]);

  const [whyPanelOpen, setWhyPanelOpen] = useState(false);
  const toggleWhyPanel = () => setWhyPanelOpen((open) => !open);

  return (
    <div
      className={`chat my-2 gap-x-3 ${
        sender === "bot" ? "chat-start" : "chat-end"
      }`}
    >
      <div className="chat-image text-lg">{sender === "bot" ? "😺" : "🙂"}</div>
      <div className="chat-bubble flex min-h-fit items-center break-words rounded-lg p-0 text-base-100">
        <div className="p-2 md:p-3">
          <p
            ref={elementContentRef}
            className="text-ellipsis"
            dangerouslySetInnerHTML={{ __html: renderedText }}
          />
          {isLengthy && (
            <div className="flex justify-end font-bold">
              {showReadMore ? (
                <a
                  onClick={() => setShowReadMore(false)}
                  style={{ cursor: "pointer" }}
                >
                  Read more
                </a>
              ) : (
                <a
                  onClick={() => setShowReadMore(true)}
                  style={{ cursor: "pointer" }}
                >
                  Hide content
                </a>
              )}
            </div>
          )}
        </div>
        {why && (
          <>
            <div className="divider divider-horizontal m-0 w-px before:bg-base-200 after:bg-base-200" />
            <button
              className="btn btn-circle btn-primary btn-xs mx-2"
              onClick={toggleWhyPanel}
              aria-label="Toggle why panel"
            >
              <p className="text-base">?</p>
            </button>
          </>
        )}
      </div>

      {why && whyPanelOpen && (
        <SidePanel
          title="Why this response"
          onClose={() => setWhyPanelOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-md border-2 border-neutral">
              <table className="table table-zebra table-sm text-center">
                <thead className="bg-base-100 text-neutral">
                  <tr>
                    <th>🧰 Tool</th>
                    <th>⌨️ Input</th>
                    <th>💬 Output</th>
                  </tr>
                </thead>
                <tbody>
                  {why.intermediate_steps &&
                  why.intermediate_steps.length > 0 ? (
                    why.intermediate_steps.map((data, index) => (
                      <tr key={index}>
                        <td>{data[0][0]}</td>
                        <td>{data[0][1]}</td>
                        <td>{data[1]}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="font-medium">
                      <td />
                      <td>No tools were used.</td>
                      <td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <MemorySelect result={why.memory} />
          </div>
        </SidePanel>
      )}
    </div>
  );
}
