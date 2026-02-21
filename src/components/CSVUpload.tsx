import React, { useCallback, useMemo, useState, useRef } from 'react';
import Papa from 'papaparse';

interface CSVUploadProps {
  onUpload: (
    parsedData: Papa.ParseResult<Record<string, string>>,
    fileName: string
  ) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback(
    async (file: File) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const reader = new FileReader();
      reader.onload = (e) => {
        const csvString = e.target?.result as string;
        Papa.parse<Record<string, string>>(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setUploadedFile({ name: file.name, size: file.size });
            setIsLoading(false);
            onUpload(results, file.name);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            setIsLoading(false);
          },
        });
      };
      reader.readAsText(file);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === 'text/csv') {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file && file.type === 'text/csv') {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const fileSizeFormatted = useMemo(() => {
    if (!uploadedFile) return '';
    const kb = uploadedFile.size / 1024;
    return kb > 1024
      ? `${(kb / 1024).toFixed(1)} MB`
      : `${Math.round(kb)} KB`;
  }, [uploadedFile]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
          Input Source
        </p>

        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : uploadedFile
                ? 'border-emerald-400/40 bg-emerald-500/5'
                : 'border-primary/30 bg-primary/5 hover:border-primary/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isLoading ? (
            <>
              <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Processing CSV file...</p>
            </>
          ) : uploadedFile ? (
            <>
              <span className="material-symbols-outlined text-emerald-500 text-4xl">
                cloud_done
              </span>
              <div>
                <p className="text-white font-bold">{uploadedFile.name}</p>
                <p className="text-xs text-slate-400">
                  Successfully uploaded ({fileSizeFormatted})
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-primary text-4xl">
                cloud_upload
              </span>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-slate-400">or click to browse files</p>
              </div>
              <span className="text-xs text-slate-400">
                Supports .csv files up to 10MB
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-auto">
        {uploadedFile && (
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Change File
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent)]" />
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-500 text-5xl">
              table_chart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
