import React, { useCallback, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  generateBlueprintAndQueries,
  executeQueries,
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
      setCurrentStep('Analyzing schema and planning queries...');
      setProgress(10);
      const { blueprint, queries } =
        await generateBlueprintAndQueries(parsedData.data);

      setCurrentStep(
        `Running ${queries.length} SQL queries on full dataset...`
      );
      setProgress(40);
      const queryResults = executeQueries(parsedData.data, queries);

      setCurrentStep('Building HTML report from query results...');
      setProgress(60);
      const htmlReport = await generateReport(blueprint, queryResults);

      setProgress(99);
      setCurrentStep('Report generated successfully!');
      onReportGenerated(htmlReport);
    } catch (error) {
      console.error('Report generation failed:', error);
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
      {/* Stats rows */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Source File</span>
          <span className="font-semibold text-sm">
            {fileName || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Data Size</span>
          <span className="font-semibold text-sm">
            {parsedData ? `${parsedData.data.length} records` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Status</span>
          <span
            className={`text-sm font-semibold ${
              isGenerated
                ? 'text-emerald-500'
                : parsedData
                  ? 'text-primary'
                  : 'text-slate-400'
            }`}
          >
            {isGenerated
              ? 'Generated'
              : parsedData
                ? 'Ready for processing'
                : 'Waiting for data'}
          </span>
        </div>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-primary">{currentStep}</p>
            <span className="text-sm font-bold text-slate-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full progress-bar-animated shadow-[0_0_10px_rgba(13,166,242,0.4)]"
              style={progressBarStyle}
            />
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
            Agent is analyzing your dataset and building the report...
          </p>
        </div>
      )}

      {/* Button */}
      <div className="mt-auto">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg text-base font-bold transition-all ${
            isGenerating
              ? 'bg-primary/20 text-primary border border-primary/30 cursor-not-allowed'
              : !canGenerate
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : isGenerated
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Generating Report...
            </>
          ) : isGenerated ? (
            <>
              <span className="material-symbols-outlined text-xl">check_circle</span>
              Report Generated
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">bolt</span>
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};
