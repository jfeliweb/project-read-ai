-- ============================================================================
-- MIGRATION: Make profiles.name NOT NULL
-- ============================================================================
-- This migration makes the name column in the profiles table required.
-- If there are existing NULL values, they will be set to a default value
-- based on the email address (extracting the part before @).
-- ============================================================================

BEGIN;

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration: Make profiles.name NOT NULL...';
    
    -- Check if name column is currently nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'name' 
        AND is_nullable = 'YES'
    ) THEN
        -- Check if there are any NULL values
        IF EXISTS (SELECT 1 FROM "profiles" WHERE "name" IS NULL) THEN
            RAISE NOTICE 'Found NULL values in profiles.name. Updating them...';
            
            -- Update NULL names to use email username (part before @) as default
            UPDATE "profiles" 
            SET "name" = SPLIT_PART("email", '@', 1)
            WHERE "name" IS NULL;
            
            RAISE NOTICE 'Updated NULL names to use email username.';
        END IF;
        
        -- Now set the column to NOT NULL
        ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL;
        RAISE NOTICE 'Successfully set profiles.name to NOT NULL.';
    ELSE
        RAISE NOTICE 'profiles.name is already NOT NULL, skipping...';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error making profiles.name NOT NULL: %', SQLERRM;
END $$;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

