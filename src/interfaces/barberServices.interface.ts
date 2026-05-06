import { DeepPartial, Repository } from "typeorm";
import z from "zod";
import {
  returnMultipleServiceSchema,
  returnServiceSchema,
  returnShopSchema,
  serviceSchema,
  shopSchema,
  updateShopSchema,
} from "../schemas/barberServices.schema";
import { Service } from "../entities/services.entity";

export type iService = z.infer<typeof serviceSchema>;
export type iShop = z.infer<typeof shopSchema>;
export type iReturnShops = z.infer<typeof returnShopSchema>;
export type iShopUpdate = z.infer<typeof updateShopSchema>;
export type iServiceReturn = z.infer<typeof returnServiceSchema>;
export type iUsersReturn = z.infer<typeof returnMultipleServiceSchema>;
export type iServiceUpdate = DeepPartial<iService>;

export type iRepoService = Repository<Service>;
