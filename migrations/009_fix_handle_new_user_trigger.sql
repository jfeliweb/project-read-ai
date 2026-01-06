-- ============================================================================
-- MIGRATION: Fix handle_new_user trigger to include name field
-- ============================================================================
-- The profiles.name column is NOT NULL, but the trigger function was not
-- including it when creating new profiles. This migration updates the trigger
-- to extract the name from user metadata (passed during signup) or fall back
-- to the email username if no name is provided.
-- ============================================================================

DO $$ 
BEGIN
  -- Only run if auth schema exists (Supabase environment)
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    RAISE NOTICE 'Updating handle_new_user() function to include name field...';
    
    -- Update the function to extract name from user metadata (from signup form)
    -- or fall back to email username if not provided
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $fn$
      BEGIN
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (
          NEW.id, 
          NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>''name'', SPLIT_PART(NEW.email, ''@'', 1)),
          ''user''
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql SECURITY DEFINER
    ';
    
    RAISE NOTICE '✅ Successfully updated handle_new_user() function';
  ELSE
    RAISE NOTICE 'Auth schema does not exist, skipping trigger update';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating handle_new_user() function: %', SQLERRM;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

