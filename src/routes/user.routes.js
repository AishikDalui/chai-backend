import { Router } from "express";
import { loginUser, logoutUser, registerUser,changeCuurentPassword,getCurrentUser,updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory

 } from "../controllers/user.controller.js";

import {upload} from '../middlewares/multer.middleware.js' 
import { verifyJwt } from "../middlewares/autn.middleware.js";

const router=Router();

 //"/api/v1/users/register then it called registerUser method api/v1/users come from app.js route"

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
    )

    router.route("/login").post(loginUser)
    router.route("/logout").post(verifyJwt,logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJwt,changeCuurentPassword)
    router.route("/current-user").get(verifyJwt,getCurrentUser)
    router.route("/update-account").path(verifyJwt,updateAccountDetails)
    router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
    router.route("/cover-image").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)
    router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
    router.route("/history").get(verifyJwt,getWatchHistory)



export default router;

