/**
 * Minimal Markdown → HTML for Siept legal drafts.
 * No external deps. Keeps [PLACEHOLDER] brackets visible (highlighted).
 *
 * Supported: headings (#–######), paragraphs with hard line breaks (two
 * trailing spaces or a trailing backslash), **bold**, *italic*, `code`,
 * [links](https://…), backslash escapes, blockquotes (recursive), hr,
 * fenced code, pipe tables (with alignment and escaped \|), and ordered /
 * unordered lists with nesting by indentation.
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
  return escaped.replace(/\[([^\]]+)\]/g, '<span class="legal-ph">[$1]</span>');
}

const CODE_TOKEN = "\u0000";
const ESC_TOKEN = "\u0001";

function inlineFormat(raw: string): string {
  const codes: string[] = [];
  const escs: string[] = [];
  // protect inline code spans first (content stays literal)
  let s = raw.replace(/`([^`]+)`/g, (_m, c: string) => {
    codes.push(c);
    return `${CODE_TOKEN}${codes.length - 1}${CODE_TOKEN}`;
  });
  // backslash escapes: \* \_ \[ \| etc.
  s = s.replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, (_m, ch: string) => {
    escs.push(ch);
    return `${ESC_TOKEN}${escs.length - 1}${ESC_TOKEN}`;
  });
  s = escapeHtml(s);
  // links [text](url) — only safe schemes / relative paths
  s = s.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/|#)[^)\s]*)\)/g,
    (_m, text: string, href: string) => `<a href="${href}">${text}</a>`,
  );
  // bold **...** and italic *...* (underscore emphasis deliberately not
  // supported: the drafts use ____ as fill-in blanks)
  s = s.replace(/\*\*(?!\s)(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*(?![\s*])([^*]+?)\*(?![*\w])/g, "$1<em>$2</em>");
  // highlight placeholders like [NIF] (not inside anchors' href: brackets gone)
  s = markPlaceholders(s);
  s = s.replace(
    new RegExp(`${CODE_TOKEN}(\\d+)${CODE_TOKEN}`, "g"),
    (_m, n: string) => `<code>${markPlaceholders(escapeHtml(codes[Number(n)]))}</code>`,
  );
  s = s.replace(
    new RegExp(`${ESC_TOKEN}(\\d+)${ESC_TOKEN}`, "g"),
    (_m, n: string) => escapeHtml(escs[Number(n)]),
  );
  return s;
}

/** Join raw lines of one block, honouring hard breaks. */
function joinLines(rawLines: string[]): string {
  let html = "";
  rawLines.forEach((raw, idx) => {
    const hard = / {2,}$/.test(raw) || /\\$/.test(raw.trimEnd());
    const text = raw.trim().replace(/\\$/, "");
    html += inlineFormat(text);
    if (idx < rawLines.length - 1) html += hard ? "<br />\n" : " ";
  });
  return html;
}

const HR_RE = /^(-{3,}|\*{3,}|_{3,})$/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*$/;
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

function indentWidth(ws: string): number {
  return ws.replace(/\t/g, "    ").length;
}

function isTableSeparator(line: string | undefined): boolean {
  if (line === undefined) return false;
  const t = line.trim();
  return t.includes("-") && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(t);
}

function isTableStart(lines: string[], i: number): boolean {
  return lines[i].includes("|") && isTableSeparator(lines[i + 1]);
}

function parseTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim());
}

function parseAlign(sep: string): (string | null)[] {
  return parseTableRow(sep).map((c) => {
    const l = c.startsWith(":");
    const r = c.endsWith(":");
    if (l && r) return "center";
    if (r) return "right";
    if (l) return "left";
    return null;
  });
}

function isBlockStart(lines: string[], i: number): boolean {
  const t = lines[i].trim();
  return (
    t === "" ||
    HEADING_RE.test(t) ||
    t.startsWith(">") ||
    t.startsWith("```") ||
    HR_RE.test(t) ||
    LIST_RE.test(lines[i]) ||
    isTableStart(lines, i)
  );
}

type ListItem = { indent: number; ordered: boolean; num: number; lines: string[] };

function renderList(items: ListItem[]): string {
  const out: string[] = [];
  const stack: { indent: number; tag: "ul" | "ol" }[] = [];
  const open = (it: ListItem) => {
    const tag = it.ordered ? "ol" : "ul";
    const start = it.ordered && it.num !== 1 ? ` start="${it.num}"` : "";
    out.push(`<${tag}${start}>`);
    stack.push({ indent: it.indent, tag });
  };
  for (const it of items) {
    while (stack.length > 1 && it.indent < stack[stack.length - 1].indent) {
      out.push(`</li></${stack.pop()!.tag}>`);
    }
    const top = stack[stack.length - 1];
    if (!top) {
      open(it);
    } else if (it.indent > top.indent) {
      open(it); // nested inside the still-open <li>
    } else {
      const tag = it.ordered ? "ol" : "ul";
      if (top.tag !== tag) {
        out.push(`</li></${top.tag}>`);
        stack.pop();
        open(it);
      } else {
        out.push("</li>");
      }
    }
    out.push(`<li>${joinLines(it.lines)}`);
  }
  while (stack.length) out.push(`</li></${stack.pop()!.tag}>`);
  return out.join("\n");
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i += 1;
      continue;
    }

    // fenced code
    if (trimmed.startsWith("```")) {
      i += 1;
      const code: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(escapeHtml(lines[i]));
        i += 1;
      }
      i += 1;
      out.push(`<pre><code>${code.join("\n")}</code></pre>`);
      continue;
    }

    // table
    if (isTableStart(lines, i)) {
      const header = parseTableRow(line);
      const align = parseAlign(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      const cellAttr = (c: number) => (align[c] ? ` style="text-align:${align[c]}"` : "");
      const cell = (tag: "th" | "td", text: string, c: number) =>
        `<${tag}${cellAttr(c)}>${inlineFormat(text.replace(/\\\|/g, "|").replace(/\|/g, "\\|"))}</${tag}>`;
      out.push('<div class="legal-table-wrap"><table>');
      out.push(`<thead><tr>${header.map((h, c) => cell("th", h, c)).join("")}</tr></thead>`);
      out.push("<tbody>");
      for (const row of rows) {
        const cells = header.map((_h, c) => cell("td", row[c] ?? "", c));
        out.push(`<tr>${cells.join("")}</tr>`);
      }
      out.push("</tbody></table></div>");
      continue;
    }

    if (HR_RE.test(trimmed)) {
      out.push("<hr />");
      i += 1;
      continue;
    }

    const heading = HEADING_RE.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // blockquote: gather lines, render inner markdown recursively
    if (trimmed.startsWith(">")) {
      const inner: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        inner.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>\n${markdownToHtml(inner.join("\n"))}\n</blockquote>`);
      continue;
    }

    // lists (nested by indentation, continuation lines appended)
    if (LIST_RE.test(line)) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const m = LIST_RE.exec(lines[i]);
        if (m) {
          const marker = m[2];
          const ordered = /\d/.test(marker);
          items.push({
            indent: indentWidth(m[1]),
            ordered,
            num: ordered ? parseInt(marker, 10) : 0,
            lines: [m[3]],
          });
          i += 1;
          continue;
        }
        const t = lines[i].trim();
        if (t === "") {
          // allow blank lines between items / before an indented continuation
          let j = i;
          while (j < lines.length && lines[j].trim() === "") j += 1;
          if (j < lines.length && (LIST_RE.test(lines[j]) || /^\s{2,}\S/.test(lines[j]))) {
            i = j;
            continue;
          }
          break;
        }
        if (/^\s{2,}\S/.test(lines[i]) && !isTableStart(lines, i)) {
          items[items.length - 1].lines.push(lines[i]);
          i += 1;
          continue;
        }
        // lazy continuation of the last item (non-block line directly after)
        if (!isBlockStart(lines, i)) {
          items[items.length - 1].lines.push(lines[i]);
          i += 1;
          continue;
        }
        break;
      }
      out.push(renderList(items));
      continue;
    }

    // paragraph (merge consecutive non-block lines)
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && !isBlockStart(lines, i)) {
      para.push(lines[i]);
      i += 1;
    }
    const html = joinLines(para);
    if (/^\*Fim\b[^*]*\*$/.test(para.map((l) => l.trim()).join(" "))) {
      out.push(`<p class="legal-end">${html}</p>`);
    } else {
      out.push(`<p>${html}</p>`);
    }
  }

  return out.join("\n");
}
