CREATE TRIGGER records_activity_insert AFTER INSERT ON records
WHEN NEW.updatedBy IS NOT NULL AND NEW.updatedBy <> 'system:seed'
BEGIN
  INSERT INTO audits (organizationId,entityId,action,after,actor,timestamp)
  VALUES (NEW.organizationId,NEW.id,'Created ' || NEW.kind,
    json_object('kind',NEW.kind,'name',NEW.name,'data',json(NEW.data),'quantity',NEW.quantity),NEW.updatedBy,NEW.updatedAt);
END;
--> statement-breakpoint
CREATE TRIGGER records_activity_update AFTER UPDATE ON records
WHEN NEW.updatedBy IS NOT NULL AND NEW.updatedBy <> 'system:seed'
  AND (NEW.name <> OLD.name OR NEW.data <> OLD.data OR NEW.quantity <> OLD.quantity)
BEGIN
  INSERT INTO audits (organizationId,entityId,action,before,after,actor,timestamp)
  VALUES (NEW.organizationId,NEW.id,'Updated ' || NEW.kind,
    json_object('kind',OLD.kind,'name',OLD.name,'data',json(OLD.data),'quantity',OLD.quantity),
    json_object('kind',NEW.kind,'name',NEW.name,'data',json(NEW.data),'quantity',NEW.quantity),NEW.updatedBy,NEW.updatedAt);
END;
