import express from 'express';
import cors from "cors"
import whatsappRoutes from './routes/whatsappRoutes';

const PORT = 3001;

const app = express();
app.use(cors())


const sessions = new Map();

app.use('/lead', whatsappRoutes);


app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));


