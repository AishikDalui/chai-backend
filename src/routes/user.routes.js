import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

import {upload} from '../middlewares/multer.middleware.js' 

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




export default router;

