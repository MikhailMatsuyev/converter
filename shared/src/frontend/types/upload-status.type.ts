export type UploadStatus = 
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export type ProcessingState = {
  currentStep: number;
  totalSteps: number;
  message: string;
  estimatedTime?: number;
  progress: number;
};
