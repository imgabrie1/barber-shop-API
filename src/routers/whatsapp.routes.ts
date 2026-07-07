import { Router } from "express";
import {
  isWhatsAppConnected,
  getWhatsAppQrCode,
  initWhatsApp,
} from "../services/whatsapp/whatsapp.client";

export const whatsappRouter = Router();

whatsappRouter.get("/status", (req, res) => {
  const connected = isWhatsAppConnected();
  const qr = getWhatsAppQrCode();

  res.json({
    connected,
    qr,
  });
});

whatsappRouter.post("/start", async (req, res) => {
  try {
    if (isWhatsAppConnected()) {
      return res.json({ message: "WhatsApp já está conectado." });
    }

    await initWhatsApp(true);

    res.json({ message: "Inicialização do WhatsApp disparada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Falha ao iniciar o WhatsApp" });
  }
});
