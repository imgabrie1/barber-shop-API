import { Router } from "express";
import { TenantContext } from "../utils/tenantContext";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import {
  isWhatsAppConnected,
  getWhatsAppQrCode,
  initWhatsApp,
} from "../services/whatsapp/whatsapp.client";

export const whatsappRouter = Router();

whatsappRouter.get("/status", ensureUserIsAuthenticatedMiddleware, (req, res) => {
  const tenantId = TenantContext.getTenantId();
  if (!tenantId) {
    res.status(400).json({ message: "Tenant não identificado" });
    return;
  }

  const connected = isWhatsAppConnected(tenantId);
  const qr = getWhatsAppQrCode(tenantId);

  res.json({ connected, qr });
});

whatsappRouter.post("/start", ensureUserIsAuthenticatedMiddleware, async (req, res) => {
  const tenantId = TenantContext.getTenantId();
  if (!tenantId) {
    res.status(400).json({ message: "Tenant não identificado" });
    return;
  }

  try {
    if (isWhatsAppConnected(tenantId)) {
      res.json({ message: "WhatsApp já está conectado." });
      return;
    }

    await initWhatsApp(tenantId, true);

    res.json({ message: "Inicialização do WhatsApp disparada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Falha ao iniciar o WhatsApp" });
  }
});
