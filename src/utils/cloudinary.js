import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    // Upload the image
    const result = await cloudinary.uploader.upload(localFilePath, options);
    // console.log(result);

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    console.error("Error during upload:", error);

    try {
      // Attempt to remove the local file if the upload failed
      fs.unlinkSync(localFilePath);
    } catch (unlinkError) {
      console.error("Failed to remove local file after upload error:", unlinkError);
    }

    return null;
  }
};

export { uploadOnCloudinary };
