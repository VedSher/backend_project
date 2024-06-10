import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiRespone } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    // get user details from front-end(done)
    //email aur username empty toh nai bheja(done)
    // check if user exist?using email/username(done)
    //if our files(imgs aur avatar) are filled or not(done)
    //upload them to cloudnary(done)
    //create user object - create entry in db(done)
    //remove password & refresh token field from response
    //check for user creation
    //return res
    
    const { fullName, email, username, password } = req.body
    function isValidEmail(e) {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(e);
      }
      if (isValidEmail(email)) {
          console.log("email : ", email);
      } else {
        console.log("Please enter a valid email!!")
      }
    if (fullName === ""){
        throw new ApiError(400, "fullname is required" )
    }

    console.log("full-Name : ", fullName);
    
    if (
        [fullName, email, username, password].some((field) =>
         field?.trim() === "" )
    ) {
        throw new ApiError(400, "All field are required")
    }
    const existedUser = User.findOne({
      $or: [{username}, {email}]
    })

    if(existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
      throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      covarImage: coverImage.url || "",
      email,
      password,
      username: username.toLowerCase()
    })

    const checkUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!checkUser){
      throw new ApiError(500, "Error in registering the user")
    }

    return res.status(201).json(
      new ApiRespone(200, checkUser, "User registed Successfully")
    )

} )

export { registerUser }