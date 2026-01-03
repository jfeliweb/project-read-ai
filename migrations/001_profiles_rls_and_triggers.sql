-- Enable Row Level Security on profiles table (only if auth schema exists - Supabase)
-- This migration is conditional: it only applies RLS policies and triggers if the auth schema exists
-- For local PostgreSQL (without Supabase), these statements will be skipped gracefully

DO $$ 
BEGIN
  -- Only run if auth schema exists (Supabase environment)
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    -- Enable Row Level Security
    EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';

    -- Drop existing policies if they exist (for idempotency)
    EXECUTE 'DROP POLICY IF EXISTS "Users can read own profile" ON profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own profile" ON profiles';

    -- Policy: Users can read their own profile
    EXECUTE 'CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id)';

    -- Policy: Users can update their own profile
    EXECUTE 'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)';

    -- Policy: Users can insert their own profile (for initial creation)
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)';

    -- Function to automatically create profile when user signs up
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $fn$
      BEGIN
        INSERT INTO public.profiles (id, email, role)
        VALUES (NEW.id, NEW.email, ''user'')
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql SECURITY DEFINER
    ';

    -- Drop existing trigger if it exists (for idempotency)
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';

    -- Trigger to call the function when a new user is created
    EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- Silently skip if auth schema doesn't exist (local PostgreSQL)
    NULL;
  WHEN OTHERS THEN
    -- Log other errors but don't fail migration
    RAISE NOTICE 'Skipping RLS migration: %', SQLERRM;
END $$;

