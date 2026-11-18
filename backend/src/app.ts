import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { connectedAccountRouter } from "./modules/connectedAccounts/connectedAccount.routes";
import { storageRouter } from "./modules/storage/storage.routes";
import { folderRouter } from "./modules/folders/folder.routes";
import { uploadRouter } from "./modules/uploads/upload.routes";
import { fileRouter } from "./modules/files/file.routes";
import { errorHandler } from "./common/middleware/errorHandler";
import { simulatorRouter } from "./modules/simulator/simulator.routes";
import { env } from "./config/env";

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/connected-accounts", connectedAccountRouter);
app.use("/storage", storageRouter);
app.use("/folders", folderRouter);
app.use("/uploads", uploadRouter);
app.use("/files", fileRouter);
app.use("/simulator", simulatorRouter);

app.use(errorHandler);
