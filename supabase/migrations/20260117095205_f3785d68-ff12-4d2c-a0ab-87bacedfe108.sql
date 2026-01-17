-- Add display_name column to profiles if not exists
-- (Already exists from initial migration, but add username column for auth)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;