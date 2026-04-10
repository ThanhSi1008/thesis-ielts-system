import { ContentGroup } from "./SharedExerciseTypes";
import { FormPoint } from "../../../../../components/listening-renders/FormCompletionGroup";
import { TableGroup } from "../../../../../components/listening-renders/TableCompletionGroup";
import { FlowChartGroup } from "../../../../../components/listening-renders/FlowChartCompletionGroup";
import { MCQuestion } from "../../../../../components/listening-renders/MCQuestionItem";
import { SummaryGroup } from "../../../../../components/listening-renders/SummaryCompletionGroup";
import { MatchingGroup } from "../../../../../components/listening-renders/MatchingGroup";
import { MapLabellingGroupType } from "../../../../../components/listening-renders/MapLabellingGroup";
import { DiagramLabellingGroupType } from "../../../../../components/listening-renders/DiagramLabellingGroup";
import { ShortAnswerGroupType } from "../../../../../components/listening-renders/ShortAnswerGroup";

export function calcScore(
  content: ContentGroup[],
  answers: Record<string | number, string>
): number {
  let s = 0;
  content.forEach((g, gi) => {
    if (g.type === "multiple_choice_multiple") {
      const answers_arr = (g.answers as string[] | undefined) ?? [];
      const key = `mcm-${gi}`;
      const raw = (answers[key] as unknown as string) ?? "";
      const selected = raw ? raw.split(",").map((x) => x.toUpperCase()) : [];
      const correct = new Set(answers_arr.map((a) => a.toUpperCase()));
      if (selected.length === correct.size && selected.every((x) => correct.has(x))) s++;
    } else if (g.type === "table") {
      const rows = (g as unknown as TableGroup).rows;
      rows.forEach((row) => {
        Object.entries(row.questions).forEach(([k, qData]) => {
          const userAns = (answers[Number(k)] as unknown as string ?? "").trim().toLowerCase();
          if (userAns === qData.answer.trim().toLowerCase()) s++;
        });
      });
    } else if (g.type === "flow_chart") {
      const fc = g as unknown as FlowChartGroup;
      fc.steps.filter((step) => step.question).forEach((step) => {
        const q = step.question! as unknown as { question_number: number; letter_answer?: string; text_answer?: string };
        const userAns = answers[q.question_number] as string ?? "";
        if (q.letter_answer && userAns.toUpperCase() === q.letter_answer.toUpperCase()) s++;
        else if (!q.letter_answer && q.text_answer && userAns.trim().toLowerCase() === q.text_answer.trim().toLowerCase()) s++;
      });
    } else if (!g.type && Array.isArray((g as any).points)) {
      ((g as any).points as FormPoint[]).forEach((p) => {
        const userAns = (answers[p.question_number] as unknown as string ?? "").trim().toLowerCase();
        if (userAns === p.answer.trim().toLowerCase()) s++;
      });
    } else if (g.type === "summary_completion") {
      const sg = g as unknown as SummaryGroup;
      Object.entries(sg.questions).forEach(([k, qData]) => {
        const userAns = (answers[Number(k)] as unknown as string ?? "").trim().toLowerCase();
        const acceptable = qData.acceptable_answers
          ? qData.acceptable_answers.map((a) => a.toLowerCase().trim())
          : [qData.primary_answer.toLowerCase().trim()];
        if (acceptable.includes(userAns)) s++;
      });
    } else if (g.type === "matching") {
      const mg = g as unknown as MatchingGroup;
      Object.entries(mg.answers).forEach(([k, qData]) => {
        const userAns = (answers[Number(k)] as string ?? "").toUpperCase();
        if (userAns === qData.letter.toUpperCase()) s++;
      });
    } else if (g.type === "map_labelling" || g.type === "plan_labelling") {
      const ml = g as unknown as MapLabellingGroupType;
      if (ml.items) {
        ml.items.forEach((item) => {
          const userAns = (answers[item.question_number] as string ?? "").toUpperCase();
          if (userAns === item.answer.toUpperCase()) s++;
        });
      }
    } else if (g.type === "diagram_labelling") {
      const dg = g as unknown as DiagramLabellingGroupType;
      dg.items.forEach((item) => {
        const userAns = (answers[item.question_number] as string ?? "").toUpperCase();
        if (userAns === item.answer.toUpperCase()) s++;
      });
    } else if (g.type === "short_answer") {
      const sg = g as unknown as ShortAnswerGroupType;
      sg.questions.forEach((q) => {
        const userAns = (answers[q.question_number] as string ?? "").trim().toLowerCase();
        const acceptable = q.acceptable_answers
          ? q.acceptable_answers.map((a) => a.toLowerCase().trim())
          : [q.answer.toLowerCase().trim()];
        if (acceptable.includes(userAns)) s++;
      });
    } else if (g.type === "flowchart_completion") {
      const qs = Array.isArray(g.questions) ? (g.questions as Array<{ question_number: number; answer: string; acceptable_answers?: string[] }>) : [];
      qs.forEach((q) => {
        const userAns = (answers[q.question_number] as string ?? "").trim().toLowerCase();
        const acceptable = q.acceptable_answers
          ? q.acceptable_answers.map(a => a.toLowerCase().trim())
          : [q.answer.toLowerCase().trim()];
        if (acceptable.includes(userAns)) s++;
      });
    } else if (g.type === "note_completion") {
      const qs = Array.isArray(g.questions) ? (g.questions as Array<{ question_number: number; answer: string; acceptable_answers?: string[] }>) : [];
      qs.forEach((q) => {
        const userAns = (answers[q.question_number] as string ?? "").trim().toLowerCase();
        const acceptable = q.acceptable_answers
          ? q.acceptable_answers.map(a => a.toLowerCase().trim())
          : [q.answer.toLowerCase().trim()];
        if (acceptable.includes(userAns)) s++;
      });
    } else {
      const qs = Array.isArray(g.questions) ? (g.questions as MCQuestion[]) : [];
      qs.forEach((q) => {
        if (answers[q.question_number]?.toUpperCase() === q.answer?.toUpperCase()) s++;
      });
    }
  });
  return s;
}

export function getTrackerItems(content: ContentGroup[]) {
  return content.flatMap((g, gi) => {
    if (g.type === "multiple_choice_multiple") {
      const nums = (g.question_numbers as number[] | undefined) ?? [];
      return nums.map((n) => ({ qNum: n, groupKey: `mcm-${gi}` }));
    }
    if (!g.type && Array.isArray((g as any).points)) {
      return ((g as any).points as FormPoint[]).map((p) => ({ qNum: p.question_number, groupKey: String(p.question_number) }));
    }
    if (g.type === "table") {
      const rows = (g as unknown as TableGroup).rows;
      return rows.flatMap((row) => Object.keys(row.questions).map((k) => ({ qNum: Number(k), groupKey: k })));
    }
    if (g.type === "flow_chart") {
      const fc = g as unknown as FlowChartGroup;
      return fc.steps.filter((s) => s.question).map((s) => ({ qNum: s.question!.question_number, groupKey: String(s.question!.question_number) }));
    }
    if (g.type === "summary_completion") {
      const sg = g as unknown as SummaryGroup;
      return Object.keys(sg.questions).map((k) => ({ qNum: Number(k), groupKey: k }));
    }
    if (g.type === "matching") {
      const mg = g as unknown as MatchingGroup;
      return mg.items.map((i) => ({ qNum: i.id, groupKey: String(i.id) }));
    }
    if (g.type === "map_labelling" || g.type === "plan_labelling") {
      const ml = g as unknown as MapLabellingGroupType;
      if (ml.items) return ml.items.map((i) => ({ qNum: i.question_number, groupKey: String(i.question_number) }));
      const qs = (g as any).questions || [];
      return qs.map((q: any) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
    }
    if (g.type === "diagram_labelling") {
      const dg = g as unknown as DiagramLabellingGroupType;
      return dg.items.map((i) => ({ qNum: i.question_number, groupKey: String(i.question_number) }));
    }
    if (g.type === "short_answer") {
      const qs = (g as unknown as ShortAnswerGroupType).questions;
      return qs.map((q) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
    }
    if (g.type === "note_completion") {
      const qs = Array.isArray(g.questions) ? (g.questions as Array<{ question_number: number }>) : [];
      return qs.map((q) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
    }
    const qs = Array.isArray(g.questions) ? (g.questions as MCQuestion[]) : [];
    return qs.map((q) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
  });
}
