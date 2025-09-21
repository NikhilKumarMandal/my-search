import { Router } from "express";
import { Search } from "../controllers/search.controllers";
import { asyncWrapper } from "../utils/utils";
import { checkApiKey } from "../middleware/checkApiKey.middleware";


const router = Router();

const search = new Search();


router.get("/",checkApiKey, asyncWrapper(search.search))


export default router;