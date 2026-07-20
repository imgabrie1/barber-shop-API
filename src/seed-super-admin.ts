import "dotenv/config";
import { AppDataSource } from "./data-source";
import { User } from "./entities/user.entity";
import roleEnum from "./enum/role.enum";

const seedSuperAdmin = async () => {
  const phoneNumber = process.env.SUPER_ADMIN_PHONE;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!phoneNumber || !password) {
    console.error(
      "Erro: variáveis SUPER_ADMIN_PHONE e SUPER_ADMIN_PASSWORD são obrigatórias.",
    );
    process.exit(1);
  }

  try {
    await AppDataSource.initialize();
    console.log("Conectado ao banco de dados!");

    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({
      where: { phoneNumber },
    });

    if (existingUser) {
      console.log("Usuário já existe, atualizando para SUPER_ADMIN...");
      existingUser.role = roleEnum.SUPER_ADMIN;
      (existingUser as any).tenant = null;

      await userRepo.save(existingUser);
      console.log("Usuário atualizado com sucesso para SUPER_ADMIN!");
    } else {
      console.log("Criando novo usuário SUPER_ADMIN...");

      const superAdmin = userRepo.create({
        name: "Dev (Super Admin)",
        phoneNumber,
        password,
        role: roleEnum.SUPER_ADMIN,
      });

      await userRepo.save(superAdmin);
      console.log("Novo SUPER_ADMIN criado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao rodar seed:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

seedSuperAdmin();
