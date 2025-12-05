import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // 1MB max
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    console.log(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
}

export async function compressImageForOffline(
  file: File
): Promise<File> {
  // More aggressive compression for offline mode
  return compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 512,
    useWebWorker: true,
  });
}
