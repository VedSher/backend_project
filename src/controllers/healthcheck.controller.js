import mongoose, { isValidObjectId } from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js"

const healthcheck = asyncHandler (async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    message: "Everything is K.Okay"
                },
                "Ok"
            )
        )
});

export { healthcheck };