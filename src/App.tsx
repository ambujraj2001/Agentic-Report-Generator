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
      parsedData: Papa.ParseResult<Record<string, string>>,
      uploadedFileName: string
    ) => {
      setParsedData(parsedData);
      setFileName(uploadedFileName);
      setHtmlReport(''); // Reset report when new CSV is uploaded
    },
    []
  );

  const handleReportGenerated = useCallback((htmlContent: string) => {
    setHtmlReport(htmlContent);
  }, []);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="2"
              x2="16"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="3"
              y1="10"
              x2="21"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1>Agentic Report Generator</h1>
        <p>Transform your CSV data into comprehensive analytical reports</p>
      </div>

      <div className="workflow-steps">
        <div
          className={`workflow-step ${parsedData ? 'workflow-step--completed' : 'workflow-step--active'}`}
        >
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Upload CSV</h3>
            <p>Select your data file</p>
          </div>
        </div>

        <div className="workflow-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline
              points="9,18 15,12 9,6"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div
          className={`workflow-step ${htmlReport ? 'workflow-step--completed' : parsedData ? 'workflow-step--active' : ''}`}
        >
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Generate Report</h3>
            <p>Process and analyze</p>
          </div>
        </div>

        <div className="workflow-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline
              points="9,18 15,12 9,6"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div
          className={`workflow-step ${htmlReport ? 'workflow-step--active' : ''}`}
        >
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Download Report</h3>
            <p>Get your HTML report</p>
          </div>
        </div>
      </div>

      <div className="components-grid">
        <div className="component-wrapper">
          <CSVUpload onUpload={handleCSVUpload} />
        </div>

        <div className="component-wrapper">
          <ReportGenerator
            parsedData={parsedData}
            fileName={fileName}
            onReportGenerated={handleReportGenerated}
          />
        </div>

        <div className="component-wrapper">
          <HTMLDownloader htmlContent={htmlReport} fileName={fileName} />
        </div>
      </div>

      <div className="app-footer">
        <p>© 2025 Agentic Report Generator.</p>
      </div>
    </div>
  );
};

export default App;
