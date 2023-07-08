import express from 'express';
import vehiclesRoute from './routes/vehicles.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use('/vehicles', vehiclesRoute);

app.get('/', (req,res) => res.send("this is my map"));

app.listen(PORT, console.log(`Server is running on port: ${PORT}`));
