import dotenv from "dotenv";
dotenv.config();

// Ensure test environment variables are loaded and set
process.env.NODE_ENV = "test";

// Disable real OpenAI calls during automated tests by unsetting the API key
process.env.AI_API_KEY = "";
process.env.OPENAI_API_KEY = "";
