const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Parse allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow tools like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

const sentAddresses = new Set();

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post("/faucet", async (req, res) => {
  const { address } = req.body;

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  if (sentAddresses.has(address)) {
    return res.status(400).json({ error: "Already received MATIC" });
  }

  try {
    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.parseEther("2.0"),
    });

    await tx.wait();
    sentAddresses.add(address);
    console.log(`✅ Sent 2 MATIC to ${address}`);

    res.json({ success: true, hash: tx.hash });
  } catch (err) {
    console.error("Transaction failed:", err);
    res.status(500).json({ error: "Transaction failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Faucet server running on http://localhost:${PORT}`);
});
