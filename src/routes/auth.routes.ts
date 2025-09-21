import { Router } from "express";
import { Auth } from "../controllers/auth.controllers";
import { asyncWrapper } from "../utils/utils";
import authenticate from "../middleware/authenticate";


const router = Router();

const auth = new Auth();

router.post("/register", asyncWrapper(auth.register));
router.post("/login", asyncWrapper(auth.login));
router.post("/logout", asyncWrapper(auth.logout));
router.post("/refresh", asyncWrapper(auth.register));
router.get("/self",authenticate ,asyncWrapper(auth.self));




export default router;