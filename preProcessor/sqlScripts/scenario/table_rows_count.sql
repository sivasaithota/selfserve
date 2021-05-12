CREATE OR REPLACE FUNCTION table_rows_count(tablename TEXT, scenario_id INTEGER)

RETURNS INTEGER AS $$

DECLARE 

    total_rows INTEGER :=0;

BEGIN
    SELECT n_live_tup INTO total_rows FROM pg_stat_user_tables WHERE schemaname='scenario_' || scenario_id and relname=tablename;
    RETURN  total_rows;
  END;
$$  LANGUAGE plpgsql;
