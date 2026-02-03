-- Drop the existing policies on profiles table that might allow unauthorized access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new RESTRICTIVE policy that explicitly denies access to other users' profiles
-- This ensures authenticated users can ONLY see their own profile (user_id must match auth.uid())
CREATE POLICY "Users can only view their own profile"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Also ensure UPDATE policy is restrictive
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can only update their own profile"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure INSERT policy is restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can only insert their own profile"
ON public.profiles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);