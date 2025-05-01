import React, { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";

import "../css/style.css";

const ChatMessage = ({
  role,
  content,
  message,
  onReply,
  getReplyContentById,
  setReplyingTo,
}) => {
  const [replyPosition, setReplyPosition] = useState({ top: 0, left: 0 });
  const [showReply, setShowReply] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    Prism.highlightAll(); // ensure highlighting happens after render
  }, [content]);

  useEffect(() => {
    if (showReply) {
      const timer = setTimeout(() => setShowReply(false), 100000);
      return () => clearTimeout(timer);
    }
  }, [showReply]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selected = selection?.toString().trim();

      if (selected && content.includes(selected)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        if (message) {
          const selectedMessage =
            message && message?.content.includes(selected);

          if (selectedMessage) {
            setReplyPosition({
              top: rect.top + scrollY,
              left: rect.left + scrollX + rect.width,
            });
            setSelectedText(selected);
            setShowReply(true);
            setReplyingTo(selectedMessage); // Store the selected message to reply
          }
        } else {
          console.error("Messages is not an array:", message);
        }
      } else {
        setShowReply(false);
        setSelectedText("");
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);
  const handleReplyClick = () => {
    if (onReply && selectedText) {
      onReply(selectedText); // <- This seems to be where you are calling handleSelectReply
      setShowReply(false);
    }
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // bold
      .replace(/`(.+?)`/g, "<code>$1</code>"); // inline code
  };
  const mapLang = (lang) => {
    if (!lang) return "javascript";
    const aliases = {
      js: "javascript",
      py: "python",
      sh: "bash",
      json: "json",
      sql: "sql", // <-- important!
    };
    return aliases[lang] || lang;
  };

  const renderContent = () => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const beforeCode = content && content?.slice(lastIndex, match.index);
      if (beforeCode) {
        parts.push({ type: "text", content: beforeCode });
      }

      parts.push({
        type: "code",
        lang: mapLang(match[1]),
        code: match[2],
        // lang: match[1] || "javascript",
      });

      lastIndex = regex.lastIndex;
    }

    const afterLastCode = content && content?.slice(lastIndex);
    if (afterLastCode) {
      parts.push({ type: "text", content: afterLastCode });
    }

    return parts.map((part, i) =>
      part.type === "code" ? (
        <CodeBlock key={i} code={part.code} lang={part.lang} />
      ) : (
        <div key={i}>
          {part.content.split(/\n{2,}/).map((para, j) =>
            para.trim().startsWith("*") ? (
              <ul key={j} className="message-list">
                {para
                  .split("\n")
                  .filter((line) => line.trim().startsWith("*"))
                  .map((line, k) => (
                    <li
                      key={k}
                      dangerouslySetInnerHTML={{
                        __html: formatInline(line.replace(/^\* /, "")),
                      }}
                    />
                  ))}
              </ul>
            ) : (
              <p
                key={j}
                className="message-text"
                dangerouslySetInnerHTML={{
                  __html: formatInline(para),
                }}
              />
            )
          )}
        </div>
      )
    );

    // return (
    //   parts &&
    //   parts?.map((part, index) => {
    //     if (part.type === "code") {
    //       return <CodeBlock key={index} code={part.code} lang={part.lang} />;
    //     } else {
    //       const paragraphs =
    //         part &&
    //         part?.content?.split(/\n{2,}/).map((para, i) => {
    //           if (para?.trim().startsWith("*")) {
    //             const bullets =
    //               para &&
    //               para
    //                 ?.split("\n")
    //                 .filter((line) => line.trim().startsWith("*"))
    //                 .map((line, j) => (
    //                   <li
    //                     key={j}
    //                     dangerouslySetInnerHTML={{
    //                       __html: formatInline(line.replace(/^\* /, "")),
    //                     }}
    //                   />
    //                 ));
    //             return (
    //               <ul key={i} className="message-list">
    //                 {bullets}
    //               </ul>
    //             );
    //           }

    //           return (
    //             <p key={i} className="message-text" onClick={onReply}>
    //               {para &&
    //                 para?.split("\n").map((line, j) => (
    //                   <span
    //                     key={j}
    //                     dangerouslySetInnerHTML={{
    //                       __html: formatInline(line),
    //                     }}
    //                   />
    //                 ))}
    //             </p>
    //           );
    //         });

    //       return <div key={index}>{paragraphs}</div>;
    //     }
    //   })
    // );
  };

  return (
    <div className={`message ${role === "user" ? "user" : "bot"}`}>
      {message.replySnippet ? (
        <div className="reply-preview">
          <strong>Replying to:</strong> {message.replySnippet}
        </div>
      ) : message.replyTo ? (
        <div className="reply-preview">
          <strong>Replying to:</strong> {getReplyContentById(message.replyTo)}
        </div>
      ) : null}

      <div className="message-content">{renderContent()}</div>
      {showReply && (
        <button
          className="reply-btn-floating"
          onClick={handleReplyClick}
          style={{
            position: "absolute",
            top: `${replyPosition.top}px`,
            left: `${replyPosition.left}px`,
            zIndex: 1000,
          }}
        >
          ↩ Reply
        </button>
      )}
    </div>
  );
};

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-container">
      <button className="copy-button" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className={`language-${lang}`}>
        <code
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(
              code,
              Prism.languages[lang] || Prism.languages.javascript,
              lang
            ),
          }}
        />
      </pre>
    </div>
  );
};

export default ChatMessage;
