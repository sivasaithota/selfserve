DROP FUNCTION IF EXISTS PUBLIC.grant_ro_user(uname TEXT);

CREATE OR REPLACE FUNCTION PUBLIC.grant_ro_user(uname TEXT) 
	returns BOOLEAN AS 
$BODY$
DECLARE 
	_query TEXT;
	dbname TEXT;
	scname TEXT;
BEGIN
	dbname := current_database();
	scname := 'reports';

	BEGIN
		/* SCHEMA CREATION */
		BEGIN
			CREATE SCHEMA reports;
		EXCEPTION WHEN OTHERS THEN
			RAISE INFO '% - SCHEMA ALREADY EXISTS', scname;
		END;

		/* SCHEMA GRANTS */
		SELECT 'GRANT CONNECT ON database "' || dbname || '" to ' || uname INTO _query;
		EXECUTE _query;
		
 		SELECT 'GRANT USAGE ON SCHEMA ' || scname || ' to ' || uname INTO _query; 
 		EXECUTE _query;

		SELECT 'GRANT SELECT ON ALL TABLES IN SCHEMA ' || scname || ' to ' || uname INTO _query; 
		EXECUTE _query;
		
		RETURN TRUE;
	EXCEPTION WHEN OTHERS THEN
		RAISE INFO 'UNABLE TO GRANT PRIVILEGES. DOES THE SCHEMA % EXIST?', uname;
	END;
END;
$BODY$
LANGUAGE plpgsql;