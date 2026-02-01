-- Drop the overly permissive public read policy on learned_corrections
DROP POLICY IF EXISTS "Anyone can view learned corrections" ON public.learned_corrections;

-- Create a new policy that only allows authenticated users to read
CREATE POLICY "Authenticated users can view learned corrections" 
ON public.learned_corrections 
FOR SELECT 
TO authenticated
USING (true);

-- Add explicit deny policy for anonymous access
CREATE POLICY "Deny anonymous access to learned corrections"
ON public.learned_corrections
FOR SELECT
TO anon
USING (false);