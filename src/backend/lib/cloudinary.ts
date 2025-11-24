import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpebumjn2',
  api_key: process.env.CLOUDINARY_API_KEY || '614822155246415',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'uKbPBRFVCKrYVCASPeOHBRwIC4A',
  secure: true
});

export default cloudinary;

// Función helper para subir imágenes
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'fotografia'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

// Función para eliminar imagen de Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
