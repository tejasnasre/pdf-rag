import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";
dotenv.config();

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY,
});

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    // load the pdf
    const data = JSON.parse(job.data);
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    // // text splitting chunking
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200,
    // });

    // // Process all pages from the PDF
    // const documents = [];
    // for (const doc of docs) {
    //   const pageTexts = await textSplitter.splitText(doc.pageContent);
    //   // Create Document objects with metadata
    //   const pageDocuments = pageTexts.map(
    //     (text) =>
    //       new Document({
    //         pageContent: text,
    //         metadata: {
    //           ...doc.metadata, // Keep original metadata like page number
    //           documentId: data.path, // Add path as document identifier
    //           chunkId: `${doc.metadata?.page || 0}-${Date.now()}-${Math.random()
    //             .toString(16)
    //             .slice(2)}`, // Unique ID per chunk
    //         },
    //       })
    //   );
    //   documents.push(...pageDocuments);
    // }

    // vector embeddings
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: "pdf-rag",
      }
    );

    await vectorStore.addDocuments(docs);
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
