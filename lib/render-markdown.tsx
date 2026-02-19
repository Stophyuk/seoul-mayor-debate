import React from "react";

/**
 * Simple markdown-to-JSX renderer.
 * Supports **bold**, *italic*, and newline → <br/>.
 */
export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {lineIdx > 0 && <br />}
      {parseLine(line)}
    </React.Fragment>
  ));
}

function parseLine(line: string): React.ReactNode[] {
  // Match **bold** and *italic* patterns
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
