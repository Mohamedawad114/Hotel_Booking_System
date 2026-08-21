import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
      cloud_name: process.env.CLOUD_NAME,
      secure: true,
    });
  }

  async uploadFile({
    file,
    path,
  }: {
    file: Express.Multer.File;
    path: string;
  }) {
    return await cloudinary.uploader.upload(file.path, {
      folder: `${process.env.APPFOLDER}/${path}`,
      allowed_formats: ['png', 'jpeg', 'jpg'],
      quality_analysis: true,
    });
  }

  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }
}
