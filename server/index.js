import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Mistral } from "@mistralai/mistralai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Changed: import fileURLToPath from url module
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const queue = new Queue("file-upload-queue", {
  host: "localhost",
  port: 6379,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Changed to relative path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Changed filename to originalname
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());
// Add this line to serve files from 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Add this after your existing app.use("/uploads", express.static("uploads")) line
app.get("/pdf/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(`${__dirname}/uploads/${filename}`);
});

app.get("/chat", async (req, res) => {
  const embeddings = new MistralAIEmbeddings({
    model: "mistral-embed",
    apiKey: process.env.MISTRAL_API_KEY,
  });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: "pdf-rag",
    }
  );
  const userQuery = req.query.message;
  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  const result = await retriever.invoke(userQuery);

  const SYSTEM_PROMPT = `
  You are a helpful and expert assistant designed to answer questions based on the content of uploaded PDF documents. Only use information that exists in the provided PDF(s). Do not make up facts or assume anything outside the document content.  

  When asked a question:
  - First, find the most relevant parts of the PDF(s) to answer it.
  - Quote or summarize those sections clearly.
  - If a direct answer is not found, explain that the information is not available in the uploaded file.
  - Provide concise, clear, and user-friendly responses.

  You are capable of handling technical documents, research papers, contracts, manuals, and more. When appropriate, include:
  - Page numbers where the answer was found.
  - Section titles or headings for reference.

  Never hallucinate or speculate. Always cite the source content from the PDF in your response if possible.

  Context : ${JSON.stringify(result)}
  `;

  const chatResponse = await client.chat.complete({
    model: "open-mistral-nemo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  return res.status(200).json({
    response: chatResponse.choices[0].message.content,
    doc: result,
  });
});

app.post("/upload/pdf", upload.single("pdf"), async function (req, res, next) {
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.status(200).json({
    message: "File uploaded successfully",
    data: {
      filename: req.file.filename, // Use filename instead of originalname
      url: `${req.protocol}://${req.get("host")}/pdf/${req.file.filename}`,
    },
  });
});

app.listen(8080, () => {
  console.log("server started on port 8080");
});
