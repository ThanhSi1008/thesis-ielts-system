# Problem Analysis: Incomplete Exercise Ingestion

## Summary
The `transform-vocabulary.mjs` script, which converts raw JSON data into Prisma seeder data, contains logic that inadvertently filters out valid exercises. This results in units showing only 10 or 15 questions instead of the expected 20.

## Technical Root Causes

### 1. Strict Question Text Validation
In `transform-vocabulary.mjs` (Line 100-101):
```javascript
const questionText = stripHtml(content.replace(/<ul[\s\S]*<\/ul>/, ''));
if (!questionText) continue;
```
**Issue**: In "Exercise 2" of Unit 1, the questions are structured as follows:
```html
<li class='answer-the-questions-section' answer-index='0'>
  <ul class='ul-choose-answer'>
    <li>____ a. A clever person...</li>
    <li>____ b. When a plane arrives...</li>
  </ul>
</li>
```
There is NO text inside the `<li>` outside of the `<ul>`. The script interprets this as an empty question and skips it entirely. This accounts for **10 missing questions** in Unit 1.

### 2. Regex Pattern Mismatch for Multiple Answers
The regex used to find exercises expects a single digit for the `answer-index` (Line 70):
```javascript
const liRegex = /<li[^>]*?answer-index=['"](\d+)['"]/g;
```
**Issue**: In "Exercise 1 Part A" of Unit 2, questions have multiple correct answers:
```html
<li answer-index='0,1' class='answer-the-questions-section'>
```
The string `0,1` does not match `\d+`. Consequently, the regex fails to find these list items, and they are ignored. This accounts for **5 missing questions** in Unit 2.

### 3. Missing Exercise Block Slicing
The script iterates over `exerciseEntries`, but if the HTML structure within those entries varies significantly (e.g., nesting multiple `<h4>` parts), the regex-based splitting can sometimes fail to catch subsequent blocks if they don't match the expected `answer-the-questions-section` class name exactly.

## Recommended Fixes
1. **Relax Question Text Requirement**: Allow questions with empty prompts if they have a valid `ul-choose-answer` list. Default the text to the parent `<h4>` instruction if available.
2. **Update Answer Index Regex**: Change `(\d+)` to `([^'"]+)` and use `.split(',')` to handle multiple indices (though the current database schema `answer: string` may need to store these as a comma-separated string or just take the first one).
3. **Instruction Context**: Track the current `<h4>` header during parsing to provide better context for questions with empty text.
