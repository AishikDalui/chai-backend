import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

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



export default router;

