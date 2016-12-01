CREATE TABLE logs.log (log_id integer, ts date);

CREATE OR REPLACE FUNCTION logs.trg_log_partition()
  RETURNS TRIGGER AS
$func$
DECLARE
   _tbl text := to_char(NEW.ts, '"logs.log_"YYYY_DDD_') || NEW.log_id;
BEGIN
   IF NOT EXISTS (
      SELECT 1
      FROM   pg_catalog.pg_class c
      JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE  n.nspname = 'logs'
      AND    c.relname = _tbl
      AND    c.relkind = 'r') THEN

      EXECUTE format('CREATE TABLE %I (CHECK (ts >= %L AND
                                              ts <  %L)) INHERITS (logs.log)'
              , _tbl
              , to_char(NEW.ts,     'YYYY-MM-DD')
              , to_char(NEW.ts + 1, 'YYYY-MM-DD')
              );
   END IF;

   EXECUTE 'INSERT INTO ' || quote_ident(_tbl) || ' VALUES ($1.*)'
   USING NEW;

   RETURN NULL;
END
$func$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER insbef
BEFORE INSERT ON logs.log
FOR EACH ROW EXECUTE PROCEDURE logs.trg_log_partition();
