# How to Compile the Research Paper

## Prerequisites

Make sure **MiKTeX** is installed on your system. You can verify by running:
```powershell
pdflatex -version
```

---

## Step 1: Check Your Folder Structure

Before compiling, ensure the following folders are located **inside** the `research_paper` directory (next to `research_paper.tex`):

```
research_paper/
├── research_paper.tex
├── figures/           ← SVG/PNG figures go here
└── paper_charts/      ← Chart PNG images go here
```

> This is required because the `.tex` file looks for images using:
> ```latex
> \graphicspath{{figures/}{paper_charts/}}
> ```
> If either folder is missing from this directory, the compiler will fail to find the images.

---

## Step 2: Open a Terminal

Open **PowerShell** or **Command Prompt** and navigate to the `research_paper` folder:

```powershell
cd "C:\Users\Admin\Desktop\thesis\my videos\thesis-ielts-system\_extras\research_paper"
```

---

## Step 3: Compile the PDF

Run this single command:

```powershell
pdflatex research_paper.tex
```

The output `research_paper.pdf` will be generated in the same folder.

---

## (Optional) Full Compile Sequence with Bibliography

If you update citations or references (`.bib` file), run the full sequence to ensure cross-references and citations are correct:

```powershell
pdflatex research_paper.tex
bibtex research_paper
pdflatex research_paper.tex
pdflatex research_paper.tex
```

> **Why 4 runs?** LaTeX needs multiple passes to resolve cross-references and bibliography entries correctly.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `File 'xxx.png' not found` | Image folder missing from `research_paper/` | Copy `figures/` and `paper_charts/` into the `research_paper/` folder |
| `pdflatex` not recognized | MiKTeX not installed or not in PATH | Reinstall MiKTeX from [miktex.org](https://miktex.org/) |
| Cross-references wrong | Only ran `pdflatex` once | Run `pdflatex` a second time |
