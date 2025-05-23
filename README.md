# PDF-RAG: Chat with Your PDFs

PDF-RAG is a powerful application that lets you chat with your PDF documents using Retrieval Augmented Generation technology. Upload a PDF and start asking questions about its content in natural language.

## Features

- **PDF Upload & Processing**: Upload PDFs through a user-friendly interface
- **Vector Search**: Efficient document retrieval using vector embeddings (Qdrant)
- **Conversational AI**: Ask questions about your documents in natural language
- **Background Processing**: Asynchronous PDF processing with message queues
- **Responsive Design**: Works on both desktop and mobile devices

## System Architecture

PDF-RAG uses a modern stack with the following components:

- **Backend**: Node.js/Express API server with BullMQ for task queue management
- **Vector Database**: Qdrant for storing and searching document embeddings
- **Queue System**: Valkey (Redis compatible) for reliable background processing
- **LLM Integration**: Mistral AI for natural language understanding
- **Frontend**: React with TypeScript, Tailwind CSS, and Vite

## Requirements

- Node.js (v18 or newer)
- Docker and Docker Compose
- Mistral AI API key
