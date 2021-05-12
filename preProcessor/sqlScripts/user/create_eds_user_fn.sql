DROP FUNCTION IF EXISTS create_eds_user(TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_eds_user(
    dba_rolename text,
    roletype text,
    rolename text,
    uname text,
    pword text)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$ 
DECLARE 
    _query text;
    curr_db RECORD;
    each_schema RECORD;
BEGIN
    /* PURPOSE:  */
    SELECT current_database() INTO curr_db;
    CASE roletype

        WHEN 'rw' THEN
            /* CREATE RW ROLE */
            BEGIN
                SELECT 'CREATE ROLE ' || rolename || ';' INTO _query; 
                EXECUTE _query;
                RAISE INFO '% ROLE CREATED SUCCESSFULLY', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR CREATING % ROLE. ALREADY EXISTS?', rolename;
                    RETURN FALSE;
            END;
            /* GRANT CONNECT TO RW ROLE */
            BEGIN
                SELECT 'GRANT CONNECT, CREATE ON DATABASE ' || curr_db.current_database || ' TO ' || rolename || ';' INTO _query;
                EXECUTE _query;
                RAISE INFO 'ACCESS GRANTED SUCCESSFULLY TO % ROLE', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO % ROLE', rolename;
                    RETURN FALSE;
            END;
            /* GRANT RW ROLE TO DBA - DBA becomes superset for RW */
            BEGIN
                SELECT 'GRANT ' || rolename || ' TO ' || dba_rolename || ';' INTO _query;
                EXECUTE _query;
                RAISE INFO '% ROLE GRANTED TO % DBA ROLE SUCCESSFULLY', rolename, dba_rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING % ROLE TO % DBA ROLE ', rolename, dba_rolename;
                    RETURN FALSE;
            END;

        WHEN 'ro' THEN
            /* CREATE RO ROLE */
            BEGIN
                SELECT 'CREATE ROLE ' || rolename || ';' INTO _query; 
                EXECUTE _query;
                RAISE INFO '% ROLE CREATED SUCCESSFULLY', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR CREATING % ROLE. ALREADY EXISTS?', rolename;
                    RETURN FALSE;
            END;
            /* GRANT CONNECT TO RO ROLE */
            BEGIN
                SELECT 'GRANT CONNECT ON DATABASE ' || curr_db.current_database || ' TO ' || rolename || ';' INTO _query; 
                EXECUTE _query;
                RAISE INFO 'ACCESS GRANTED SUCCESSFULLY TO % ROLE', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO % ROLE', rolename;
                    RETURN FALSE;
            END;
            /* GRANT RO ROLE TO DBA - DBA becomes superset for RO */
            BEGIN
                SELECT 'GRANT ' || rolename || ' TO ' || dba_rolename || ';' INTO _query;
                EXECUTE _query;
                RAISE INFO '% ROLE GRANTED TO % DBA ROLE SUCCESSFULLY', rolename, dba_rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING % ROLE TO % DBA ROLE ', rolename, dba_rolename;
                    RETURN FALSE;
            END;

        WHEN 'adhoc' THEN
            /* CREATE RO ROLE */
            BEGIN
                SELECT 'CREATE ROLE ' || rolename || ';' INTO _query; 
                EXECUTE _query;
                RAISE INFO '% ROLE CREATED SUCCESSFULLY', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR CREATING % ROLE. ALREADY EXISTS?', rolename;
                    RETURN FALSE;
            END;
            /* GRANT CONNECT TO ADHOC ROLE */
            BEGIN
                SELECT 'GRANT CONNECT ON DATABASE ' || curr_db.current_database || ' TO ' || rolename || ';' INTO _query; 
                EXECUTE _query;
                RAISE INFO 'ACCESS GRANTED SUCCESSFULLY TO % ROLE', rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING ACCESS TO % ROLE', rolename;
                    RETURN FALSE;
            END;
            /* GRANT ADHOC ROLE TO DBA - DBA becomes superset for ADHOC */
            BEGIN
                SELECT 'GRANT ' || rolename || ' TO ' || dba_rolename || ';' INTO _query;
                EXECUTE _query;
                RAISE INFO '% ROLE GRANTED TO % DBA ROLE SUCCESSFULLY', rolename, dba_rolename;
                EXCEPTION WHEN OTHERS THEN
                    RAISE INFO 'ERROR GRANTING % ROLE TO % DBA ROLE ', rolename, dba_rolename;
                    RETURN FALSE;
            END;

        ELSE
            RAISE INFO 'ERROR INVALID ROLENAME PASSED';
            RETURN FALSE;
    END CASE;


    /* CREATE USER */
    BEGIN
        SELECT 'CREATE USER ' || uname || ' WITH PASSWORD ''' || pword || ''';' INTO _query; 
        EXECUTE _query;
        RAISE INFO '% USER CREATED SUCCESSFULLY', uname;
        EXCEPTION WHEN OTHERS THEN
            RAISE INFO 'ERROR CREATING USER %', uname;
            RETURN FALSE;
    END;

    /* GRANT ROLE TO USER */
    BEGIN
        SELECT 'GRANT ' || rolename || ' TO ' || uname || ';' INTO _query; 
        EXECUTE _query;
        SELECT 'ALTER USER ' || uname || ' SET ROLE ' || rolename || ';' INTO _query; 
        EXECUTE _query;
        RAISE INFO '% ROLE GRANTED TO % USER SUCCESSFULLY', rolename, uname;
        EXCEPTION WHEN OTHERS THEN
            RAISE INFO 'ERROR GRANTING % ROLE TO % USER', rolename, uname;
            RETURN FALSE;
    END;

    RETURN TRUE;
END;
$BODY$;