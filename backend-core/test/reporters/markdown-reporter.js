/**
 * Jest custom reporter — sinh bảng markdown tổng hợp kết quả test, format
 * khớp với mục 4.6.2 "Báo cáo kết quả kiểm thử" trong testing-sample.md
 * của khóa luận.
 *
 * Reporter này:
 *   1. Lắng nghe sự kiện `onRunComplete` của Jest.
 *   2. Trích TC ID (regex /^TC\d+_\d+/) từ tên test.
 *   3. Phân loại Valid / Invalid dựa trên describe block cha gần nhất có
 *      chứa "[Valid]" / "[Invalid]".
 *   4. Sinh hai bảng markdown:
 *        - Bảng tổng (Bảng 4.1 — Danh sách test case)
 *        - Bảng kết quả (Bảng 4.2 — Báo cáo kết quả kiểm thử)
 *   5. Ghi ra file path do option `outputPath` chỉ định (mặc định:
 *      `../docs/testing/test-results.md` — tức `docs/testing/` ngoài root).
 *
 * Đăng ký trong jest.config.ts:
 *   reporters: [
 *     'default',
 *     ['<rootDir>/../test/reporters/markdown-reporter.js',
 *       { outputPath: '../docs/testing/test-results.md',
 *         author: 'Tác giả' }],
 *   ]
 */

'use strict';

const fs = require('fs');
const path = require('path');

class MarkdownReporter {
  constructor(globalConfig, options = {}) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.outputPath = options.outputPath || '../docs/testing/test-results.md';
    this.author = options.author || 'Auto (Jest)';
    this.date = options.date || new Date().toISOString().slice(0, 10);
    this.title = options.title || 'Báo cáo kết quả kiểm thử (auto-generated)';
  }

  /**
   * @param {{ status: 'passed'|'failed'|'pending'|'todo'|'skipped',
   *           title: string, ancestorTitles: string[],
   *           duration: number, failureMessages?: string[] }} test
   */
  static parseTcId(testTitle) {
    const m = /^(TC\d+_\d+)\s*[:\-]?\s*/.exec(testTitle);
    return m ? m[1] : '—';
  }

  static parseDescription(testTitle) {
    return testTitle.replace(/^TC\d+_\d+\s*[:\-]?\s*/, '').trim();
  }

  /**
   * Trả về 'Valid' / 'Invalid' / '—' dựa trên describe ancestor.
   */
  static parseGroup(ancestorTitles) {
    const joined = ancestorTitles.join(' › ');
    if (/\[Invalid\]/i.test(joined)) return 'Invalid';
    if (/\[Valid\]/i.test(joined)) return 'Valid';
    return '—';
  }

  /**
   * Trả về tên TC group (TC01, TC02, …) từ describe gốc.
   */
  static parseTcGroup(ancestorTitles) {
    const top = ancestorTitles[0] || '';
    const m = /TC(\d+)/.exec(top);
    return m ? `TC${m[1]}` : '—';
  }

  static statusLabel(status) {
    switch (status) {
      case 'passed':
        return 'Pass';
      case 'failed':
        return 'Fail';
      case 'pending':
      case 'skipped':
        return 'Skipped';
      case 'todo':
        return 'TODO';
      default:
        return status || '—';
    }
  }

  static escapePipe(s) {
    return String(s).replace(/\|/g, '\\|');
  }

  onRunComplete(_contexts, results) {
    const rows = [];

    for (const fileResult of results.testResults) {
      const fileRel = path.relative(
        this.globalConfig.rootDir || process.cwd(),
        fileResult.testFilePath,
      );

      for (const t of fileResult.testResults) {
        rows.push({
          tcGroup: MarkdownReporter.parseTcGroup(t.ancestorTitles),
          tcId: MarkdownReporter.parseTcId(t.title),
          group: MarkdownReporter.parseGroup(t.ancestorTitles),
          description: MarkdownReporter.parseDescription(t.title),
          status: MarkdownReporter.statusLabel(t.status),
          duration: t.duration ?? 0,
          file: fileRel,
          ancestors: t.ancestorTitles,
        });
      }
    }

    // Sắp xếp theo TC group → TC ID → invalid trước valid
    rows.sort((a, b) => {
      if (a.tcGroup !== b.tcGroup) return a.tcGroup.localeCompare(b.tcGroup);
      if (a.tcId !== b.tcId) return a.tcId.localeCompare(b.tcId);
      return 0;
    });

    const totalPass = rows.filter((r) => r.status === 'Pass').length;
    const totalFail = rows.filter((r) => r.status === 'Fail').length;
    const totalSkip = rows.filter(
      (r) => r.status === 'Skipped' || r.status === 'TODO',
    ).length;

    const lines = [];
    lines.push(`# ${this.title}`);
    lines.push('');
    lines.push(
      `> **Sinh tự động:** ${new Date().toISOString()} — ` +
        `Tác giả: ${this.author}.`,
    );
    lines.push(
      `> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận ` +
        `(\`testing-sample.md\`).`,
    );
    lines.push('');

    // ─── Tổng hợp ───
    lines.push('## 1. Tổng hợp');
    lines.push('');
    lines.push('| Chỉ số | Giá trị |');
    lines.push('|---|---:|');
    lines.push(`| Số test case | ${rows.length} |`);
    lines.push(`| Pass | ${totalPass} |`);
    lines.push(`| Fail | ${totalFail} |`);
    lines.push(`| Skipped/TODO | ${totalSkip} |`);
    lines.push(`| Tổng thời gian (ms) | ${results.numTotalTestSuites && results.testResults.reduce((s, r) => s + (r.perfStats?.runtime || 0), 0)} |`);
    lines.push('');

    // ─── Bảng 4.1 — Danh sách test case ───
    lines.push('## 2. Bảng 4.1 — Danh sách test case');
    lines.push('');
    lines.push('| TH | Mã | Tình huống / Kết quả mong muốn | File |');
    lines.push('|---|---|---|---|');
    for (const r of rows) {
      const cell = MarkdownReporter.escapePipe(r.description);
      const file = MarkdownReporter.escapePipe(r.file);
      lines.push(
        `| ${r.tcGroup} | ${r.tcId} | ${cell} | \`${file}\` |`,
      );
    }
    lines.push('');

    // ─── Bảng 4.2 — Báo cáo kết quả ───
    lines.push('## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử');
    lines.push('');
    lines.push(
      '| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |',
    );
    lines.push(
      '|---|---|---|---|---|---:|---|---|',
    );
    for (const r of rows) {
      const cell = MarkdownReporter.escapePipe(r.description);
      lines.push(
        `| ${r.tcGroup} | ${r.group} | ${r.tcId} | ${cell} | ${r.status} | ${r.duration} | ${this.author} | ${this.date} |`,
      );
    }
    lines.push('');

    // ─── Section: liệt kê theo file ───
    lines.push('## 4. Chi tiết theo từng file spec');
    lines.push('');
    const byFile = new Map();
    for (const r of rows) {
      if (!byFile.has(r.file)) byFile.set(r.file, []);
      byFile.get(r.file).push(r);
    }
    for (const [file, items] of byFile.entries()) {
      lines.push(`### \`${file}\``);
      lines.push('');
      lines.push('| TC | Mô tả | Trạng thái | Thời gian (ms) |');
      lines.push('|---|---|---|---:|');
      for (const r of items) {
        lines.push(
          `| ${r.tcId} | ${MarkdownReporter.escapePipe(r.description)} | ${r.status} | ${r.duration} |`,
        );
      }
      lines.push('');
    }

    // ─── Footer ───
    lines.push('---');
    lines.push('');
    lines.push(
      `_File này được sinh tự động bởi \`test/reporters/markdown-reporter.js\` ` +
        `mỗi khi chạy \`npm test\` hoặc \`npm run test:unit\`._`,
    );

    const outputAbs = path.resolve(
      this.globalConfig.rootDir || process.cwd(),
      this.outputPath,
    );

    fs.mkdirSync(path.dirname(outputAbs), { recursive: true });
    fs.writeFileSync(outputAbs, lines.join('\n'), 'utf-8');

    // eslint-disable-next-line no-console
    console.log(
      `\n📝 Markdown test report đã ghi vào: ${path.relative(process.cwd(), outputAbs)}`,
    );
  }
}

module.exports = MarkdownReporter;
