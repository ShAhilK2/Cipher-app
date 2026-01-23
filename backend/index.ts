import app from "./src/app";
import { connectDb } from "./src/config/database";

import { createServer } from "http";
import { initilizeSocket } from "./src/utils/socket";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initilizeSocket(httpServer);

connectDb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is up and running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
