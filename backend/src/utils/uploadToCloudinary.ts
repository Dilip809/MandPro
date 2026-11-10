import { Readable } from "node:stream";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";

import "../config/cloudinary.js";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

const uploadToCloudinary = (
  buffer: Buffer
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mandipro/products",
        resource_type: "image",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result?: UploadApiResponse
      ) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export default uploadToCloudinary;