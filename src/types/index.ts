// types/index.ts

export interface FileUploadProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    onProcess: () => void;
    isProcessing: boolean;
  }
  
  export interface ProcessingStatusProps {
    isProcessing: boolean;
    progress: number;
    processingStep: string;
    htmlOutput: string;
  }
  
  export interface ReportActionsProps {
    htmlOutput: string;
    showPreview: boolean;
    onTogglePreview: () => void;
    onDownloadHtml: () => void;
    onDownloadPdf: () => void;
  }
  
  export interface ReportPreviewProps {
    htmlOutput: string;
    showPreview: boolean;
  }
  
  export interface ProcessingStep {
    step: string;
    duration: number;
  }
  
  export interface ReportProcessorReturn {
    isProcessing: boolean;
    processingStep: string;
    progress: number;
    processFile: () => Promise<void>;
  }
  
  export interface FileOperationsReturn {
    downloadHtml: (htmlOutput: string) => void;
    downloadPdf: (htmlOutput: string) => void;
  }