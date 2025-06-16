import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/abi";

export default function TodoApp({ signer }) {
  const [todoContract, setTodoContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setTodoContract(contract);
      fetchTasks(contract);
    }
  }, [signer]);

  const fetchTasks = async (contractInstance) => {
    try {
      const allTasks = await contractInstance.getMyTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleAddTask = async () => {
    try {
      const tx = await todoContract.addTask(input, {
        gasLimit: 300000,
      });
      await tx.wait();
      console.log("Task added!");
    } catch (error) {
      console.error("Add task failed:", error);
      if (error?.data?.message) {
        console.error("Reason:", error.data.message);
      }
    }
  };
  

  const handleToggle = async (id) => {
    try {
      const tx = await todoContract.toggleTask(id);
      await tx.wait();
      fetchTasks(todoContract);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const tx = await todoContract.deleteTask(id);
      await tx.wait();
      fetchTasks(todoContract);
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
            key={task.id}
            className={`flex justify-between items-center py-2 border-b ${
              task.completed ? "text-green-600 line-through" : ""
            }`}
          >
            <span onClick={() => handleToggle(task.id)} className="cursor-pointer">
              {task.content}
            </span>
            <button
              onClick={() => handleDelete(task.id)}
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
