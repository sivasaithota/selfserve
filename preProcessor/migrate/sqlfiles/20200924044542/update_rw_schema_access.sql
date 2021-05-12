DROP FUNCTION IF EXISTS update_rw_schema_access();
CREATE OR REPLACE FUNCTION update_rw_schema_access()
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$ 
DECLARE
    query text;
    dba_rolename text;
    rw_rolename text;
    adhoc_rolename text;
    curr_db RECORD;
    schemaname text := 'reports';
BEGIN
    SELECT current_database() INTO curr_db;
    SELECT distinct(schema_owner) INTO dba_rolename FROM information_schema.schemata where schema_owner like 'eds_%_dba';
    rw_rolename := REPLACE (dba_rolename,'dba','rw');
    adhoc_rolename := REPLACE (dba_rolename,'dba','adhoc');
    SELECT 'GRANT CREATE ON DATABASE ' || curr_db.current_database || ' TO ' || rw_rolename || ';' INTO query;
    EXECUTE query;
    RAISE INFO 'RW ROLE CREATE SCHEMA ACCESS GRANTED FOR DATABASE %', curr_db.current_database;
    SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || rw_rolename ||';' INTO query;
    EXECUTE query;
    SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || rw_rolename ||';' INTO query;
    EXECUTE query;
    RAISE INFO 'RW ROLE USAGE ACCESS GRANTED FOR % SCHEMA', schemaname;
    SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
    EXECUTE query;
    SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
    EXECUTE query;
    RAISE INFO 'ADHOC ROLE USAGE ACCESS GRANTED FOR % SCHEMA', schemaname;
	RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        RAISE INFO 'ERROR GRANTING CREATE SCHEMA ACCESS TO RW ROLE FOR DATABASE %', curr_db.current_database;
        RETURN FALSE;
END;
$BODY$;