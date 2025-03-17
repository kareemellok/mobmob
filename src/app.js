import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/auth", bookRoutes);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server Online on Port => ${PORT}`)
    })
}).catch((error) => {
    console.log(`Database connection failed => ${error}`);
})