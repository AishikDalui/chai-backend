import { asyncHandler } from "../utils/asyncHandeler.js";

import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken 
        await user.save({ validateBeforeSave: false }) //save the refresh token to database

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating referesh and access token")
    }

}

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
    // console.log(email)
    const existedUser=await User.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser){
        throw ApiError(409,"user with username or email already exisists")
    }

    //check for image avtar
    // console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
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

const loginUser=asyncHandler(async(req,res)=>{
    //take email and username and passwrod from req.body
    //check username or email field is empty or not
    //find username or emailid from data base
    //compare the password
    //generate access and refresh token
    //remove password and cookie filed from the database
    //send cookie

    const {username,email,password}=req.body;
    if (!username && !email){
        throw new ApiError(400,"username or email is required");
    }

    const user=await User.findOne({$or:[{username},{email}]});

    if (!user){
        throw new ApiError(404,"user does not exisist");
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select(" -password -refreshToken ")

    const options={
        httpOnly:true,
        secure:true //it is only modified by the server only
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

const logoutUser=asyncHandler(async(req,res)=>{
    //clear all the loggedin cookies come from auth.middleware.js
    //reset refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccesToken=asyncHandler(async(req,res)=>{
    //take refresh token from cooke or body
    //verify refresh token with refresh_token_secret
    //find out database refresh token and mathched it 
    //if matched generate new refreshtoken and access token 
    //send it to the cokkies

    const incomingRefreshToken=req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

    try {
        const decodedToken= jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
    
        
        const user= await User.findById(decodedToken?._id);
        if (!user){
            throw new ApiError(401,"Invalid user");
        }
    
        if (incomingRefreshToken !==user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


export {registerUser,
    loginUser,
    logoutUser,
    refreshAccesToken
};