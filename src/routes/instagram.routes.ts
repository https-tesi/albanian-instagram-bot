import { Router } from "express";

import { instagramController } from "../controllers/instagram.controller";

export const instagramRouter = Router();

instagramRouter.get("/", instagramController.verifyWebhook);
instagramRouter.post("/", instagramController.receiveWebhook);
