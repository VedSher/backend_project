import { Router } from "express";
<<<<<<< HEAD
import { registerUser } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(registerUser)
//http://localhost:8000/users/register
=======
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser);
>>>>>>> 5af6fe8339b4a728544dcefd6196b5621041ebfa

export default router;