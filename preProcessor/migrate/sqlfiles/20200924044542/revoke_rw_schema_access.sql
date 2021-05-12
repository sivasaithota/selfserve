DROP FUNCTION IF EXISTS revoke_rw_schema_access();
CREATE OR REPLACE FUNCTION revoke_rw_schema_access()
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
    SELECT 'REVOKE CREATE ON DATABASE ' || curr_db.current_database || ' FROM ' || rw_rolename || ';' INTO query;
    EXECUTE query;
    RAISE INFO 'RW ROLE CREATE SCHEMA ACCESS REVOKED FOR DATABASE %', curr_db.current_database;
    SELECT 'REVOKE USAGE ON SCHEMA ' || schemaname || ' FROM ' || rw_rolename ||';' INTO query;
    EXECUTE query;
    SELECT 'REVOKE SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' FROM ' || rw_rolename ||';' INTO query;
    EXECUTE query;
    RAISE INFO 'RW ROLE USAGE ACCESS REVOKED FOR % SCHEMA', schemaname;
    SELECT 'REVOKE USAGE ON SCHEMA ' || schemaname || ' FROM ' || adhoc_rolename ||';' INTO query;
    EXECUTE query;
    SELECT 'REVOKE SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' FROM ' || adhoc_rolename ||';' INTO query;
    EXECUTE query;
    RAISE INFO 'ADHOC ROLE USAGE ACCESS REVOKED FOR % SCHEMA', schemaname;
	RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        RAISE INFO 'ERROR REVOKING CREATE SCHEMA ACCESS TO RW ROLE FOR DATABASE %', curr_db.current_database;
        RETURN FALSE;
END;
$BODY$;