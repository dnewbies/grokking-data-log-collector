CREATE TABLE ping (ping_id integer, the_date date);

CREATE OR REPLACE FUNCTION trg_ping_partition()
  RETURNS TRIGGER AS
$func$
DECLARE
   _tbl text := to_char(NEW.the_date, '"ping_"YYYY_DDD_') || NEW.ping_id;
BEGIN
   IF NOT EXISTS (
      SELECT 1
      FROM   pg_catalog.pg_class c
      JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE  n.nspname = 'logs'  -- your schema
      AND    c.relname = _tbl
      AND    c.relkind = 'r') THEN

      EXECUTE format('CREATE TABLE %I (CHECK (the_date >= %L AND
                                              the_date <  %L)) INHERITS (ping)'
              , _tbl
              , to_char(NEW.the_date,     'YYYY-MM-DD')
              , to_char(NEW.the_date + 1, 'YYYY-MM-DD')
              );
   END IF;

   EXECUTE 'INSERT INTO ' || quote_ident(_tbl) || ' VALUES ($1.*)'
   USING NEW;

   RETURN NULL;
END
$func$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER insbef
BEFORE INSERT ON ping
FOR EACH ROW EXECUTE PROCEDURE trg_ping_partition();
