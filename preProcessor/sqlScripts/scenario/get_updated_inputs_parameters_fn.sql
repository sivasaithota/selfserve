drop function IF EXISTS get_updated_parameters(INTEGER);

create or replace function get_updated_parameters(scenario_id integer)

RETURNS SETOF RECORD as $$

DECLARE
  query TEXT;
  rec record;
  input_record RECORD;
  input_json JSON;
  input_tab TEXT;
  parameter_record RECORD;
  parameter_json JSON;
  parameter_tab TEXT;
  table_existance BOOLEAN;
begin
	select pt.id table_id, pt.table_name, pt.updated_at input_updated_at
    into input_record
    from project_tables pt
    where pt.pid = scenario_id and pt.type = 'input'  order by pt.updated_at desc;
	select json_agg(input_record) into input_json;
	select 'inputs' into input_tab;
	select input_tab,input_json into rec;
	return next rec;

    query := CONCAT ('SELECT EXISTS ( SELECT 1 FROM information_schema.tables WHERE table_schema =''scenario_',scenario_id,''' AND table_name =''parameters'')');
    EXECUTE query INTO table_existance;
	IF table_existance IS NOT false THEN
		query := CONCAT('SELECT p.id parameter_id, p.displayname parameter_name, p.updated_at parameter_updated_at
        FROM scenario_',scenario_id,'.parameters p order by p.updated_at desc;');
      EXECUTE query INTO parameter_record;
      SELECT json_agg(parameter_record) INTO parameter_json;
      SELECT 'parameters' INTO parameter_tab;
      SELECT parameter_tab,parameter_json into rec;
      return next rec;
	END IF;

END $$ language plpgsql;
