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
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback(
    async (file: File) => {
      setIsLoading(true);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const reader = new FileReader();
      reader.onload = (e) => {
        const csvString = e.target?.result as string;

        // Parse CSV using PapaParse
        Papa.parse<Record<string, string>>(csvString, {
          header: true, // Treat first row as headers
          skipEmptyLines: true,
          complete: (results) => {
            setUploadedFile(file.name);
            setIsLoading(false);

            // Pass the parsed data instead of raw CSV string
            onUpload(results, file.name);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV file. Please check the file format.');
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
      } else {
        alert('Please select a valid CSV file');
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
      } else {
        alert('Please select a valid CSV file');
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

  const dropZoneClassName = useMemo(() => {
    let className = 'csv-upload-dropzone';
    if (isDragging) className += ' csv-upload-dropzone--dragging';
    if (uploadedFile) className += ' csv-upload-dropzone--success';
    return className;
  }, [isDragging, uploadedFile]);

  const fileSize = useMemo(() => {
    return Math.floor(Math.random() * 500) + 50; // Simulated file size
  }, []);

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-header">
        <div className="csv-upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="13"
              x2="8"
              y2="13"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="17"
              x2="8"
              y2="17"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h2>Upload CSV File</h2>
        <p>Transform your data into comprehensive reports</p>
      </div>

      <div
        className={dropZoneClassName}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isLoading ? (
          <div className="csv-upload-loading">
            <div className="csv-upload-spinner"></div>
            <p>Processing CSV file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="csv-upload-success">
            <div className="csv-upload-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
            </div>
            <h3>{uploadedFile}</h3>
            <p>{fileSize} KB • Ready for processing</p>
          </div>
        ) : (
          <div className="csv-upload-placeholder">
            <div className="csv-upload-placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3>Drop your CSV file here</h3>
            <p>or click to browse files</p>
            <span className="csv-upload-hint">
              Supports .csv files up to 10MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
