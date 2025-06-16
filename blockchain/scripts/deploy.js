const hre = require("hardhat");

async function main() {
  const ToDoList = await hre.ethers.deployContract("ToDoList"); // returns deployed contract already
  await ToDoList.waitForDeployment(); // ✅ correct way in ethers v6

  console.log("ToDoList deployed to:", await ToDoList.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
