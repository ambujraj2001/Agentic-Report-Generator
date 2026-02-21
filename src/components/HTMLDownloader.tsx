import React, { useCallback, useMemo, useState } from 'react';

interface HTMLDownloaderProps {
  htmlContent: string;
  fileName: string;
}

export const HTMLDownloader: React.FC<HTMLDownloaderProps> = ({
  htmlContent,
  fileName,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!htmlContent) return;
    setIsDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.csv', '') + '_report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  }, [htmlContent, fileName]);

  const handleCopy = useCallback(async () => {
    if (!htmlContent) return;
    await navigator.clipboard.writeText(htmlContent);
  }, [htmlContent]);

  const fileSizeKB = useMemo(() => {
    return htmlContent ? Math.ceil(new Blob([htmlContent]).size / 1024) : 0;
  }, [htmlContent]);

  if (!htmlContent) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-5xl">
            cloud_off
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">No Report Available</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-[240px] mb-8">
          Generate a report first to enable download and preview options.
        </p>
        <button
          className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-lg font-bold cursor-not-allowed"
          disabled
        >
          Download Report (.html)
        </button>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full opacity-30">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined">picture_as_pdf</span>
          </div>
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
        {/* Report info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-sm">File</span>
            <span className="font-semibold text-sm">
              {fileName.replace('.csv', '')}_report.html
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Size</span>
            <span className="font-semibold text-sm">{fileSizeKB} KB</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Format</span>
            <span className="font-semibold text-sm">Self-contained HTML</span>
          </div>
        </div>

        {/* Report ready badge */}
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-6">
          <span className="material-symbols-outlined text-emerald-500">task_alt</span>
          <div>
            <p className="text-sm font-bold text-emerald-500">Report Ready</p>
            <p className="text-xs text-slate-400">
              Your report has been generated and is ready for download.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg shadow-primary/25"
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">download</span>
                Download Report (.html)
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Preview
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy HTML
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowPreview(false)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-slate-900 rounded-xl z-50 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold">
                Report Preview — {fileName.replace('.csv', '')}_report.html
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-none"
                title="Report Preview"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
