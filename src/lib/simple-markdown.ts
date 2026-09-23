/**
 * Minimal Markdown → HTML for Siept legal drafts.
 * No external deps. Keeps [PLACEHOLDER] brackets visible.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Highlight [PLACEHOLDER]-style tokens after escaping. */
function markPlaceholders(escaped: string): string {
  return escaped.replace(
    /\[([^\]]+)\]/g,
    '<span class="legal-ph">[$1]</span>',
  );
}

function inlineFormat(raw: string): string {
  let s = escapeHtml(raw);
  // inline code `...` (before bold so * inside code stays plain)
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bold **...**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // highlight placeholders like [NIF]
  s = markPlaceholders(s);
  return s;
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:-]+\|[\s|:-]*$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inUl = false;
  let inOl = false;
  let inBq = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };
  const closeBq = () => {
    if (inBq) {
      out.push("</blockquote>");
      inBq = false;
    }
  };
  const closeBlocks = () => {
    closeLists();
    closeBq();
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank
    if (trimmed === "") {
      closeBlocks();
      i += 1;
      continue;
    }

    // fenced code — not used in drafts, skip safely
    if (trimmed.startsWith("```")) {
      closeBlocks();
      i += 1;
      const code: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(escapeHtml(lines[i]));
        i += 1;
      }
      i += 1; // closing fence
      out.push(`<pre><code>${code.join("\n")}</code></pre>`);
      continue;
    }

    // table
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      closeBlocks();
      const header = parseTableRow(trimmed);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      out.push("<div class=\"legal-table-wrap\"><table>");
      out.push("<thead><tr>");
      for (const h of header) out.push(`<th>${inlineFormat(h)}</th>`);
      out.push("</tr></thead><tbody>");
      for (const row of rows) {
        out.push("<tr>");
        for (const cell of row) out.push(`<td>${inlineFormat(cell)}</td>`);
        out.push("</tr>");
      }
      out.push("</tbody></table></div>");
      continue;
    }

    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeBlocks();
      out.push("<hr />");
      i += 1;
      continue;
    }

    // headings
    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeBlocks();
      const level = heading[1].length;
      out.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      closeLists();
      if (!inBq) {
        out.push("<blockquote>");
        inBq = true;
      }
      const text = trimmed.replace(/^>\s?/, "");
      out.push(`<p>${inlineFormat(text)}</p>`);
      i += 1;
      continue;
    }
    if (inBq) closeBq();

    // unordered list
    const ul = /^[-*]\s+(.+)$/.exec(trimmed);
    if (ul) {
      closeBq();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inlineFormat(ul[1])}</li>`);
      i += 1;
      continue;
    }

    // ordered list
    const ol = /^(\d+)\.\s+(?!\d)(.+)$/.exec(trimmed);
    if (ol) {
      closeBq();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inlineFormat(ol[2])}</li>`);
      i += 1;
      continue;
    }

    // paragraph (merge consecutive non-blank non-special lines)
    closeLists();
    const para: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        next === "" ||
        next.startsWith("#") ||
        next.startsWith(">") ||
        next.startsWith("-") ||
        next.startsWith("*") ||
        next.startsWith("```") ||
        /^(\d+)\.\s+(?!\d)/.test(next) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(next) ||
        (next.includes("|") &&
          i + 1 < lines.length &&
          isTableSeparator(lines[i + 1]))
      ) {
        break;
      }
      para.push(next);
      i += 1;
    }
    const joined = para.join(" ");
    // italic line at end (*Fim...*)
    if (/^\*[^*]+\*$/.test(joined)) {
      out.push(`<p class="legal-end"><em>${inlineFormat(joined.slice(1, -1))}</em></p>`);
    } else {
      out.push(`<p>${inlineFormat(joined)}</p>`);
    }
  }

  closeBlocks();
  return out.join("\n");
}
