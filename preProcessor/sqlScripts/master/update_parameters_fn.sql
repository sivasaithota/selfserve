DROP FUNCTION IF EXISTS fn_update_parameters();

CREATE OR REPLACE FUNCTION fn_update_parameters()

RETURNS VOID AS $$

DECLARE 

  query TEXT;

  select_query TEXT;

  public_column_exists BOOLEAN;

  public_parameters_exists BOOLEAN;

  scenario_column_exists BOOLEAN;

  table_cursor CURSOR FOR SELECT "id" FROM public."projects";

  table_record RECORD;

BEGIN
  
  SELECT INTO public_parameters_exists (SELECT "visible" 
    FROM "lkp_pages" 
    WHERE "type"='parameters');

  IF public_parameters_exists IS TRUE THEN

    SELECT EXISTS INTO public_column_exists (SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='lkp_parameters' AND column_name='group_name');

    IF public_column_exists IS FALSE THEN

      ALTER TABLE "lkp_parameters" ADD COLUMN "group_name" varchar(255) NOT NULL DEFAULT 'Group';

    END IF;

    OPEN table_cursor;

    LOOP

      FETCH table_cursor INTO table_record;
        
      EXIT WHEN NOT FOUND;

      EXECUTE('SELECT EXISTS (
            SELECT 1 FROM information_schema.columns WHERE table_schema=''scenario_' || table_record.id || 
            ''' AND table_name=''parameters'' AND column_name=''group_name'')') INTO scenario_column_exists;
      IF scenario_column_exists IS FALSE THEN

        query := CONCAT('ALTER TABLE scenario_',table_record.id,'."parameters" ADD COLUMN "group_name" varchar(255) NOT NULL DEFAULT ''Group''');

        EXECUTE query;

      END IF;

    END LOOP;

  END IF;

END;

$$  LANGUAGE plpgsql;
