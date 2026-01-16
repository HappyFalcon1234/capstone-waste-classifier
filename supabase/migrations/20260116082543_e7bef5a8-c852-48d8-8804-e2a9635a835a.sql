-- Create storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('waste-images', 'waste-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their images
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all images (for display)
CREATE POLICY "Public can view waste images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'waste-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]);