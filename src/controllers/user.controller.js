import { asyncHandler } from "../utils/asynchandeler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser=asyncHandler(async(req,res)=>{
    //get userdetails from frontend
    //validation-not empty
    //check if users is already exisists:name,email
    //check for image avtar
    //upload them to cloudinary
    //create user object -create entry in db
    //remove password and refresh token from response
    //check for user creation
    //return res

    const {fullName, email, username, password }= req.body //req.body only used when we fetcha data from json or form

    if (
        [fullName, email, username, password ].some((field)=>field?.trim==="")
    ){
        throw new ApiError(400,"All fileds are required");
    }
    console.log(email)
    const existedUser=await User.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser){
        throw ApiError(409,"user with username or email already exisists")
    }

    //check for image avtar
    console.log(req.files)
    const avtarLoaclPath=req.files?.avtar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avtar=await uploadOnCloudinary(avtarLoaclPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if (!avtar){
        throw new ApiError(400, "Avatar file is required");
    }

    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //fields which are not required or removed
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )



})


export {registerUser};