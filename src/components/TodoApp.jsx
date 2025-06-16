import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/abi";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  useEffect(() => {
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

        const todoContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(todoContract);

        console.log("Connected to contract:", todoContract.address);

        // Now that the contract is initialized, fetch tasks
        fetchTasks(todoContract);
      } catch (err) {
        console.error("Error connecting to local blockchain", err);
      }
    };

    init();
  }, []);

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
      <ul>
        {tasks.map((task) => (
          <li
            key={Number(task.id)}
            className={`flex justify-between items-center py-2 border-b ${
              task.completed ? "text-green-600 line-through" : ""
            }`}
          >
            <span onClick={() => handleToggle(Number(task.id))} className="cursor-pointer">
              {task.content}
            </span>
            <button
              onClick={() => handleDelete(Number(task.id))}
              className="text-red-500 hover:text-red-700"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
