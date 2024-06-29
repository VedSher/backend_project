import { Router } from "express";
import {
    addComment,
    deleteComment,
    updateComment,
    getVideoComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.use(verifyJWT, upload.none());//To Apply verifyJWT middleware to all routes in this file

router.route("/:videoID").get(getVideoComment).post(addComment);
route.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;