DROP FUNCTION IF EXISTS table_metainfo_check(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION table_metainfo_check(tablename TEXT, scenario_id INTEGER)

RETURNS BOOLEAN AS $$

DECLARE 

  query TEXT;
  result BOOLEAN;

BEGIN
  query := 'SELECT count(*)=4 FROM (
    SELECT cl.oid,cl.relname,cl.relnamespace,ns.nspname FROM 
      (SELECT oid,relname,relnamespace FROM pg_class) as cl 
      INNER JOIN (SELECT oid, nspname FROM pg_catalog.pg_namespace) as ns 
      ON cl.relnamespace = ns.oid 
      WHERE cl.relname=''' || tablename || ''' AND ns.nspname=''scenario_' || scenario_id || '''
    ) as a 
    INNER JOIN (SELECT attrelid,attname FROM pg_attribute) as b ON a.oid = b.attrelid 
      WHERE b.attname in (''op_created_by'', ''op_created_at'', ''op_updated_by'', ''op_updated_at'')';

  EXECUTE query INTO result;
  return result;
END;
$$  LANGUAGE plpgsql;
