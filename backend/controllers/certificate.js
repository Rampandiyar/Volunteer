const express = require("express");
const cors = require("cors");
const { createCanvas, loadImage } = require("canvas");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/generate-certificate", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Load certificate template (optional, can use a blank canvas)
  const background = await loadImage("https://i.imgur.com/4gU5jwS.png"); // Replace with your template URL
  ctx.drawImage(background, 0, 0, width, height);

  // Add certificate text
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Certificate of Appreciation", 220, 200);
  ctx.font = "25px Arial";
  ctx.fillText(`Presented to: ${name}`, 250, 280);
  ctx.font = "18px Arial";
  ctx.fillText("For outstanding contribution as a Volunteer", 190, 350);
  ctx.fillText("Date: " + new Date().toLocaleDateString(), 300, 400);

  // Convert canvas to image and send response
  const imageBuffer = canvas.toBuffer("image/png");
  res.setHeader("Content-Type", "image/png");
  res.send(imageBuffer);
});
