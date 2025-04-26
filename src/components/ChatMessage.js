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

const ChatMessage = ({ role, content }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll(); // ensure highlighting happens after render
  }, [content]);
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
      const beforeCode = content.slice(lastIndex, match.index);
      if (beforeCode) {
        parts.push({ type: "text", content: beforeCode });
      }

      parts.push({
        type: "code",
        // lang: match[1] || "javascript",
        lang: mapLang(match[1]),
        code: match[2],
      });

      lastIndex = regex.lastIndex;
    }

    const afterLastCode = content.slice(lastIndex);
    if (afterLastCode) {
      parts.push({ type: "text", content: afterLastCode });
    }

    return parts.map((part, index) => {
      if (part.type === "code") {
        // const handleCopy = () => {
        //   navigator.clipboard.writeText(part.code);
        //   setCopied(true);
        //   setTimeout(() => setCopied(false), 2000);
        // };
        // return (
        //   <div key={index} className="code-container">
        //     <button className="copy-button" onClick={handleCopy}>
        //       {copied ? "Copied!" : "Copy"}
        //     </button>
        //     <pre className={`language-${part.lang}`}>
        //       <code
        //         dangerouslySetInnerHTML={{
        //           __html: Prism.highlight(
        //             part.code,
        //             Prism.languages[part.lang] || Prism.languages.javascript,
        //             part.lang
        //           ),
        //         }}
        //       />
        //     </pre>
        //   </div>
        // );

        return <CodeBlock key={index} code={part.code} lang={part.lang} />;
      } else {
        // Enhanced paragraph rendering
        const paragraphs = part.content.split(/\n{2,}/).map((para, i) => {
          // Bullet point detection and rendering
          if (para.trim().startsWith("* ")) {
            const bullets = para
              .split("\n")
              .filter((line) => line.trim().startsWith("* "))
              .map((line, j) => (
                <li
                  key={j}
                  dangerouslySetInnerHTML={{
                    __html: formatInline(line.replace(/^\* /, "")),
                  }}
                />
              ));
            return (
              <ul key={i} className="message-list">
                {bullets}
              </ul>
            );
          }

          return (
            <p key={i} className="message-text">
              {para.split("\n").map((line, j) => (
                <span
                  key={j}
                  dangerouslySetInnerHTML={{ __html: formatInline(line) }}
                />
              ))}
            </p>
          );
        });

        return <div key={index}>{paragraphs}</div>;
      }
    });
  };

  return (
    <div className={`message ${role === "user" ? "user" : "bot"}`}>
      {renderContent()}
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
