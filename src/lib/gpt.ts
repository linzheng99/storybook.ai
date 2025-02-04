import { GPTScript } from "@gptscript-ai/gptscript";

const gpt = new GPTScript({
  APIKey: process.env.OPENAI_API_KEY,
});

export default gpt;
