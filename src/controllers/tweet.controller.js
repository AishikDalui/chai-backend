import { asyncHandler } from "../utils/asyncHandeler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { Tweet } from "../models/tweet.model";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    //take content from the req body
    //save it to the data base
    //return the response

    const {content}=req.body;
    const user=await User.findById(req.user?._id);

    if (!content){
        throw new ApiError(400,"Content is required")
    }
    if (!user){
        throw new ApiError(400,"cannot find user");
    }

    const tweet=await Tweet.create({
        content:content,
        owner:user._id
    })

    return(
        res
        .status(200)
        .json(new ApiResponse(200,tweet,"tweet created sucessfully"))
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    //find out userId from url
    //find the same userId in Tweet data base owner
    //return all value

    const {userId}=req.params;
    
    if (!userId){
        throw new ApiError(400,"userId not found");
    }

    const userTweets=await Tweet.find({owner:userId})

    if (!userTweets){
        throw new ApiError(400,"tweet not found");
    }

    return (
        res
        .status(200)
        .json(new ApiResponse(200,userTweets,"tweet fetched sucessfully"))
    )

})


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})



export{
    createTweet,
    getUserTweets,
    updateTweet
}