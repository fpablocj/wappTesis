import { Client } from 'whatsapp-web.js';
import { toDataURL } from 'qrcode';

const sessions = new Map();

const getQRCode = (req:any, res:any) => {
  const sessionId = req.params.sessionId;
  const client = new Client({
    puppeteer: {
      args: ["--disable-setuid-sandbox", "--unhandled-rejections=strict"],
      headless: true,
    },
  });

  let qrSent = false;

  client.on('qr', async (qr) => {
    try {
      if (!qrSent) {
        qrSent = true;
        const url = await toDataURL(qr);
        res.send({qr:url});
      }
    } catch (err) {
      res.status(500).send('Error al generar el código QR.');
    }
  });

  client.on('ready', () => {
    const timeoutMilliseconds = 5000; // 5 segundos de timeout
  let readyHandled = false; // Para evitar ejecución repetida

  const handleReady = () => {
    if (!readyHandled) {
      readyHandled = true;
      console.log(`Usuario ${sessionId} listo`);
      // Tu código adicional en caso de éxito
    }
  };

  setTimeout(() => {
    handleReady();
  }, timeoutMilliseconds);
  });

  client.on('message', (msg) => {
    console.log(`Mensaje recibido en la sesión ${sessionId}: ${msg.body}`);
  });

  client.on('disconnected', (reason) => {
    console.log(`Cliente ${sessionId} desconectado:`, reason);


    setTimeout(() => {
      client.destroy();
      sessions.delete(sessionId);
      console.log(`Sesión ${sessionId} desconectada y eliminada.`);
    }, 5000);

  });

  client.initialize();
  sessions.set(sessionId, client);
};

// Función para enviar un mensaje desde una sesión específica
const sendMessage = (req:any, res:any) => {
  const sessionId = req.params.sessionId;
  const client = sessions.get(sessionId);

  if (!client) return res.send({msg:'Sesión no encontrada'});

  const { phone, message } = req.body;

  client.sendMessage(`${phone}@c.us`, message)
    .then((response:any) => res.send(response))
    .catch((err:any) => res.status(500).send({msg: err}));
};

// Función para desconectar una sesión
const disconnectSession = (req:any, res:any) => {
  const sessionId = req.params.sessionId;
  const client = sessions.get(sessionId);

  if (!client) return res.send({msg:'La sesión no se encuentra abierta'});

  client.destroy();
  sessions.delete(sessionId);

  res.send({msg:`Sesión ${sessionId} desconectada y eliminada, no olvide cerrar la sesión en su dispositivo`});
};

const viewSession = (req: any, res: any) => {
  const sessionId = req.params.sessionId;
  const client = sessions.get(sessionId);

  if (!client) {
    return res.send({ msg: 'Sesión no iniciada' });
  } else {
    return res.send({ msg: `¡Sesión establecida con el Usuario #${sessionId}!` });
  }
};
export {
  getQRCode,
  viewSession,
  sendMessage,
  disconnectSession,
};
