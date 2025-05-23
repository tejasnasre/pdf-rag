import React, { useState, useEffect } from "react";
import PDFUploader from "./PDFUploader";
import PDFViewer from "./PDFViewer";
import ChatInterface from "./ChatInterface";
import { clearCurrentSession, createNewSession } from "../utils";
import { FileText, Menu, X } from "lucide-react";

export const FileLayout: React.FC = () => {
  const [pdfUploaded, setPdfUploaded] = useState<boolean>(false);
  const [pdfName, setPdfName] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleUploadSuccess = (fileName: string) => {
    setPdfName(fileName);
    setPdfUploaded(true);
    setUploadError(null);

    // Create a new chat session
    createNewSession(fileName);
  };

  const handleUploadError = (message: string) => {
    setUploadError(message);
  };

  const handleResetChat = () => {
    // Clear the current session and reset state
    clearCurrentSession();
    setPdfUploaded(false);
    setPdfName("");
    setUploadError(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-md py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center text-purple-500">
            <FileText className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">ChatPDF</span>
          </div>

          {pdfUploaded && isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label={sidebarOpen ? "Close PDF viewer" : "Open PDF viewer"}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-2 md:px-4 py-6">
        {!pdfUploaded ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Chat with your PDF
              </h1>
              <p className="text-gray-400">
                Upload a PDF and start asking questions about its content
              </p>
            </div>

            <PDFUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />

            {uploadError && (
              <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-md text-red-200 text-center">
                {uploadError}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-10rem)]">
            {/* Desktop view: Side by side */}
            {!isMobile && (
              <div className="grid grid-cols-2 gap-6 h-full">
                <PDFViewer pdfName={pdfName} />
                <ChatInterface onResetChat={handleResetChat} />
              </div>
            )}

            {/* Mobile view: Toggle between PDF and Chat */}
            {isMobile && (
              <div className="h-full">
                {sidebarOpen ? (
                  <div className="h-full">
                    <PDFViewer pdfName={pdfName} />
                  </div>
                ) : (
                  <div className="h-full">
                    <ChatInterface onResetChat={handleResetChat} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ChatPDF Premium - Chat with your PDF
          documents
        </div>
      </footer>
    </div>
  );
};
