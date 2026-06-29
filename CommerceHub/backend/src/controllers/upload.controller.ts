import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary API key missing. Mocking upload.');
      res.status(200).json({
        success: true,
        url: `https://via.placeholder.com/600?text=Mock+Upload+${Date.now()}`
      });
      return;
    }

    // Convert buffer to base64 for Cloudinary uploader
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'commercehub',
      resource_type: 'auto',
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};
