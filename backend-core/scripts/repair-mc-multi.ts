/**
 * One-off repair: merge consecutive multiple_choice_multiple items that were
 * committed as separate question_number items into a single question_numbers
 * item so the exam player renders them as a multi-select checkbox block.
 *
 * Detection heuristic: within a "Multiple Choice" question_group, consecutive
 * items that share the SAME question_text AND the SAME options fingerprint are
 * a multi-select pair that was incorrectly split at commit time.
 *
 * Run with:
 *   npx ts-node scripts/repair-mc-multi.ts [--dry-run]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");

// ─── helpers ──────────────────────────────────────────────────────────────────

function optionsFingerprint(opts: any): string {
  if (!opts || typeof opts !== "object") return "null";
  // Sort keys so insertion order doesn't matter
  const sorted: Record<string, string> = {};
  for (const k of Object.keys(opts).sort()) sorted[k] = opts[k];
  return JSON.stringify(sorted);
}

/**
 * Scan an array of question_group items and merge consecutive items that share
 * the same question_text + options fingerprint into a single question_numbers
 * item.  Returns the patched items array and a count of merges performed.
 */
function mergeGroupItems(items: any[]): { items: any[]; merges: number } {
  if (!Array.isArray(items) || items.length < 2) return { items, merges: 0 };

  const out: any[] = [];
  let merges = 0;

  for (const item of items) {
    // Skip items that are already in the correct merged format
    if (Array.isArray(item.question_numbers)) {
      out.push(item);
      continue;
    }

    // Only consider singular question_number items
    if (typeof item.question_number !== "number") {
      out.push(item);
      continue;
    }

    const fp = optionsFingerprint(item.options);
    const last = out[out.length - 1];

    const canMerge =
      last &&
      typeof last.question_number === "number" &&
      !Array.isArray(last.question_numbers) &&
      optionsFingerprint(last.options) === fp &&
      last.question_text === item.question_text;

    if (canMerge) {
      // Convert the previous singular item to a multi item and merge this one in
      const prevAnswer = last.answer;
      const currAnswer = item.answer;
      out[out.length - 1] = {
        question_numbers: [last.question_number, item.question_number],
        question_text: last.question_text,
        answer: [prevAnswer, currAnswer],
        explanation: last.explanation || item.explanation || null,
        options: last.options,
      };
      merges++;
    } else {
      out.push(item);
    }
  }

  return { items: out, merges };
}

/**
 * Recalculate the `questions` range string for a group after item merging.
 */
function recalcRange(group: any): void {
  const nums: number[] = group.items.flatMap((i: any) =>
    Array.isArray(i.question_numbers) ? i.question_numbers : [i.question_number]
  ).filter((n: any) => typeof n === "number");

  if (nums.length === 0) return;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  group.questions = min === max ? `${min}` : `${min}–${max}`;
}

/**
 * Walk the questions JSON of one exam, patch any broken MC groups, and return
 * the patched JSON plus a total merge count.  Returns null if no changes.
 */
function patchExamQuestions(questions: any): { patched: any; totalMerges: number } | null {
  if (!questions || typeof questions !== "object") return null;

  let totalMerges = 0;

  // Helper that processes a single skill object (has .parts[])
  function patchSkill(skillObj: any): void {
    if (!Array.isArray(skillObj?.parts)) return;
    for (const part of skillObj.parts) {
      if (!Array.isArray(part?.question_groups)) continue;
      for (const group of part.question_groups) {
        if (
          typeof group?.question_type !== "string" ||
          !group.question_type.toLowerCase().includes("multiple choice")
        ) continue;
        if (!Array.isArray(group.items)) continue;

        const { items, merges } = mergeGroupItems(group.items);
        if (merges > 0) {
          group.items = items;
          recalcRange(group);
          totalMerges += merges;
        }
      }
    }
  }

  // FULL_TEST shape: { listening: {...}, reading: {...} }
  if (questions.listening || questions.reading) {
    if (questions.listening) patchSkill(questions.listening);
    if (questions.reading) patchSkill(questions.reading);
  } else {
    // Single-skill shape: { parts: [...] }
    patchSkill(questions);
  }

  if (totalMerges === 0) return null;
  return { patched: questions, totalMerges };
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Scanning IeltsIntensiveExam records for broken mc_multi groups...`);
  if (DRY_RUN) console.log("   (DRY RUN — no DB writes)\n");

  const exams = await prisma.ieltsIntensiveExam.findMany({
    select: { id: true, title: true, type: true, questions: true },
  });

  console.log(`   Found ${exams.length} exams total.\n`);

  let patchedCount = 0;
  let totalMerges = 0;

  for (const exam of exams) {
    const result = patchExamQuestions(exam.questions as any);
    if (!result) continue;

    patchedCount++;
    totalMerges += result.totalMerges;

    console.log(`✅ Patching "${exam.title}" (${exam.id}) — ${result.totalMerges} merge(s)`);

    if (!DRY_RUN) {
      await prisma.ieltsIntensiveExam.update({
        where: { id: exam.id },
        data: { questions: result.patched },
      });
    }
  }

  console.log(`\n─────────────────────────────────────────────`);
  if (patchedCount === 0) {
    console.log("✨ No broken records found — nothing to repair.");
  } else {
    console.log(`📊 Repaired ${patchedCount} exam(s) with ${totalMerges} total merge(s).`);
    if (DRY_RUN) console.log("   (DRY RUN — re-run without --dry-run to apply)");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
