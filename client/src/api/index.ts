import { ChatResponse, UploadResponse } from "../types";

const API_BASE_URL = "http://localhost:8080";

// Upload PDF to server
export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    
    // The server responds with { message, data } structure
    // But we need to check and transform this into our expected UploadResponse format
    return {
      success: true, // If we get here, the request was successful
      message: data.message || "File uploaded successfully",
      fileName: data.data?.filename // Extract the filename from the response
    };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload PDF",
    };
  }
};

// Send chat message to server
export const sendChatMessage = async (
  message: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat?message=${encodeURIComponent(message)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Chat request failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    return {
      message: data.response,
      id: Date.now().toString(),
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send message"
    );
  }
};
