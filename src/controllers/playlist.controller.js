import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler( async (req, res) => {
    const { name,description } = req.body;

    if (!name || !description ){
        throw new ApiError(400, "UserName and description both are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if(!playlist) {
        throw new ApiError(500, "Failed to create Playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Successfully created Playlist"));
});

const updatedPlaylist = asyncHandler (async(req, res) => {
    const { name, description } = req.body;
    const { playlistId } = req.params;

    if (!name || !description ){
        throw new ApiError(400, "UserName and description both are required");
    }

    if (isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid PlaylistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can edit the playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name,
                description,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist was Updated Successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "PlaylistId Not Found ");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "Playlist not Found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete the playlist");
    }

    await Playlist.findByIdAndDelete(playlistId?._id);

    return res
        .status(200)
        .json( new ApiResponse(200, {}, "Playlist Updated Successfully"));
});

const addVideoToPlaylist = asyncHandler (async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist and VideoId is Required");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if((playlist.owner?.toString() && video.owner?.toString() ) !== req.user?._id.toString()){
        throw new ApiError(400, "only Owner can add video to their Playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet: {
                videos: videoId,
            },
        },
        {   new : true  }
    );

    if(!updatedPlaylist){
        throw new ApiError(500, "Failed to add video to playlist please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Added Video to Playlist Successfully"
            )
        );
});

const removeVideoToPlaylist = asyncHandler( async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist and VideoId is Required");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if(
        (playlist.owner?.toString() && video.owner?.toString() ) !== req.user?._id.toString() 
    ){
        throw new ApiError(400, "only Owner can add video to their Playlist");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            },
        },
        {   new : true  }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Removed Video From Playlist Successfully")
        );
});

const getPlaylistById = asyncHandler ( async (req, res) =>{
    const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist-Id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist noot Found");
    }

    const playlistVideos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $match: {
                "video.isPublished" : true
            }
        },
        {
            $lookup: {
                from: "users",
                localField:"owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, playlistVideos[0], "playlist fetched successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size : "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched Successfully"));
});

export {
    createPlaylist,
    updatedPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoToPlaylist,
    getPlaylistById,
    getUserPlaylists
};