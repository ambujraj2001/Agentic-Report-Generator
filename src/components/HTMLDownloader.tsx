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
  const [downloadCount, setDownloadCount] = useState(0);

  const handleDownload = useCallback(async () => {
    if (!htmlContent) return;

    setIsDownloading(true);

    // Simulate download preparation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const downloadFileName = fileName.replace('.csv', '') + '_report.html';
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadCount((prev) => prev + 1);
    setIsDownloading(false);
  }, [htmlContent, fileName]);

  const handlePreviewToggle = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleCopyToClipboard = useCallback(async () => {
    if (!htmlContent) return;

    try {
      await navigator.clipboard.writeText(htmlContent);
      alert('HTML content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [htmlContent]);

  const fileSizeKB = useMemo(() => {
    return htmlContent ? Math.ceil(new Blob([htmlContent]).size / 1024) : 0;
  }, [htmlContent]);

  const reportStats = useMemo(() => {
    if (!htmlContent) return null;

    const wordCount = htmlContent.split(/\s+/).length;
    const lineCount = htmlContent.split('\n').length;

    return {
      words: wordCount,
      lines: lineCount,
      characters: htmlContent.length,
    };
  }, [htmlContent]);

  const downloadFileName = useMemo(() => {
    return fileName.replace('.csv', '') + '_report.html';
  }, [fileName]);

  if (!htmlContent) {
    return (
      <div className="html-downloader-container">
        <div className="html-downloader-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <polyline
                points="21,15 16,10 5,21"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3>No Report Available</h3>
          <p>Generate a report first to enable download options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="html-downloader-container">
      <div className="html-downloader-header">
        <div className="html-downloader-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2h4"
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
        <h2>Download Report</h2>
        <p>Export your generated report in HTML format</p>
      </div>

      <div className="report-details">
        <div className="detail-item">
          <span className="detail-label">File Name:</span>
          <span className="detail-value">{downloadFileName.split('.')[0]}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">File Size:</span>
          <span className="detail-value">{fileSizeKB} KB</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Format:</span>
          <span className="detail-value">HTML</span>
        </div>
        {downloadCount > 0 && (
          <div className="detail-item">
            <span className="detail-label">Downloads:</span>
            <span className="detail-value">
              {downloadCount} time{downloadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {reportStats && (
        <div className="report-stats">
          <h3>Report Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">
                {reportStats.words.toLocaleString()}
              </span>
              <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reportStats.lines.toLocaleString()}
              </span>
              <span className="stat-label">Lines</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reportStats.characters.toLocaleString()}
              </span>
              <span className="stat-label">Characters</span>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="download-button"
        >
          {isDownloading ? (
            <>
              <div className="button-spinner"></div>
              Preparing Download...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              Download Report
            </>
          )}
        </button>

        <div className="secondary-actions">
          <button onClick={handlePreviewToggle} className="secondary-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Preview Report
          </button>

          <button onClick={handleCopyToClipboard} className="secondary-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Copy Report
          </button>
        </div>
      </div>

      {showPreview && (
        <>
          {/* Bootstrap Modal Backdrop */}
          <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="reportPreviewModal"
            aria-hidden="false"
          >
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="reportPreviewModal">
                    Report Preview - {downloadFileName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <iframe
                    srcDoc={htmlContent}
                    className="preview-iframe-modal"
                    title="Report Preview"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close Preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="me-2"
                        >
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
                        Download Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
          ></div>
        </>
      )}
    </div>
  );
};
