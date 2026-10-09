-- Store each user's IANA timezone (e.g. 'Asia/Kolkata') so server-side "today" matches the user's local date.
ALTER TABLE cf_user_profiles ADD COLUMN IF NOT EXISTS timezone text;
