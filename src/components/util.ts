import alasql from 'alasql';

type Row = Record<string, string>;

const HF_API_BASE = import.meta.env.VITE_HF_API_BASE as string;
const HF_MODEL = import.meta.env.VITE_HF_MODEL as string;
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY as string;

// ── LLM call ────────────────────────────────────────────────────────────────

export async function callLLM(
  prompt: string,
  systemMessage?: string
): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (systemMessage) {
    messages.push({ role: 'system', content: systemMessage });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${HF_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      temperature: 0.7,
      frequency_penalty: 0.3,
      repetition_penalty: 1.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HF API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function fetchPrompt(name: string): Promise<string> {
  const res = await fetch(`/${name}.txt`);
  if (!res.ok) throw new Error(`Failed to fetch prompt: ${name}.txt`);
  return res.text();
}

// ── Data helpers ─────────────────────────────────────────────────────────────

function formatAsCSV(rows: Row[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => row[h] ?? '').join(','));
  }
  return lines.join('\n');
}

// ── SQL execution via AlaSQL ─────────────────────────────────────────────────

function loadDataIntoAlaSQL(data: Row[]): void {
  alasql('DROP TABLE IF EXISTS data');
  alasql('CREATE TABLE data');
  alasql.tables['data'].data = structuredClone(data);
}

function parseSQLQueries(llmResponse: string): string[] {
  const sqlBlocks: string[] = [];
  const regex = /```sql\s*([\s\S]*?)```/gi;
  let match;
  while ((match = regex.exec(llmResponse)) !== null) {
    const block = match[1].trim();
    for (const stmt of block.split(';').map((s) => s.trim()).filter(Boolean)) {
      sqlBlocks.push(stmt);
    }
  }
  return sqlBlocks;
}

export interface QueryResult {
  query: string;
  result: unknown;
  error?: string;
}

export function runQueries(
  data: Row[],
  queries: string[]
): QueryResult[] {
  loadDataIntoAlaSQL(data);
  return queries.map((query) => {
    try {
      const result = alasql(query);
      return { query, result };
    } catch (e) {
      return { query, result: null, error: String(e) };
    }
  });
}

function formatQueryResults(results: QueryResult[]): string {
  return results
    .map((r, i) => {
      const header = `-- Query ${i + 1}: ${r.query}`;
      if (r.error) return `${header}\nERROR: ${r.error}`;
      return `${header}\n${JSON.stringify(r.result, null, 2)}`;
    })
    .join('\n\n');
}

// ── Pipeline steps ───────────────────────────────────────────────────────────

export interface BlueprintResult {
  raw: string;
  blueprint: string;
  queries: string[];
}

/**
 * Step 1 — Send headers + 5 sample rows to the LLM.
 * Returns a blueprint and SQL queries to run against the full dataset.
 */
export async function generateBlueprintAndQueries(
  data: Row[]
): Promise<BlueprintResult> {
  const template = await fetchPrompt('generateReportBlueprint');
  const sample = formatAsCSV(data.slice(0, 5));
  const meta = `Total rows: ${data.length}\nColumns: ${Object.keys(data[0] ?? {}).join(', ')}`;
  const prompt = `${template}\n\n${meta}\n\n${sample}`;

  const raw = await callLLM(prompt);
  const queries = parseSQLQueries(raw);

  const blueprint = raw
    .replace(/```sql[\s\S]*?```/gi, '')
    .trim();

  return { raw, blueprint, queries };
}

/**
 * Step 2 — Run the SQL queries locally via AlaSQL.
 */
export function executeQueries(
  data: Row[],
  queries: string[]
): QueryResult[] {
  return runQueries(data, queries);
}

/**
 * Step 3 — Send the blueprint + query results to the LLM to build the report.
 */
const REPORT_SYSTEM_MSG = [
  'You are an HTML report generator.',
  'You output ONLY a single, complete, valid HTML document — nothing else.',
  'The document must start with <!DOCTYPE html> and end with </html>.',
  'Every opened tag must be closed. The HTML must render correctly in a browser.',
  'Do NOT output markdown, explanations, or commentary — ONLY the HTML.',
  'Keep the report concise: aim for under 300 lines of HTML.',
].join(' ');

export async function generateReport(
  blueprint: string,
  queryResults: QueryResult[]
): Promise<string> {
  const template = await fetchPrompt('reportGenerator');
  const resultsText = formatQueryResults(queryResults);
  const prompt = `${template}\n\n**BLUEPRINT:**\n${blueprint}\n\n**QUERY RESULTS (computed from the full dataset):**\n${resultsText}`;

  const result = await callLLM(prompt, REPORT_SYSTEM_MSG);

  const htmlMatch = result.match(/```html\s*([\s\S]*?)```/i);
  if (htmlMatch) return htmlMatch[1].trim();

  const docMatch = result.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i);
  if (docMatch) return docMatch[1].trim();

  return result.trim();
}
