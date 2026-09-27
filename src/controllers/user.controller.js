import { asyncHandler } from "../utiles/asyncHandler.js";
import {ApiError} from "../utiles/ApiError.js"
import {user} from "../models/user.model.js"
import{uploadOnClodunary} from "../utils/cloudinary"
import { ApiResponse } from "../utiles/ApiResponse.js";

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
   console.log("email: ", email);

    // if (fulName ==="") {
    //     throw new ApiError (400, "fullname is required")
    // }

    if(
        [fulName, email, username, password].some ((field) =>
    field?.trim() ==="")
){
    throw new ApiError(400, "all fields are required")
}

    const existedUser = UserActivation.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or usrname exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImage = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is unaviliable")
    }

const avatar = await uploadOnClodunary(avatarLocalPath)
const coverImage = await uploadOnClodunary(coverImage)

if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
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

returnres.status(201).json(
    new ApiResponse(200, createdUser, "User registerd sucessfully")
)

})


export { registerUser}
