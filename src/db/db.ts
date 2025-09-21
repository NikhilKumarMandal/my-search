
import mongoose from "mongoose"
import { DB_NAME } from "../utils/constants";
import logger from "../utils/logger";



export const db = async () => {
    try {
        const dbUrl = `${process.env.MONGODB_URI}/${DB_NAME}`;

        if (!dbUrl) {
            throw new Error("Database URL not provided in configuration.");
        }

        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 50000,
        });
        logger.info("Database connected successfully");
    } catch (error) {
        logger.error("Error connecting to the database", error);
        throw error;
    }
}