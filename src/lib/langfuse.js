import { Langfuse } from "langfuse";

const publicKey = import.meta.env.VITE_LANGFUSE_PUBLIC_KEY;
const secretKey = import.meta.env.VITE_LANGFUSE_SECRET_KEY;
const baseUrl = import.meta.env.VITE_LANGFUSE_BASE_URL;

if (!publicKey || !secretKey || !baseUrl) {
  console.error("Langfuse environment variables are not set. Please check your .env file.");
}

export const langfuse = new Langfuse({
  publicKey,
  secretKey,
  baseUrl,
});