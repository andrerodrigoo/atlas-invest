import { Router } from "express";
import { newsController } from "@api/controllers/news.controller";

const router = Router();

router.get("/", (req, res, next) => newsController.list(req, res, next));
router.get("/:id", (req, res, next) => newsController.getById(req, res, next));

export default router;
