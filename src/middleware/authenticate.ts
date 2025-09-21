import { expressjwt } from "express-jwt";
import type { Request as ExpressRequest } from "express";

export default expressjwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: ExpressRequest) {
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (token && token !== "undefined") {
                return token;
            }
        }

        const accessToken = req.cookies?.accessToken;
        if (accessToken && accessToken !== "undefined") {
            return accessToken;
        }

        return null;
    },
});