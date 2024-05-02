import express from "express";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import path, { dirname } from "path";

import { formidable } from 'formidable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(__dirname + "/static"));
app.use(express.json());

console.log(__dirname);

const uploads = {};

app.post("/upload", async (req, res) => {
  const uploadId = req.get("uploadid");

  let totalChunkLength = 0;

  // Check if the Content-Length header is present
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    console.log(`Expected size of the data is ${contentLength / 100000} megabytes`);
  } else {
    console.log("Content-Length header is missing");
  }

  if(!(uploadId in uploads)) {
    uploads[uploadId] = [0, parseInt(contentLength)];
  }

  setTimeout(() => {
    delete uploads[uploadId];
  }, 60 * 5 * 1000);

  req.on("data", (chunk) => {
    totalChunkLength += chunk.length;
    uploads[uploadId][0] += chunk.length;
  });

  req.on("end", () => {
    console.log(totalChunkLength, contentLength);
    res.send("done");
  });
});

app.post("/uploadProgress", (req, res) => {
  const uploadId = req.body["uploadId"];
  if(uploadId === undefined) {
    res.send(-1);
  }
  else {
    if(uploadId in uploads) {
      res.send({
        bytesRecvd: uploads[uploadId][0],
        totalBytes: uploads[uploadId][1]
      });
    }
    else {
      res.send({
        bytesRecvd: -1,
        totalBytes: -1
      });
    }
  }
});

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(PORT, () => {
  console.log("Server running at Port", PORT);
});