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
    console.log(`Usuario ${sessionId} listo`);
  });

  client.on('message', (msg) => {
    console.log(`Mensaje recibido en la sesión ${sessionId}: ${msg.body}`);
  });

  client.on('disconnected', (reason) => {
    console.log(`Cliente ${sessionId} desconectado:`, reason);


      client.destroy();
      client.pupBrowser.close();
      sessions.delete(sessionId);
      console.log(`Sesión ${sessionId} desconectada y eliminada.`);


  });

  client.initialize();
  sessions.set(sessionId, client);
};




const viewSession = (req: any, res: any) => {
  const sessionId = req.params.sessionId;
  const client = sessions.get(sessionId);
  

  if (client) {
    if(client.pupBrowser._process.connected){
      return res.send({ msg: `¡Sesión establecida con el Usuario #${sessionId}!` });
    }else{
      return res.send({ msg: 'Sesión no iniciada' });
    }
  } else {
    return res.send({ msg: 'Sesión no iniciada' });
  }
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

export {
  getQRCode,
  viewSession,
  sendMessage,
  disconnectSession,
};
