import React, { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerProps {
  pdfName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfName }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pdfUrl = `${
    import.meta.env.VITE_API_URL || "http://localhost:8080"
  }/pdf/${pdfName}`;
  const [loadError, setLoadError] = useState<boolean>(false);

  const handleError = () => {
    setLoadError(true);
    console.error(`Failed to load PDF from: ${pdfUrl}`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="font-medium text-white truncate">{pdfName}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900">
        {loadError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Failed to load PDF
            </h3>
            <p className="text-sm text-gray-400">
              The file "{pdfName}" couldn't be loaded. Make sure it exists on
              the server.
            </p>
            <p className="text-xs text-gray-500 mt-4">URL: {pdfUrl}</p>
          </div>
        ) : (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div
              className="pdf-viewer-wrapper h-full"
              style={
                {
                  "--rpv-core__inner-page-background-color": "#1a1a1a",
                  "--rpv-core__text-layer-text-color": "#f5f5f5",
                } as React.CSSProperties
              }
            >
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={1}
                theme={{ theme: "dark" }}
              />
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
