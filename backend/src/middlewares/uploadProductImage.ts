import multer from "multer";
import type { RequestHandler } from "express";
import { fileTypeFromBuffer } from "file-type";
import HttpError from "../utils/HttpError.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new HttpError(
        400,
        "Only JPG, PNG and WEBP images are allowed."
      ));
      return;
    }

    callback(null, true);
  },
}).single("image");

const uploadProductImage: RequestHandler = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(new HttpError(413, "Image size cannot exceed 5MB."));
          return;
        }

        next(new HttpError(400, error.message));
        return;
      }

      next(error);
      return;
    }

    try {
      if (req.file) {
        const detectedType = await fileTypeFromBuffer(req.file.buffer);

        if (
          !detectedType ||
          !allowedMimeTypes.has(detectedType.mime) ||
          detectedType.mime !== req.file.mimetype
        ) {
          next(new HttpError(
            400,
            "Invalid image content. Upload a genuine JPG, PNG or WEBP image."
          ));
          return;
        }
      }

      next();
    } catch (validationError) {
      next(validationError);
    }
  });
};

export default uploadProductImage;