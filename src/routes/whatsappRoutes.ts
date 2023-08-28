import { Router, json } from 'express';
import { getQRCode, sendMessage, disconnectSession, viewSession } from '../controllers/whatsappController';

const router = Router();

// Ruta para mostrar el código QR y crear una nueva sesión
router.get('/qr/:sessionId', getQRCode);

// Ruta para enviar un mensaje desde una sesión específica
router.post('/send/:sessionId', json(), sendMessage);

// Ruta para desconectar una sesión
router.get('/disconect/:sessionId', disconnectSession);

router.get('/consult/:sessionId', viewSession);

export default router;


