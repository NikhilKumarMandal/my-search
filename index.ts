import express from "express";
import cookieParser from "cookie-parser";
import searchRouter from "./src/routes/search.routes";
import apiRouter from "./src/routes/api.routes";
import authRouter from "./src/routes/auth.routes";
import { globalErrorHandler } from "./src/middleware/globalErrorHandler";
import cors from "cors";
import { db } from "./src/db/db";

const PORT = process.env.PORT ?? 8000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
    })
);





app.use("/api/v1/search", searchRouter);
app.use("/api/v1/api", apiRouter);
app.use("/api/v1/auth", authRouter);

db()
    .then(() => {
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })
        
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })


app.use(globalErrorHandler);




