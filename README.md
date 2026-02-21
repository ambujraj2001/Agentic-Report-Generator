# Agentic Report Generator

Upload a CSV file and get a comprehensive, executive-ready HTML report — powered by an LLM that writes its own SQL queries, executes them against your full dataset in the browser, and builds the report from real computed results.

## How It Works

The app uses a 3-step agentic pipeline:

```
Step 1: LLM sees column headers + 5 sample rows
        → Generates a report blueprint + SQL queries

Step 2: AlaSQL runs those SQL queries on the FULL dataset (in-browser, instant)
        → Returns precise aggregations, breakdowns, and metrics

Step 3: LLM receives the blueprint + query results
        → Generates a complete, self-contained HTML report
```

This approach means the LLM decides **what** to analyze (by writing SQL), while the actual number-crunching happens locally on all your data — no approximations, no sampling.

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 4** — Styling (dark theme)
- **AlaSQL** — In-browser SQL engine for running queries on CSV data
- **PapaParse** — CSV parsing
- **Hugging Face Inference API** — LLM provider (Qwen 2.5 Coder 32B)

## Getting Started

### Prerequisites

- Node.js 18+
- A Hugging Face API key ([get one here](https://huggingface.co/settings/tokens))

### Setup

```bash
git clone https://github.com/ambujraj2001/agentic-report-generator.git
cd agentic-report-generator
npm install
```

Create a `.env` file in the root directory:

```env
VITE_HF_API_BASE=https://router.huggingface.co/v1
VITE_HF_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
VITE_HF_API_KEY=your_huggingface_api_key_here
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build

```bash
npm run build
npm run preview
```

## Usage

1. **Upload** — Drag and drop a CSV file (or click to browse)
2. **Generate** — Click "Generate Report" — the app will plan the analysis, run SQL queries, and build the report
3. **Export** — Preview the report in-app, download as `.html`, or copy the HTML to clipboard

## Project Structure

```
src/
├── App.tsx                          # Main layout (3-column dashboard)
├── index.css                        # Tailwind imports + custom utilities
├── main.tsx                         # Entry point
└── components/
    ├── CSVUpload.tsx                 # Drag-and-drop CSV upload
    ├── ReportGenerator.tsx           # Orchestrates the 3-step pipeline
    ├── HTMLDownloader.tsx            # Preview, download, and copy report
    └── util.ts                      # LLM calls, AlaSQL execution, pipeline logic

public/
├── generateReportBlueprint.txt      # Prompt template: blueprint + SQL generation
└── reportGenerator.txt              # Prompt template: HTML report generation
```

## Configuration

You can swap the LLM model by changing `VITE_HF_MODEL` in `.env`. Any model available on the [Hugging Face Inference API](https://huggingface.co/inference/models) that supports the OpenAI-compatible chat completions endpoint will work. Code-specialized models (like Qwen Coder) tend to produce better HTML output.
