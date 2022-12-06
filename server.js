import express from 'express';
const app = express();
import * as dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import connect from './db/db.config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

//Routes
import userRouter from './routes/user.routes.js';

//Middleware
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';

const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public')))

app.get('/', (req, res)=>{
    res.status(200).send('WELCOME :) ');
})

app.use('/api/v1/user', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connect(process.env.MONGO_URI);
    app.listen(PORT, console.log(`Server up and running in ${PORT}`));
  } catch (error) {
    console.log(error); 
  }
};

start();
