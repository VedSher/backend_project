import { Router } from "express";
import {
  changeCurrentPassword, getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
//http://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT, changeCurrentPassword)
router.route("/currentUser").post(verifyJWT, getCurrentUser)
router.route("/updateUser").post(verifyJWT, updateAccountDetails)
router.route("/updateUserAvatar").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    }
  ]),
  updateUserAvatar
);
router.route("/updateUserCoverImage").post(verifyJWT, updateUserCoverImage)

export default router;