const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const sentAddresses = new Set(); // In-memory store (use DB in prod)

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
      value: ethers.parseEther("2.0"), // Send 2 MATIC
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Faucet server running on http://localhost:${PORT}`);
});
