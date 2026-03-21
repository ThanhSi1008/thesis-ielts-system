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
    }
  | {
      kind: "mc_multi";
      qns: number[];
      prompt: string;
      options: Record<string, string>;
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
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({ kind: "mc_single", qn: it.question_number, prompt: it.question_text || it.question || "", options: it.options || {}, timestamp: it.timestamp_seconds });
          } else if (Array.isArray(it?.question_numbers)) {
            items.push({ kind: "mc_multi", qns: it.question_numbers, prompt: it.question_text || it.question || "", options: it.options || {}, maxSelect: 2 });
          }
        }
      } else if (qt.includes("matching") && Array.isArray(g?.items)) {
        const options = g?.options_box?.options || {};
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
      if (g?.topic && items.length > groupStartIdx) items[groupStartIdx].topic = g.topic;
      else if (part?.topic && groupStartIdx === 0 && items.length > 0) items[0].topic = part.topic;
    }
  }

  return items.sort((a, b) => ("qn" in a ? a.qn : a.qns[0]) - ("qn" in b ? b.qn : b.qns[0]));
}
