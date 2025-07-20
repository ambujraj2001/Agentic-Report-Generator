import React, { useCallback, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  generateBluePrintForReport,
  generateChunkSummary,
  generateReport,
} from './util';

interface ReportGeneratorProps {
  parsedData: Papa.ParseResult<Record<string, string>> | null;
  fileName: string;
  onReportGenerated: (htmlContent: string) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  parsedData,
  fileName,
  onReportGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!parsedData) return;

    setIsGenerating(true);
    setProgress(0);
    setIsGenerated(false);

    try {
      // Calculate chunks
      const chunkSize = 10;
      const mainDataChunks: Record<string, string>[][] = [];
      for (let i = 0; i < parsedData.data.length; i += chunkSize) {
        mainDataChunks.push(parsedData.data.slice(i, i + chunkSize));
      }

      const totalAPICalls = mainDataChunks.length + 1; // +1 for final report
      const callsPerStep = 2;
      let completedCalls = 0;

      // Dynamic step messages based on actual processing
      const dynamicSteps = [
        'Loading data and initializing...',
        'Reviewing dataset structure...',
        'Extracting key insights...',
        'Building executive dashboard...',
        'Designing visual charts and metrics...',
        'Processing data chunks...',
        'Analyzing patterns and trends...',
        'Finalizing report layout...',
        'Applying professional styling...',
        'Wrapping up and preparing download...',
      ];

      // Function to get current step message
      const getCurrentStepMessage = (
        completedCalls: number,
        totalCalls: number
      ) => {
        const stepIndex = Math.floor(
          (completedCalls / totalCalls) * dynamicSteps.length
        );
        return dynamicSteps[Math.min(stepIndex, dynamicSteps.length - 1)];
      };

      // Update progress function
      const updateProgress = () => {
        const overallProgress = (completedCalls / totalAPICalls) * 100;
        setProgress(overallProgress);
        setCurrentStep(getCurrentStepMessage(completedCalls, totalAPICalls));
      };

      // Initial step
      updateProgress();

      // Generate blueprint
      const reportBlueprint = await generateBluePrintForReport(
        parsedData.data.slice(0, 5)
      );
      completedCalls++;
      updateProgress();

      // Process chunks in batches to show progress every 2 calls
      const chunkSummaries: string[] = [];

      for (let i = 0; i < mainDataChunks.length; i++) {
        const chunkSummary = await generateChunkSummary(
          mainDataChunks[i],
          reportBlueprint
        );
        chunkSummaries.push(chunkSummary);
        completedCalls++;
        updateProgress();

        // Show progress every 2 completed calls or at the end
        if (
          completedCalls % callsPerStep === 0 ||
          i === mainDataChunks.length - 1
        ) {
          await new Promise((resolve) => setTimeout(resolve, 300)); // Brief pause to show progress
        }
      }

      // Final report generation
      setCurrentStep('Generating final comprehensive report...');
      const htmlReport = await generateReport(chunkSummaries, reportBlueprint);
      completedCalls++;
      setProgress(99);
      setCurrentStep('Report generated successfully!');

      onReportGenerated(htmlReport);
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      setCurrentStep('Error occurred during report generation');
    }

    setIsGenerating(false);
    setIsGenerated(true);
  }, [onReportGenerated, parsedData]);
  const progressBarStyle = useMemo(
    () => ({
      width: `${progress}%`,
      transition: 'width 0.5s ease-out',
    }),
    [progress]
  );

  const canGenerate = useMemo(() => {
    return parsedData && !isGenerating;
  }, [parsedData, isGenerating]);

  return (
    <div className="report-generator-container">
      <div className="report-generator-header">
        <div className="report-generator-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            <path d="m9 16 2 2 4-4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h2>Generate Report</h2>
        <p>Create comprehensive analytics from your data</p>
      </div>

      {parsedData && (
        <div className="report-info">
          <div className="report-info-item">
            <span className="report-info-label">Source File:</span>
            <span className="report-info-value">{fileName}</span>
          </div>
          <div className="report-info-item">
            <span className="report-info-label">Data Size:</span>
            <span className="report-info-value">
              {parsedData?.data.length || 0} records
            </span>
          </div>
          <div className="report-info-item">
            <span className="report-info-label">Status:</span>
            <span
              className={`report-status ${isGenerated ? 'report-status--success' : 'report-status--ready'}`}
            >
              {isGenerated ? 'Generated' : 'Ready for processing'}
            </span>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-step">{currentStep}</span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={progressBarStyle}></div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`generate-button ${!canGenerate ? 'generate-button--disabled' : ''}`}
      >
        {isGenerating ? (
          <>
            <div className="button-spinner"></div>
            Generating Report...
          </>
        ) : isGenerated ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline
                points="9,12 12,15 16,10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Report Generated
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon
                points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Generate Report
          </>
        )}
      </button>
    </div>
  );
};
