import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";

// Subdocument interface for API keys
export interface IApiKey {
    name: string;
    key: string;
    limit: number;
    used: number;
}

// User document interface
export interface IUser extends Document {
    name: string;
    email: string;
    avatar?: string;
    apiKeys: IApiKey[];
    refreshToken?: string;

    // Methods
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

// Optional: export a convenient type alias
export type UserDocument = IUser;

// API key schema (subdocument)
const apiKeySchema = new Schema<IApiKey>(
    {
        name: { type: String, required: true },
        key: { type: String, required: true}, 
        limit: { type: Number, default: 1200 },
        used: { type: Number, default: 0 },
    },
    { _id: false }
);

// User schema
const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String },
        apiKeys: { type: [apiKeySchema], default: [] },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

// Add methods to the schema
userSchema.methods.generateAccessToken = function (): string {
    return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "1d" });
};

userSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "10d" });
};

// Export the model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
