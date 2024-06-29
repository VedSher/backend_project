import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log(localFilePath);
  try {
    if (!localFilePath) return null;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    // Upload the image
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    }, options);
    console.log("file uploaded to cloudinary", result.url);

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
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

const deleteOnCloudinary = async (public_id, resource_type="image") => {
  try{
    if(!public_id) return null;

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: `${resource_type}`
    });
  } catch (error) {
    console.log("delete on cloudinaray failed", error);
    return error;
  }
};

export { uploadOnCloudinary , deleteOnCloudinary };