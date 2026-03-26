export type NormalizedItemBase = {
  topic?: string;
  timestamp?: number;
};

export type NormalizedItem = NormalizedItemBase & (
  | {
      kind: "mc_single";
      qn: number;
      prompt: string;
      options: Record<string, string>;
      isTrueFalse?: boolean;
      instructions?: string;
      qns?: number[];
    }
  | {
      kind: "mc_multi";
      qns: number[];
      prompt: string;
      options: Record<string, string>;
      instructions?: string;
      maxSelect: number;
    }
  | {
      kind: "matching_group";
      qns: number[];
      prompts: string[];
      options: Record<string, string>;
      heading?: string;
      instructions?: string;
      timestamp?: number;
    }
  | {
      kind: "note_completion" | "flowchart_completion" | "sentence_completion" | "short_answer";
      qn: number;
      text: string;
      heading?: string;
      subheading?: string;
      precedingText?: string[];
    }
  | {
      kind: "table_completion";
      qns: number[];
      rows: Array<Array<{ text: string; question_number?: number; timestamp?: number }>>;
      headers?: string[];
      title?: string;
    }
  | {
      kind: "plan_label";
      qn: number;
      imageUrl: string;
      prompt?: string;
    }
  | {
      kind: "summary_completion";
      qns: number[];
      text: string;
      heading?: string;
      options?: Record<string, string>;
      instructions?: string;
    }
);

export function extractAllItemsFromPart(part: any): NormalizedItem[] {
  const items: NormalizedItem[] = [];

  const parseContentList = (contentArr: any[]) => {
    for (const block of contentArr) {
      const heading = block?.heading || "";
      let blockHeadingAssigned = false;
      const subs = block?.subsections;
      if (Array.isArray(subs)) {
        for (const sub of subs) {
          const subheading = sub?.subheading || "";
          let subHeadingAssigned = false;
          let precedingText: string[] = [];

          for (const p of sub?.points ?? []) {
            if (typeof p?.question_number === "number") {
              const itemProps: any = { kind: "note_completion", qn: p.question_number, text: p.text, timestamp: p.timestamp_seconds };
              if (!blockHeadingAssigned && heading) { itemProps.heading = heading; blockHeadingAssigned = true; }
              if (!subHeadingAssigned && subheading) { itemProps.subheading = subheading; subHeadingAssigned = true; }
              if (precedingText.length > 0) { itemProps.precedingText = precedingText; precedingText = []; }
              items.push(itemProps);
            } else if (p?.text) {
               precedingText.push(p.text);
            }
          }
        }
      } else if (Array.isArray(block?.points)) {
        const hasBlockText = typeof block.text === "string" && block.text.trim().length > 0;
        const allPointsLackText = block.points.every((p: any) => typeof p?.question_number === "number" && !p.text);
        
        if (hasBlockText && allPointsLackText) {
            const qns = block.points.map((p: any) => p.question_number).filter((n: any) => typeof n === "number");
            if (qns.length > 0) {
                items.push({
                    kind: "summary_completion",
                    qns,
                    text: block.text,
                    heading: heading || block.heading,
                    // options will be attached later if this group has an options_box
                });
                continue;
            }
        }
        
        let precedingText: string[] = [];
        for (const p of block.points) {
          if (typeof p?.question_number === "number") {
            const itemProps: any = { kind: "note_completion", qn: p.question_number, text: p.text, timestamp: p.timestamp_seconds };
            if (!blockHeadingAssigned && heading) { itemProps.heading = heading; blockHeadingAssigned = true; }
            if (precedingText.length > 0) { itemProps.precedingText = precedingText; precedingText = []; }
            items.push(itemProps);
          } else if (p?.text) {
             precedingText.push(p.text);
          }
        }
      }
    }
  };

  const parseTable = (tableObj: any) => {
    if (Array.isArray(tableObj?.rows) && tableObj.rows.length > 0) {
      const qns: number[] = [];
      const parsedRows = tableObj.rows.map((row: any) => {
        if (!Array.isArray(row)) return [];
        return row.map((cell: any) => {
          if (typeof cell?.question_number === "number") {
            qns.push(cell.question_number);
          }
          return {
            text: cell?.text || "",
            question_number: cell?.question_number,
            timestamp: cell?.timestamp_seconds,
          };
        });
      });
      const headers: string[] | undefined = Array.isArray(tableObj?.headers)
        ? tableObj.headers.map((h: any) => String(h))
        : undefined;
      if (qns.length > 0 || parsedRows.length > 0) {
        items.push({ 
          kind: "table_completion", 
          qns, 
          rows: parsedRows,
          headers,
          title: tableObj?.title || tableObj?.name || tableObj?.heading || tableObj?.caption || "" 
        });
      }
    }
  };

  let topLevelStartIdx = items.length;
  if (Array.isArray(part?.content)) parseContentList(part.content);
  if (part?.table) parseTable(part.table);
  if (part?.topic && items.length > topLevelStartIdx) items[topLevelStartIdx].topic = part.topic;

  if (Array.isArray(part?.question_groups)) {
    for (const g of part.question_groups) {
      let groupStartIdx = items.length;
      if (Array.isArray(g?.content)) parseContentList(g.content);
      if (g?.table) parseTable(g.table);

      const qt = String(g?.question_type || "").toLowerCase();
      if (qt.includes("multiple choice") && Array.isArray(g?.items)) {
        let isFirst = true;
        const groupQns = g.items.map((i: any) => i.question_number || (Array.isArray(i.question_numbers) ? i.question_numbers[0] : null)).flat().filter(Boolean);

        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({ 
              kind: "mc_single", 
              qn: it.question_number, 
              prompt: it.question_text || it.question || "", 
              options: it.options || {}, 
              instructions: isFirst ? (g.instructions || "") : undefined,
              qns: isFirst ? groupQns : undefined,
              timestamp: it.timestamp_seconds 
            });
            isFirst = false;
          } else if (Array.isArray(it?.question_numbers)) {
            items.push({ 
              kind: "mc_multi", 
              qns: it.question_numbers, 
              prompt: it.question_text || it.question || "", 
              options: it.options || {}, 
              instructions: isFirst ? (g.instructions || "") : undefined,
              maxSelect: 2 
            });
            isFirst = false;
          }
        }
      } else if ((qt.includes("true/false/not given") || qt.includes("yes/no/not given")) && Array.isArray(g?.items)) {
        const isYesNo = qt.includes("yes/no");
        const tfOptions = (isYesNo 
           ? { "YES": "YES", "NO": "NO", "NOT GIVEN": "NOT GIVEN" }
           : { "TRUE": "TRUE", "FALSE": "FALSE", "NOT GIVEN": "NOT GIVEN" }) as Record<string, string>;

        let isFirst = true;
        const groupQns = g.items.map((i: any) => i.question_number).filter((n: any) => typeof n === "number");

        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({ 
              kind: "mc_single", 
              qn: it.question_number, 
              prompt: it.question_text || it.question || "", 
              options: tfOptions, 
              isTrueFalse: true,
              instructions: isFirst ? (g.instructions || "") : undefined,
              qns: isFirst ? groupQns : undefined,
              timestamp: it.timestamp_seconds 
            });
            isFirst = false;
          }
        }
      } else if (qt.includes("matching") && Array.isArray(g?.items)) {
        const options: Record<string, string> = g?.options_box?.options || {};
        
        // Auto-generate options grids if they are missing
        if (Object.keys(options).length === 0) {
          const instr = g?.instructions || "";
          const match = instr.match(/([A-Z])\s*[-–]\s*([A-Z])/i);
          if (match) {
            const startChar = match[1].toUpperCase().charCodeAt(0);
            const endChar = match[2].toUpperCase().charCodeAt(0);
            if (startChar < endChar && endChar - startChar < 26) {
              for (let c = startChar; c <= endChar; c++) {
                options[String.fromCharCode(c)] = "";
              }
            }
          }
        }
        const qns: number[] = [];
        const prompts: string[] = [];
        let firstTimestamp: number | undefined = undefined;
        
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
             qns.push(it.question_number);
             prompts.push(it.question_text || it.question || "");
             if (firstTimestamp === undefined && typeof it.timestamp_seconds === "number") {
               firstTimestamp = it.timestamp_seconds;
             }
          }
        }
        if (qns.length > 0) items.push({ kind: "matching_group", qns, prompts, options, heading: g?.heading || "", instructions: g?.instructions || "", timestamp: firstTimestamp });
      } else if (Array.isArray(g?.items)) {
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({ kind: "short_answer", qn: it.question_number, text: it.question_text || it.prompt || it.question || "", timestamp: it.timestamp_seconds });
          }
        }
      }
      
      // Merge consecutive summary_completion items in this group
      let firstSummaryIdx = -1;
      for (let i = groupStartIdx; i < items.length; i++) {
        if (items[i].kind === "summary_completion") {
          if (firstSummaryIdx === -1) {
            firstSummaryIdx = i;
          } else {
            const firstSummary = items[firstSummaryIdx] as any;
            const currentSummary = items[i] as any;
            firstSummary.qns.push(...currentSummary.qns);
            firstSummary.text = firstSummary.text.trim() + " " + currentSummary.text.trim();
            items.splice(i, 1);
            i--; // Adjust index since we removed an item
          }
        }
      }
      
      // Attach instructions, boundary arrays and options globally
      const optionsBox = g?.options_box?.options;
      const groupItems = items.slice(groupStartIdx);
      if (groupItems.length > 0) {
        const firstItem = groupItems[0] as any;
        const allQns: number[] = groupItems.flatMap((it: any) => it.qn ? [it.qn] : (it.qns || [])).filter(n => typeof n === "number");
        
        if (g?.instructions && !firstItem.instructions) {
          firstItem.instructions = g.instructions;
        }
        if (allQns.length > 0 && !firstItem.qns) {
          firstItem.qns = Array.from(new Set(allQns)).sort((a,b)=>a-b);
        }
        
        for (let i = groupStartIdx; i < items.length; i++) {
          if (["summary_completion", "note_completion", "table_completion"].includes(items[i].kind)) {
            if (optionsBox && Object.keys(optionsBox).length > 0) {
              (items[i] as any).options = optionsBox;
            }
          }
        }
      }
      if (g?.topic && items.length > groupStartIdx) items[groupStartIdx].topic = g.topic;
      else if (part?.topic && groupStartIdx === 0 && items.length > 0) items[0].topic = part.topic;
    }
  }

  return items.sort((a, b) => ("qn" in a ? a.qn : a.qns[0]) - ("qn" in b ? b.qn : b.qns[0]));
}
