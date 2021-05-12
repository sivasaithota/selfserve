DROP TABLE IF EXISTS "triggers";

CREATE TABLE triggers (
    id SERIAL PRIMARY KEY,
    point_name character varying(50),
    table_id integer,
    action_id integer,
    execution_order integer,
    scenario_template_id integer,
    scenario_id integer references projects (id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by character varying(255),
    updated_by character varying(255)
);
