//require ('dotenv').config({path: './env'});

import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./db/index.js";


dotenv.config({
  path: './.env'
})


connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(` Server is running at PORT : ${process.env.PORT}`)
  })
  app.on("err", (err) => {
    console.log("Error aaya h:", err);
    throw err;
  })
})
.catch((err) => {
  console.log("Mongo DB connection fail !!!", err);
})



