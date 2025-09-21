import type { Request } from "express";

export interface AuthRequest extends Request {
    auth?: {      
        _id?: string;
        name: string;
        email: string;
    };
}