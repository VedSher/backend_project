import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    publishAVideo,
    updateVideo,
    getAllVideos,
    getAllVideosById,
    togglePublishStatus
} from "../controllers/video.controller.js";

const router = Router();

router
    .route("/")
    .get(getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    );

    router
        .route("/v/:videoId")
        .get(verifyJWT, getAllVideosById)
        .delete(verifyJWT, deleteVideo)
        .patch(verifyJWT, upload.single("thumbnail"), updateVideo);
    
    router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

    export default router;