import {
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
} from "typeorm";
import { TenantContext } from "./tenantContext";

const processingQBs = new WeakSet<any>();

function applyTenantFilter(qb: any) {
  if (TenantContext.isBypassed()) return;
  const tenantId = TenantContext.getTenantId();
  if (!tenantId) return;

  const mainAlias = qb.expressionMap?.mainAlias;
  if (!mainAlias) return;

  let hasTenant = false;
  try {
    hasTenant = !!(mainAlias.metadata?.relations?.some(
      (rel: any) => rel.propertyName === "tenant",
    ));
  } catch {
    return;
  }

  if (hasTenant) {
    const alias = mainAlias.name;
    const paramName = `tenantId_${alias}`;
    if (qb.expressionMap.parameters[paramName] === undefined) {
      qb.andWhere(`${alias}.tenant_id = :${paramName}`, {
        [paramName]: tenantId,
      });
    }
  }
}

function patchSelect(method: string) {
  const original = (SelectQueryBuilder.prototype as any)[method];
  if (!original) return;
  (SelectQueryBuilder.prototype as any)[method] = function (
    this: SelectQueryBuilder<any>,
    ...args: any[]
  ) {
    if (!processingQBs.has(this)) {
      processingQBs.add(this);
      applyTenantFilter(this);
    }
    return original.apply(this, args);
  };
}

const selectMethodsToPatch = [
  "getMany",
  "getOne",
  "getOneOrFail",
  "getManyAndCount",
  "getCount",
  "getExists",
  "getRawOne",
  "getRawMany",
  "getRawAndEntities",
  "stream",
];

selectMethodsToPatch.forEach(patchSelect);

const updateOriginalExecute = UpdateQueryBuilder.prototype.execute;
UpdateQueryBuilder.prototype.execute = function (
  this: UpdateQueryBuilder<any>,
  ...args: any[]
) {
  if (!processingQBs.has(this)) {
    processingQBs.add(this);
    applyTenantFilter(this);
  }
  return updateOriginalExecute.apply(this, args as any);
};

const deleteOriginalExecute = DeleteQueryBuilder.prototype.execute;
DeleteQueryBuilder.prototype.execute = function (
  this: DeleteQueryBuilder<any>,
  ...args: any[]
) {
  if (!processingQBs.has(this)) {
    processingQBs.add(this);
    applyTenantFilter(this);
  }
  return deleteOriginalExecute.apply(this, args as any);
};
