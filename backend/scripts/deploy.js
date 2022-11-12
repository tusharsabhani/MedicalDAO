const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {

  const requestContract = await ethers.getContractFactory("Request");

  const deployedRequestContract = await requestContract.deploy();

  await deployedRequestContract.deployed();

  console.log("Verify Contract Address:", deployedRequestContract.address);

  console.log("Sleeping.....");
  await sleep(50000);

  await hre.run("verify:verify", {
    address: deployedRequestContract.address,
    constructorArguments: [],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });