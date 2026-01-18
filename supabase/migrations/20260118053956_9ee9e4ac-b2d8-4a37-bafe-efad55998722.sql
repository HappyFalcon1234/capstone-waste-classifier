-- Make the waste-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'waste-images';

-- Drop the public read policy
DROP POLICY IF EXISTS "Public can view waste images" ON storage.objects;

-- Add policy for authenticated users to view their own images
CREATE POLICY "Users can view their own waste images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'waste-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add policy for authenticated users to upload their own images
CREATE POLICY "Users can upload their own waste images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'waste-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add policy for authenticated users to delete their own images
CREATE POLICY "Users can delete their own waste images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'waste-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);