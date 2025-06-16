import { useState } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect({ onConnected }) {
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      onConnected(signer);
    } else {
      alert("Install MetaMask");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      {address ? (
        <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
