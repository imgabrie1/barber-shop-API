import { User } from "../../entities/user.entity";
import roleEnum from "../../enum/role.enum";

declare global {
  namespace Express {
    interface Request {
      id: string;
      role: string;
      user: User
    }
  }
}
