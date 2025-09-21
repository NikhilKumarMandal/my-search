import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";


// Subdocument interface
export interface IApiKey {
    name: string
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
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
}

// ApiKey Schema
const apiKeySchema = new Schema<IApiKey>({
    name: { type: String, required: true, },
    key: { type: String, required: true, unique: true },
    limit: { type: Number, default: 1200 },
    used: { type: Number, default: 0 }
}, { _id: false });

// User Schema
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    apiKeys: [apiKeySchema],
    refreshToken: { type: String }
}, { timestamps: true });

// Methods
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' });
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
        expiresIn: '10d'
    });
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
