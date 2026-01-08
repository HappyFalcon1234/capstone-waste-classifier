-- Revoke public execution privileges from cleanup function
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC;

-- Grant only to service_role for scheduled execution
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO service_role;

-- Recreate function with batch limit to prevent large deletions
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.rate_limits
    WHERE id IN (
      SELECT id FROM public.rate_limits
      WHERE created_at < now() - interval '1 hour'
      LIMIT 1000  -- Process in batches to prevent large transactions
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RAISE NOTICE 'Cleaned up % old rate limit records', deleted_count;
END;
$$;

-- Ensure proper privileges on the recreated function
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO service_role;