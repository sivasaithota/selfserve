DROP FUNCTION IF EXISTS check_master_setting();

CREATE OR REPLACE FUNCTION check_master_setting()

RETURNS BOOLEAN AS $$

DECLARE

  masterValue BOOLEAN;

BEGIN

   SELECT "value"::BOOLEAN INTO masterValue FROM "setting" WHERE  "key" = 'masterTables';
   
   RETURN masterValue;

END;

$$  LANGUAGE plpgsql;