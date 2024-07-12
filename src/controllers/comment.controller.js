import mongoose, {Schema} from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";

//get all comments for a video

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);
     if (!video) {
        throw new ApiError (404, "Video not Found");
     }
     const commentAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size:"$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
     ]);
     const option = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
     };

     const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options
    );

     return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched Successfully"));
});


//add a Comment to a video
const addComment = asyncHandler (async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if(!content){
        throw new ApiError(404, "Content is not found");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video's link not found in Database");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to add new Comment please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment Added Successfully"));
    });

    //update a comment
    const updateComment = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content){
            throw new ApiError(400, "content is required");
        }

        const comment = await Comment.findById(commentId);

        if (!comment){
            throw new ApiError(404, "Comment not found in DBs");
        }

        if (comment?.owner.toString() !== req.user?._id.toString() ){
            throw new ApiError(400, "only comment owner can edit their comments");
        }

        const updateComment = await Comment.findByIdAndUpdate(
            comment?._id,
            {
                $set: {
                    content
                }
            },
            { new : true }
        );

        if(!updateComment){
            throw new ApiError(500, "Failed to edit comment please try again");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updateComment, "Comment edited Successfully")
            );
    });

    //delete a comment
    const deleteComment = asyncHandler( async (req, res) => {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment){
            throw new ApiError(404, "Comment not found in DBs");
        }

        if (comment?.owner.toString() !== req.user?._id.toString() ){
            throw new ApiError(400, "only comment owner can delete their comments");
        }

        await Comment.findByIdAndDelete(commentId);

        await Like.deleteMany({
            comment: commentId,
            Like: req.user
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, { commentId }, "Comment was deleted Successfully")
            );
    });

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}