import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/abi";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const POLYGON_AMOY_CHAIN_ID = 80002; // Chain ID for Polygon Amoy (decimal)

  const init = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const { chainId } = await provider.getNetwork();
      const numericChainId = Number(chainId);
      console.log("Raw chainId from provider.getNetwork():", chainId);
      console.log("POLYGON_AMOY_CHAIN_ID (decimal):", POLYGON_AMOY_CHAIN_ID);
      setNetworkId(numericChainId);
      setIsCorrectNetwork(numericChainId === POLYGON_AMOY_CHAIN_ID);

      if (numericChainId !== POLYGON_AMOY_CHAIN_ID) {
        console.warn("Please connect to Polygon Amoy Testnet");
        setContract(null);
        return;
      }

      const todoContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(todoContract);
      console.log("Connected to contract:", todoContract.target);

      // Now that the contract is initialized, fetch tasks
      fetchTasks(todoContract);
    } catch (err) {
      console.error("Error connecting to local blockchain", err);
    }
  };

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on("chainChanged", (newChainId) => {
        console.log("Chain changed to:", newChainId);
        // newChainId from chainChanged event is already a hex string
        if (parseInt(newChainId, 16) !== POLYGON_AMOY_CHAIN_ID) {
          alert("Network changed. Please switch to Polygon Amoy Testnet.");
        }
        init();
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("Accounts changed to:", accounts);
        if (accounts.length === 0) {
          alert("Please connect your MetaMask account.");
          setAccount("");
          setContract(null);
        } else {
          init();
        }
      });

      return () => {
        window.ethereum.removeListener("chainChanged", init);
        window.ethereum.removeListener("accountsChanged", init);
      };
    }
  }, []);
  const requestFaucet = async (address) => {
    try {
      const res = await fetch(import.meta.env.VITE_FAUCET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();
      if (data.success) {
        console.log("💸 Faucet tx hash:", data.hash);
        alert("You received 2 MATIC!");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Faucet error:", err);
      alert("Faucet failed.");
    }
  };

  async function connectToAmoy() {
    try {
      // Try switching to Amoy if already added
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
                chainName: "Polygon Amoy Testnet",
                rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Add network failed:", addError);
          alert(
            "Could not add Amoy network. Please add it manually in MetaMask."
          );
          return;
        }
      } else {
        console.error("Switch network failed:", switchError);
        alert(
          "Could not switch to Amoy network. Error: " + switchError.message
        );
        return;
      }
    }
    init(); // Re-init your app with correct network
  }

  const fetchTasks = async (contractInstance) => {
    try {
      const allTasks = await contractInstance.getMyTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleAddTask = async () => {
    if (!contract || !input.trim()) return;

    try {
      const tx = await contract.addTask(input);
      await tx.wait();
      setInput("");
      fetchTasks(contract);
      console.log("Task added!");
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };

  const handleToggle = async (id) => {
    if (!contract) return;
    try {
      const tx = await contract.toggleTask(id);
      await tx.wait();
      fetchTasks(contract);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!contract) return;
    try {
      const tx = await contract.deleteTask(id);
      await tx.wait();
      fetchTasks(contract);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">📝 ChainTask</h1>
      {!account && (
        <p className="text-red-500 mb-4">
          Please connect your MetaMask wallet.
        </p>
      )}
      {account && !isCorrectNetwork && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>
            You are connected to the wrong network. Please switch to Polygon
            Amoy Testnet.
          </p>
          <button
            onClick={connectToAmoy}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect to Polygon Amoy
          </button>
        </div>
      )}
      {account && isCorrectNetwork && (
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-3 py-2 border rounded"
            placeholder="Enter new task"
          />
          <button
            onClick={handleAddTask}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      )}
      {account && isCorrectNetwork && (
        <ul>
          {tasks.map((task) => (
            <li
              key={Number(task.id)}
              className={`flex justify-between items-center py-2 border-b ${
                task.completed ? "text-green-600 line-through" : ""
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(Number(task.id))}
                  className="mr-2"
                />
                <span className="cursor-pointer">{task.content}</span>
              </div>
              <button
                onClick={() => handleDelete(Number(task.id))}
                className="text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
      {account && isCorrectNetwork && (
        <div>
          <button
            onClick={() => requestFaucet(account)}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            Request MATIC
          </button>
        </div>
      )}
    </div>
  );
}
