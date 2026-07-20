import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { TenantContext } from "../utils/tenantContext";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<any>) {
    if (!TenantContext.isBypassed()) {
      const tenantId = TenantContext.getTenantId();
      if (tenantId) {
        const metadata = event.metadata;
        const hasTenantRelation = metadata.relations.some(
          (rel) => rel.propertyName === "tenant"
        );
        if (hasTenantRelation && !event.entity.tenant) {
          event.entity.tenant = { id: tenantId };
        }
      }
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (!TenantContext.isBypassed()) {
      const tenantId = TenantContext.getTenantId();
      if (tenantId) {
        const metadata = event.metadata;
        const hasTenantRelation = metadata.relations.some(
          (rel) => rel.propertyName === "tenant"
        );
        if (hasTenantRelation && event.entity && !event.entity.tenant) {
          event.entity.tenant = { id: tenantId };
        }
      }
    }
  }
}
