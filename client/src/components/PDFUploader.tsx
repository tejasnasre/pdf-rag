import React, { useState, useRef } from "react";
import { UploadCloud, AlertCircle, FileText, X, Check } from "lucide-react";
import { uploadPdf } from "../api";
import { validatePdfFile } from "../utils";

interface PDFUploaderProps {
  onUploadSuccess: (fileName: string) => void;
  onUploadError: (message: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);
    const validation = validatePdfFile(file);

    if (!validation.valid) {
      setError(validation.message);
      onUploadError(validation.message);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadPdf(selectedFile);

      if (response.success && response.fileName) {
        onUploadSuccess(response.fileName);
      } else {
        setError(response.message);
        onUploadError(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload PDF";
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-purple-500 bg-purple-900/20"
            : error
            ? "border-red-600 bg-red-900/20"
            : "border-gray-700 hover:border-purple-500 bg-gray-900"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
              <FileText className="h-10 w-10 text-purple-500" />
              <div className="text-left flex-1">
                <p className="font-medium text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all ${
                isUploading
                  ? "bg-purple-700 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-600/20"
              }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-5 w-5" />
                  Upload PDF
                </span>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-4">
              <UploadCloud className="h-16 w-16 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Upload your PDF
            </h3>
            <p className="text-gray-400 mb-4">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-6">
              PDF files only, max 5MB
            </p>

            <button
              onClick={handleClickUpload}
              className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-600/20"
            >
              Select PDF
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
