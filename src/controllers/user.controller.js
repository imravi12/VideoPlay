import { asyncHandler } from "../utiles/asyncHandler.js";
import {ApiError} from "../utiles/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utiles/cloudinary.js"
import { ApiResponse } from "../utiles/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refersh  and access token")

    }
}


const registerUser = asyncHandler( async (req, res) => {
   //get user details from frontend
   //validation - not emty
   // check if user already exist: username, email
   // check for images, check for avatar
   // uload them to cloudinary, avatar
   // crate user object - create entry in db
   // remove password and refesh token field from response
   // check fro user creation
   //return res

   const {fulName, email, username, password } = req.body
   //console.log("email: ", email);

    // if (fulName ==="") {
    //     throw new ApiError (400, "fullname is required")
    // }

    if(
        [fulName, email, username, password].some ((field) =>
    field?.trim() ==="")
    ){
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or usrname exist")
    }

    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is unaviliable")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.create({
        fulName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password  -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")

    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd sucessfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //userame or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or password is required")

    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

if (!user) {
    throw new ApiError(404, "User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials")
}

    const { accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                User: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))


})

 

export { 
    registerUser,
    loginUser,
    logoutUser,
}
