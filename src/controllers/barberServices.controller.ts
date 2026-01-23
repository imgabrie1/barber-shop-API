import { Request, Response } from "express";
import createBarberServiceService from "../services/barberServices/createService.service";
import { iService } from "../interfaces/barberServices.interface";
import getBarberServicesService from "../services/barberServices/getBarberServices.service";
import getBarberServiceByIDService from "../services/barberServices/getBarberServiceByID.service";
import deleteBarberServiceService from "../services/barberServices/deleteBarberService.service";

export const createBarberServiceController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const serviceData: iService = req.body;

  const newService = await createBarberServiceService(serviceData);

  return res.status(201).json(newService);
};

export const getBarberServicesController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const services = await getBarberServicesService();
  return res.status(200).json(services);
};

export const getBarberServiceByIDController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const service = await getBarberServiceByIDService(id as string);
  return res.status(200).json(service);
};

export const deleteBarberServiceController = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  deleteBarberServiceService(id as string);
  return res.status(204).send();
};
