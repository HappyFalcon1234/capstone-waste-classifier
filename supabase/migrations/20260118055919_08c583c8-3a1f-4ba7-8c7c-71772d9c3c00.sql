-- Fix 1: Profiles table - Add explicit denial for anonymous users
-- The current policies only apply to authenticated users, we need to explicitly deny anon access
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR SELECT
TO anon
USING (false);

-- Fix 2: Rate limits table - Ensure only service_role can access
-- Drop the existing overly permissive policy and create proper restrictive ones
DROP POLICY IF EXISTS "Allow service role to manage rate limits" ON public.rate_limits;

-- Create restrictive policies that explicitly deny all non-service-role access
CREATE POLICY "Deny anonymous access to rate limits"
ON public.rate_limits FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated user access to rate limits"
ON public.rate_limits FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Note: Service role bypasses RLS by default, so we don't need an explicit policy for it
-- The above policies ensure that only service_role can access this table

-- Fix 3: Feedback submissions - Handle anonymous feedback properly
-- Anonymous submissions (user_id IS NULL) should not be readable by anyone except admins
-- The current policy already allows admins to view all feedback
-- We need to ensure anonymous feedback (user_id IS NULL) cannot be read by non-admins
-- Current policies are correct for this - admins can view all, users can only view their own
-- The warning is about potential exposure, but the current setup is actually secure
-- However, let's add an explicit policy to be extra clear about anonymous access denial

DROP POLICY IF EXISTS "Deny anonymous users from reading feedback" ON public.feedback_submissions;
CREATE POLICY "Deny anonymous users from reading feedback"
ON public.feedback_submissions FOR SELECT
TO anon
USING (false);