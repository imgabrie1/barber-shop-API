import { Request, Response } from "express";
import { iUser } from "../interfaces/user.interface";
import createUserService from "../services/users/createUser.service";
import { hashSync } from "bcryptjs";
import { AppError } from "../errors";
import patchUserService from "../services/users/patchUser.service";
import getUsersService from "../services/users/getUsers.service";
import autoDeleteUserService from "../services/users/autoDeleteUser.service";

export const createUserController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userData: iUser = req.body;

  const newUser = await createUserService(userData);

  return res.status(201).json(newUser);
};

export const patchUserController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req;
  if (id !== req.params.id) {
    throw new AppError(
      "tu só pode editar tua própria conta, como tu chegou até aqui?",
      401,
    );
  }

  let newPassword = req.body.password;
  let updatedData = { ...req.body };

  if (newPassword) {
    newPassword = hashSync(newPassword, 10);
    updatedData.password = newPassword;
  } else {
    delete updatedData.password;
  }

  const user = await patchUserService(updatedData, id);

  return res.status(200).json(user);
};

export const getUsersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const users = await getUsersService();
  return res.status(200).json(users);
};

export const autoDeleteUserController = async (req: Request, res: Response) => {
  const { id } = req;
  autoDeleteUserService(id);
  return res.status(204).send();
};
