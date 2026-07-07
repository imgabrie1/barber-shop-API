import { Router } from "express";
import { isWhatsAppConnected, getWhatsAppQrCode } from "../services/whatsapp/whatsapp.client";

export const whatsappRouter = Router();

whatsappRouter.get("/status", (req, res) => {
  const connected = isWhatsAppConnected();
  const qr = getWhatsAppQrCode();

  res.json({
    connected,
    qr,
  });
});
