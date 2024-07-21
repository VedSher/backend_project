import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler (async (req, res) => {
    const { content } = req.body;

    if(!content) {
        throw new ApiError(400, "content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet){
        new ApiError(500, "failed to create tweet please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created Successfully"));
})

const updateTweet = asyncHandler (async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if(!content) {
        throw new ApiError(400, "content is required");
    }

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweetId is invalid");
    }

    const tweet = await Tweet.findById(tweetId);

    if (tweet) {
        throw new ApiError(401, "tweet is not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can Edit their Tweets");
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!newTweet) {
        throw new ApiError(500, "Unable to Update tweet please try Again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newTweet, "Tweet is Updated Successfully"));
});

const deleteTweet = asyncHandler (async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "TweetId is Invalid");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not FOund");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only owner can delete their Tweets");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet is deleted Successfully"));
});

const getUserTweets = asyncHandler (async (req, res) => {
    const { userId } = req.params;

    if( isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserId");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likeBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    },
                },
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched Successfully"));
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}