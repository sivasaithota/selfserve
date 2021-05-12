DROP FUNCTION IF EXISTS grant_schema_access(TEXT);
CREATE OR REPLACE FUNCTION public.grant_schema_access(schemaname text)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$ 
DECLARE
    dba_rolename text;
    rw_rolename text;
    ro_rolename text;
    adhoc_rolename text;
    query text;
    role text;
BEGIN
    SELECT distinct(schema_owner) INTO dba_rolename FROM information_schema.schemata where schema_owner like 'eds_%_dba';
    adhoc_rolename := REPLACE (dba_rolename,'dba','adhoc');
    rw_rolename := REPLACE (dba_rolename,'dba','rw');
    ro_rolename := REPLACE (dba_rolename,'dba','ro');
    
    /* PURPOSE:  */
    CASE schemaname
        WHEN 'workspace' THEN
            BEGIN
                SELECT 'GRANT ALL PRIVILEGES ON SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT ALL PRIVILEGES ON TABLES TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                RAISE INFO 'ACCESS GRANTED TO % ROLE FOR SCHEMA %', adhoc_rolename, schemaname;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO % ROLE FOR SCHEMA %', adhoc_rolename, schemaname;
                    RETURN FALSE;
            END;
        WHEN 'reports' THEN
            BEGIN
                SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || ro_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT SELECT ON TABLES TO ' || ro_rolename ||';' INTO query;
                EXECUTE query;
                RAISE INFO 'ACCESS GRANTED TO % ROLE FOR SCHEMA %', ro_rolename, schemaname;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO % ROLE FOR SCHEMA %', ro_rolename, schemaname;
                    RETURN FALSE;
            END;
        WHEN 'public' THEN
            BEGIN
                SELECT 'REVOKE ALL ON SCHEMA ' || schemaname || ' FROM PUBLIC;' INTO query;
                EXECUTE query;
                SELECT 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA ' || schemaname || ' FROM PUBLIC;' INTO query;
                EXECUTE query;
                SELECT 'REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA ' || schemaname || ' FROM PUBLIC;' INTO query;
                EXECUTE query;
                SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT SELECT ON TABLES TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                RAISE INFO '% SCHEMA ACCESS ALTERED SUCCESSFULLY', schemaname;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR ALTERING ACCESS FOR % SCHEMA', schemaname;
                    RETURN FALSE;
            END;
        WHEN 'scenario_parent' THEN
            BEGIN
                -- No purticular privileges for scenario_parent
            END;
        ELSE
            BEGIN
                SELECT 'GRANT ALL PRIVILEGES ON SCHEMA ' || schemaname || ' TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT ALL PRIVILEGES ON TABLES TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT ALL PRIVILEGES ON SEQUENCES TO ' || rw_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || schemaname || ' GRANT SELECT ON TABLES TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || rw_rolename || ' IN SCHEMA ' || schemaname || ' GRANT SELECT ON TABLES TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                RAISE INFO 'RW & ADHOC ROLE ACCESS GRANTED FOR SCHEMA %', schemaname;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO RW & ADHOC ROLE FOR SCHEMA %', schemaname;
                    RETURN FALSE;
            END;
    END CASE;
    RETURN TRUE;
END;
$BODY$;