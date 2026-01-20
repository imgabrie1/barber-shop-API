import { DeepPartial, Repository } from "typeorm"
import z from "zod"
import { User } from "../entities/user.entity"
import { userSchema, returnUserSchema, returnMultipleUserSchema } from "../schemas/users.schema"


export type iUser = z.infer<typeof userSchema>
export type iUserReturn = z.infer<typeof returnUserSchema>
export type iUsersReturn = z.infer<typeof returnMultipleUserSchema>
export type iUserUpdate = DeepPartial<iUser>

export type iRepoUser = Repository<User>