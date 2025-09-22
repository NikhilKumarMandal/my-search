import express from "express";
import cookieParser from "cookie-parser";
import searchRouter from "./routes/search.routes";
import apiRouter from "./routes/api.routes";
import authRouter from "./routes/auth.routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import cors from "cors";
import { db } from "./db/db";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ?? 8000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://mysearch.pixxelai.live"
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
        
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })


app.use(globalErrorHandler);




