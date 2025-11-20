-- Create rate limiting table for tracking API usage
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'classify-waste',
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow edge functions to manage rate limits
CREATE POLICY "Allow service role to manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_rate_limits_ip_created 
ON public.rate_limits (ip_address, created_at DESC);

-- Create function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;