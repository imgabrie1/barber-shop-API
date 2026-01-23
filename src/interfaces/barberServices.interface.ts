import { DeepPartial, Repository } from "typeorm";
import z from "zod";
import {
  returnMultipleServiceSchema,
  returnServiceSchema,
  serviceSchema,
} from "../schemas/barberServices.schema";
import { Service } from "../entities/services.entity";

export type iService = z.infer<typeof serviceSchema>;
export type iServiceReturn = z.infer<typeof returnServiceSchema>;
export type iUsersReturn = z.infer<typeof returnMultipleServiceSchema>;
export type iUserUpdate = DeepPartial<iService>;

export type iRepoService = Repository<Service>;
