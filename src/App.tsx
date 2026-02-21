import React, { useState, useCallback } from 'react';
import { HTMLDownloader } from './components/HTMLDownloader';
import { ReportGenerator } from './components/ReportGenerator';
import { CSVUpload } from './components/CSVUpload';
import Papa from 'papaparse';

const App: React.FC = () => {
  const [parsedData, setParsedData] = useState<Papa.ParseResult<
    Record<string, string>
  > | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [htmlReport, setHtmlReport] = useState<string>('');

  const handleCSVUpload = useCallback(
    (
      data: Papa.ParseResult<Record<string, string>>,
      uploadedFileName: string
    ) => {
      setParsedData(data);
      setFileName(uploadedFileName);
      setHtmlReport('');
    },
    []
  );

  const handleReportGenerated = useCallback((htmlContent: string) => {
    setHtmlReport(htmlContent);
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined block text-3xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Agentic Report Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Transform your CSV data into comprehensive analytical reports
            </p>
          </div>
        </div>
      </header>

      {/* Workflow columns */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Upload */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                parsedData
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-white'
              }`}
            >
              {parsedData ? '✓' : '1'}
            </span>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500">
              Upload Data
            </h2>
          </div>
          <CSVUpload onUpload={handleCSVUpload} />
        </section>

        {/* Column 2: Generate */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                htmlReport
                  ? 'bg-emerald-500 text-white'
                  : parsedData
                    ? 'bg-primary text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {htmlReport ? '✓' : '2'}
            </span>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500">
              Analyze & Generate
            </h2>
          </div>
          <ReportGenerator
            parsedData={parsedData}
            fileName={fileName}
            onReportGenerated={handleReportGenerated}
          />
        </section>

        {/* Column 3: Export */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                htmlReport
                  ? 'bg-primary text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              3
            </span>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500">
              Export Report
            </h2>
          </div>
          <HTMLDownloader htmlContent={htmlReport} fileName={fileName} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              System Status
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold">Operational</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Engine
            </span>
            <span className="text-sm font-bold">Qwen 2.5 Coder 32B</span>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Agentic Report Generator. All processing is private.
        </div>
      </footer>
    </div>
  );
};

export default App;
