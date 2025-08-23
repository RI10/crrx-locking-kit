// scripts/lock-erc20.js
// Send ERC-20 tokens to the timelock contract (ethers v6)
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
dotenv();

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)"
];

async function main() {
  const { RPC_URL, PRIVATE_KEY, TOKEN, LOCKER, AMOUNT, DECIMALS } = process.env;
  if (!RPC_URL || !PRIVATE_KEY || !TOKEN || !LOCKER || !AMOUNT) {
    throw new Error("Missing env vars: RPC_URL, PRIVATE_KEY, TOKEN, LOCKER, AMOUNT");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const token = new ethers.Contract(TOKEN, ERC20_ABI, wallet);

  const decimals = DECIMALS ? Number(DECIMALS) : await token.decimals().catch(() => 18);
  const amount = ethers.parseUnits(AMOUNT, decimals);

  console.log(`Sender: ${wallet.address}`);
  console.log(`Sending ${AMOUNT} tokens to timelock: ${LOCKER}`);
  const tx = await token.transfer(LOCKER, amount);
  console.log("transfer tx:", tx.hash);
  const rc = await tx.wait();
  console.log("Mined in block:", rc.blockNumber);
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
