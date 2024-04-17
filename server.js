import express from "express";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static(__dirname + "/static"))

console.log(__dirname);

app.post("/upload", async (req, res) => {
  let data = [];
  req.on("data", (chunk) => {
    data.push(chunk);
  });

  req.on("end", () => {
    //console.log("data all received");
    res.send("hooray!");
  });
});

app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(PORT, () => {
  console.log("Server running at Port", PORT);
});