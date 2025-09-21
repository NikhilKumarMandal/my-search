import axios from "axios";
import type { CookieOptions, Request, Response } from "express";
import { ApiError, ApiResponse } from "express-strategy";
import { User } from "../models/user.model";
import logger from "../utils/logger";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { AuthRequest } from "../types/types";

const generateAccessAndRefreshTokens = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export class Auth {

    register = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            if (!token) {
                throw new ApiError(400, "Token is required!");
            };

            const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
            googleOauthUrl.searchParams.set("id_token", token);

            const { data } = await axios.get(googleOauthUrl.toString(), {
                responseType: "json",
            });

            console.log("Google OAuth response:", data)

            const existedUser = await User.findOne({
                email:data.email
            })

            console.log("existedUser", existedUser);
            
            if (existedUser) {
                throw new ApiError(409, "User with email already exists")
            };

            const newUser = await User.create({
                email: data.email,
                name: data.name,
                avatar: data.picture
            });

            console.log("Generating tokens...");

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser?._id as string);

            console.log("Fetching created user...");

            const options: CookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(Date.now() + 3600000)
            };

            const createdUser = await User.findById(newUser?._id).select(
                "-refreshToken"
            );

            if (!createdUser) {
                throw new ApiError(404, "User not found!")
            };

            return res.status(201)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        201,
                        createdUser,
                        "User registered Successfully"
                    )
                )

        } catch (error: any) {
            logger.error(error || "Somthing went wrong while register user.")

            return res.status(500).json({
                type: "InternalServerError",
                msg: error.message || "Something went wrong",
                stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            if (!token) {
                throw new ApiError(400, "Token is required!");
            };

            const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
            googleOauthUrl.searchParams.set("id_token", token);

            const { data } = await axios.get(googleOauthUrl.toString(), {
                responseType: "json",
            });

            let user = await User.findOne({
                email: data.email
            });

            if (!user) {
                throw new ApiError(404, "User does not exist")
            };


            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id as string)

            const loggedInUser = await User.findById(user?._id).select(
                "-refreshToken"
            );

            if (!loggedInUser) {
                throw new ApiError(404, "User not found!")
            };

            const options: CookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(Date.now() + 3600000)
            };



            return res.status(201)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        loggedInUser,
                        "User login Successfully"
                    )
                )

        } catch (error: any) {
            logger.error(error || "Somthing went wrong while login user.")
            throw new ApiError(500, "somthing went wrong..");
        }
     }
    
    logout = async (req: Request, res: Response) => {
        try {
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $unset: {
                        refreshToken: 1
                    }
                },
                {
                    new: true
                }
            )

            const options: CookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(0)
            }

            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "User logged Out"
                    )
                )
        } catch (error) {
            logger.error(error || "Somthing went wrong while logout user.")
            throw new ApiError(500, "somthing went wrong");
        }
    }

    refreshAccessToken = async (req: Request, res: Response) => {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET!
            ) as JwtPayload; 

            const user = await User.findById(decodedToken?._id);
            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }

            console.log(user);

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }

            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            };

            const { accessToken, refreshToken: newRefreshToken } =
                await generateAccessAndRefreshTokens(user?._id as string);

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {  },
                        "Access token refreshed"
                    )
                );
        } catch (error:any) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }

    self = async (req: AuthRequest, res: Response) => {
        try {
            const id = req.auth?._id;

            if (!id) {
                throw new ApiError(401, "Unauthorized");
            }

            const user = await User.findById(id);

            if (!user) {
                throw new ApiError(401, "Unauthorized request");
            }

            res.status(200).json(
                new ApiResponse(
                    200,
                    { ...user.toObject(), password: undefined },
                    "User fetched successfully"
                )
            );
        } catch (error: any) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    };

}