import { UserDocument } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
            apiKey?: {
                key: string;
                limit: number;
                used: number;
            };
        }
    }
}
