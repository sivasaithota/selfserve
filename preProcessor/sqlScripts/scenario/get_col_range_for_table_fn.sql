DROP FUNCTION IF EXISTS get_col_range_for_table(INTEGER, TEXT);

CREATE OR REPLACE FUNCTION get_col_range_for_table(scenario_id INTEGER, table_value TEXT)

RETURNS TABLE("columnValues" JSON) AS $$

DECLARE

  dataTypeArr TEXT[];

  columnArr TEXT[];

  index INTEGER;

  column_query TEXT;

  query_str TEXT;

  column_list TEXT;

  columnValues TEXT;

  columnNames TEXT;

BEGIN

  SELECT ARRAY_AGG(data_type::TEXT), ARRAY_AGG(column_name::TEXT) INTO dataTypeArr, columnArr
  FROM information_schema.columns
  WHERE table_schema = CONCAT('scenario_',scenario_id) AND
        table_name = table_value AND (data_type IN ('numeric','integer', 'double precision', 'date', 'bigint') OR data_type ILIKE 'timestamp%' OR data_type ILIKE 'time%');

  SELECT l."visiblecolumns" INTO column_list
    FROM "lkp_data_upload_tables" l
    INNER JOIN "projects" p 
      ON l."version" = p."version"
      AND p."id" = scenario_id
      AND l.scenario_template_id = p.scenario_template_id
    WHERE l."tablename" = table_value;

  FOR index in 1..ARRAY_LENGTH(columnArr,1)

  LOOP

    IF (strpos(column_list, columnArr[index]) >0 ) THEN

      columnNames := CONCAT(columnNames,'"',columnArr[index],'_min","',columnArr[index],'_max",');

      columnValues := CONCAT(columnValues,'MIN("',columnArr[index],'"), MAX("',columnArr[index],'"),');

    END IF;

  END LOOP;

  IF (columnNames IS NOT NULL ) THEN

    columnNames := LEFT(columnNames,LENGTH(columnNames)-1);

    columnValues := LEFT(columnValues,LENGTH(columnValues)-1);

    query_str := CONCAT('SELECT row_to_json(data) AS "columnValues" FROM (SELECT ',columnValues,' FROM scenario_',scenario_id,'."',table_value,'") data(',columnNames,');');

    RETURN QUERY EXECUTE query_str;

  ELSE

    RETURN;

  END IF;

END;

$$  LANGUAGE plpgsql;
