import {
  v2 as cloudinary,
  ResourceApiResponse,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
  );
}

const IMAGE_PATH_PREFIX = "splytflow/";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  imagePath: string,
  opts: Partial<UploadApiOptions> = {},
): Promise<UploadApiResponse> {
  // Default behavior:
  // - use_filename: true -> use filename as part of public_id when not provided
  // - unique_filename: false -> prevent Cloudinary from appending random suffix
  // - overwrite: true -> if public_id already exists, it is replaced
  //
  // Idempotent update (replace) example:
  //   await uploadImage(localPath, { public_id: 'splytflow/user-123/avatar' });
  //
  // Unique new upload example:
  //   await uploadImage(localPath, { public_id: `splytflow/${Date.now()}_${Math.random().toString(36).slice(2)}` });
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    ...opts,
  };
  try {
    const result = await cloudinary.uploader.upload(
      `${IMAGE_PATH_PREFIX}${imagePath}`,
      options,
    );
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}

export async function getAssetInfo(
  publicId: string,
): Promise<ResourceApiResponse> {
  const options = { colors: true };
  try {
    const result = await cloudinary.api.resource(publicId, options);
    return result;
  } catch (error) {
    console.error("Error fetching asset info from Cloudinary:", error);
    throw error;
  }
}

export default cloudinary;
