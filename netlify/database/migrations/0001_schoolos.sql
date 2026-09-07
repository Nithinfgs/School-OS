CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, ownerid TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY, organizationid TEXT NOT NULL REFERENCES organizations(id), userid TEXT NOT NULL,
  role TEXT NOT NULL, name TEXT NOT NULL, studentid TEXT, department TEXT, email TEXT, classes TEXT
);
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY, organizationid TEXT NOT NULL REFERENCES organizations(id), kind TEXT NOT NULL,
  name TEXT NOT NULL, data TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 0, updatedby TEXT, updatedat TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_records_org_kind ON records (organizationid, kind);
CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY, organizationid TEXT NOT NULL, entityid TEXT NOT NULL, action TEXT NOT NULL,
  before TEXT, after TEXT, actor TEXT NOT NULL, timestamp TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audits_org ON audits (organizationid);
CREATE TABLE IF NOT EXISTS teacher_class_logs (
  id TEXT PRIMARY KEY, organizationid TEXT NOT NULL REFERENCES organizations(id), classid TEXT NOT NULL REFERENCES records(id),
  date TEXT NOT NULL, period TEXT NOT NULL DEFAULT 'Daily', activities TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL, contentcovered TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', homework TEXT NOT NULL DEFAULT '',
  resources TEXT NOT NULL DEFAULT '[]', createdby TEXT NOT NULL REFERENCES members(id), updatedby TEXT NOT NULL REFERENCES members(id),
  createdat TEXT NOT NULL, updatedat TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_logs_org_class_date_period ON teacher_class_logs (organizationid, classid, date, period);

CREATE OR REPLACE FUNCTION schoolos_record_audit() RETURNS trigger AS $$
BEGIN
  IF NEW.updatedby IS NOT NULL AND NEW.updatedby <> 'system:seed' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO audits (organizationid, entityid, action, after, actor, timestamp)
      VALUES (NEW.organizationid, NEW.id, 'Created ' || NEW.kind,
        json_build_object('kind', NEW.kind, 'name', NEW.name, 'data', NEW.data::jsonb, 'quantity', NEW.quantity)::text,
        NEW.updatedby, NEW.updatedat);
    ELSIF NEW.name <> OLD.name OR NEW.data <> OLD.data OR NEW.quantity <> OLD.quantity THEN
      INSERT INTO audits (organizationid, entityid, action, before, after, actor, timestamp)
      VALUES (NEW.organizationid, NEW.id, 'Updated ' || NEW.kind,
        json_build_object('kind', OLD.kind, 'name', OLD.name, 'data', OLD.data::jsonb, 'quantity', OLD.quantity)::text,
        json_build_object('kind', NEW.kind, 'name', NEW.name, 'data', NEW.data::jsonb, 'quantity', NEW.quantity)::text,
        NEW.updatedby, NEW.updatedat);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS schoolos_records_insert_audit ON records;
CREATE TRIGGER schoolos_records_insert_audit AFTER INSERT ON records FOR EACH ROW EXECUTE FUNCTION schoolos_record_audit();
DROP TRIGGER IF EXISTS schoolos_records_update_audit ON records;
CREATE TRIGGER schoolos_records_update_audit AFTER UPDATE ON records FOR EACH ROW EXECUTE FUNCTION schoolos_record_audit();
