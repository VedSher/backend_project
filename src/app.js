import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
<<<<<<< HEAD
import userRouter from "./routes/user.routes.js";
=======
import userRouter from './routes/user.routes.js'
>>>>>>> 5af6fe8339b4a728544dcefd6196b5621041ebfa


//route declaration
app.use("/api/v1/users", userRouter)

export { app }