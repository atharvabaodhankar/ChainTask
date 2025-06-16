const hre = require("hardhat");

async function main() {
  const Todo = await hre.ethers.deployContract("ToDoList"); // returns deployed contract already
  await Todo.waitForDeployment(); // ✅ correct way in ethers v6

  console.log("Todo deployed to:", await Todo.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
