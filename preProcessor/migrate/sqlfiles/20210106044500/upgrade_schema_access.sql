CREATE OR REPLACE FUNCTION public.upgrade_grant_schema_access(schemaname text)
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
    adhoc_rolename := REPLACE (dba_rolename,'_dba','_adhoc');
    rw_rolename := REPLACE (dba_rolename,'_dba','_rw');
    ro_rolename := REPLACE (dba_rolename,'_dba','_ro');

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
                SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || ro_rolename ||';' INTO query;
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
                SELECT 'GRANT ALL ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || rw_rolename || ';' INTO query;
                EXECUTE query;
                SELECT 'GRANT ALL ON ALL SEQUENCES IN SCHEMA ' || schemaname || ' TO ' || rw_rolename || ';' INTO query;
                EXECUTE query;
                SELECT 'GRANT USAGE ON SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
                EXECUTE query;
                SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || schemaname || ' TO ' || adhoc_rolename ||';' INTO query;
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

CREATE OR REPLACE FUNCTION public.upgrade_scenario_schema_access()
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$ 
DECLARE
    query text;
	role text;
	scenario_schemas text[];
	scenario_schema text;
    dba_rolename text;
    adhoc_rolename text;
    rw_rolename text;
    ro_rolename text;
BEGIN
    SELECT distinct(schema_owner) INTO dba_rolename FROM information_schema.schemata where schema_owner like 'eds_%_dba';
    adhoc_rolename := REPLACE (dba_rolename,'_dba','_adhoc');
    rw_rolename := REPLACE (dba_rolename,'_dba','_rw');
    ro_rolename := REPLACE (dba_rolename,'_dba','_ro');
    scenario_schemas := ARRAY(SELECT distinct(schemaname::text) FROM pg_tables WHERE schemaname NOT LIKE 'scenario_parent' AND schemaname LIKE 'scenario_%');
    FOREACH scenario_schema in ARRAY scenario_schemas
    LOOP
        BEGIN
            SELECT 'GRANT ALL PRIVILEGES ON SCHEMA ' || scenario_schema || ' TO ' || rw_rolename ||';' INTO query;
            EXECUTE query;
            SELECT 'GRANT ALL ON ALL TABLES IN SCHEMA ' || scenario_schema || ' TO ' || rw_rolename || ';' INTO query;
            EXECUTE query;
            SELECT 'GRANT ALL ON ALL SEQUENCES IN SCHEMA ' || scenario_schema || ' TO ' || rw_rolename || ';' INTO query;
            EXECUTE query;
            SELECT 'GRANT USAGE ON SCHEMA ' || scenario_schema || ' TO ' || adhoc_rolename ||';' INTO query;
            EXECUTE query;
            SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || scenario_schema || ' TO ' || adhoc_rolename ||';' INTO query;
            EXECUTE query;           
            SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || scenario_schema || ' GRANT ALL PRIVILEGES ON TABLES TO ' || rw_rolename ||';' INTO query;
            EXECUTE query;
            SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || scenario_schema || ' GRANT ALL PRIVILEGES ON SEQUENCES TO ' || rw_rolename ||';' INTO query;
            EXECUTE query;
            SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || dba_rolename || ' IN SCHEMA ' || scenario_schema || ' GRANT SELECT ON TABLES TO ' || adhoc_rolename ||';' INTO query;
            EXECUTE query;
            SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE ' || rw_rolename || ' IN SCHEMA ' || scenario_schema || ' GRANT SELECT ON TABLES TO ' || adhoc_rolename ||';' INTO query;
            EXECUTE query;
            RAISE INFO 'RW & ADHOC ROLE ACCESS GRANTED FOR SCHEMA %', scenario_schema;
            EXCEPTION WHEN OTHERS THEN
            RAISE INFO 'ERROR GRANTING ACCESS TO RW & ADHOC ROLE FOR SCHEMA %', schemaname;
            RETURN FALSE;
        END;
    END LOOP;
    RETURN TRUE;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.upgrade_report_schema_access()
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
    rw_rolename := REPLACE (dba_rolename,'_dba','_rw');
    adhoc_rolename := REPLACE (dba_rolename,'_dba','_adhoc');
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

