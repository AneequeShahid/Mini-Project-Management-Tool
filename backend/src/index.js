import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { app, connectDB } from "./app.js";
import { initSocket } from "./services/socket.js";
import "./listeners/taskListeners.js";
import { initAIWorkers } from "./workers/aiWorker.js";
import { graphListeners } from "./listeners/graphListeners.js";
import { initializeADRs } from "./initADRs.js";

const port = process.env.PORT || 4000;
const httpServer = createServer(app);
initSocket(httpServer);

async function start() {
  await connectDB();
  initAIWorkers();
  graphListeners.init();
  await initializeADRs();
  httpServer.listen(port, () => console.log(`API running on :${port}`));
}

start();
