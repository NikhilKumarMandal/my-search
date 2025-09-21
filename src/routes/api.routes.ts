import { Router } from "express";
import { asyncWrapper } from "../utils/utils";
import { Api } from "../controllers/api.controllers";
import authenticate from "../middleware/authenticate";


const router = Router();

const api = new Api();

router.post("/", authenticate, asyncWrapper(api.createApiKey));

router.delete("/delete", authenticate, asyncWrapper(api.deleteApiKey));

router.get("/", authenticate, asyncWrapper(api.listApiKey));

export default router;