import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

job.start()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// let isConnected = false;

// app.use(async (req, res, next) => {
//     if (!isConnected) {
//       try {
//         await connectDB();
//         isConnected = true;
//         console.log('✅ DB connected');
//       } catch (err) {
//         console.error('❌ DB connection error', err);
//         return res.status(500).send('DB connection failed');
//       }
//     }
//     next();
//   });
connectDB()
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.log("Error connecting to database", error);
    })

app.use("/api/auth", authRoutes);
app.use("/api/auth", bookRoutes);
app.get("/", (req, res) => {
    res.send("Hello World");
})






export default app
