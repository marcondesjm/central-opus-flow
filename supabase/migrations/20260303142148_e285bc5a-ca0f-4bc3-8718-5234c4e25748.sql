
-- Add IP column to coupon_redemptions
ALTER TABLE public.coupon_redemptions ADD COLUMN ip_address text;

-- Add unique constraint on coupon + IP to prevent same IP reusing
CREATE UNIQUE INDEX idx_coupon_redemptions_coupon_ip ON public.coupon_redemptions (coupon_id, ip_address) WHERE ip_address IS NOT NULL;
