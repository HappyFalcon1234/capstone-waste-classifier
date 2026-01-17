-- Add corrected_bin_color column to learned_corrections
ALTER TABLE public.learned_corrections 
ADD COLUMN IF NOT EXISTS corrected_bin_color TEXT;