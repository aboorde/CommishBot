import "dotenv/config";

import express from "express";
import { respond } from "./bot.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("CommishBot, reporting for duty."));

app.post("/groupme", (req, res) => respond(req.body));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
