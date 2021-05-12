DROP FUNCTION IF EXISTS fn_restore_tables(TEXT);

CREATE OR REPLACE FUNCTION fn_restore_tables(tableName TEXT)

RETURNS void as $$

DECLARE

	query TEXT;

	maxId INTEGER;

	CNT BOOLEAN;

	table_cursor CURSOR FOR SELECT "pid","table_name" FROM public."project_tables";

	table_record RECORD;

	id_cursor CURSOR FOR SELECT DISTINCT "pid" FROM public."project_tables";

	id_record RECORD;

BEGIN

	query := CONCAT('SELECT MAX(id)+1 FROM ',tableName,';');

	EXECUTE query INTO maxID;

	query := CONCAT('ALTER SEQUENCE ',tableName,'_id_seq RESTART WITH ',maxId);

	EXECUTE query;

	IF tableName = 'project_tables'

	THEN

		OPEN table_cursor;

		LOOP

			FETCH table_cursor INTO table_record;

			EXIT WHEN NOT FOUND;

			--SELECT fn_populate_master_table(table_record.pid,table_record.table_name) into CNT;

		END LOOP;

		OPEN id_cursor;

		LOOP

			FETCH id_cursor INTO id_record;

			EXIT WHEN NOT FOUND;

			--SELECT fn_populate_master_parameter(id_record.pid) into CNT;

		END LOOP;

	ELSE

		query := CONCAT('SELECT MAX(order_id)+1 FROM ',tableName,';');

		EXECUTE query INTO maxID;

		query := CONCAT('ALTER SEQUENCE ',tableName,'_order_id_seq RESTART WITH ',maxId);

		EXECUTE query;

	END IF;

END;

$$  LANGUAGE plpgsql;
