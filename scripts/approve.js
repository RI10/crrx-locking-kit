// scripts/approve.js
// Minimal helper to approve tokens for a locker/vesting contract (ethers v6)
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
dotenv();

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  const rpc = process.env.RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  const tokenAddr = process.env.TOKEN;      // ERC-20 (e.g. CRRX)
  const spender = process.env.LOCKER;       // locker/vesting contract address
  const amountStr = process.env.AMOUNT || "0";
  const decimalsEnv = process.env.DECIMALS; // optional override

  if (!rpc || !pk || !tokenAddr || !spender) {
    throw new Error("Missing env vars: RPC_URL, PRIVATE_KEY, TOKEN, LOCKER");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const token = new ethers.Contract(tokenAddr, ERC20_ABI, wallet);

  const decimals =
    decimalsEnv ? Number(decimalsEnv) : await token.decimals().catch(() => 18);

  const amount = ethers.parseUnits(amountStr, decimals);

  const current = await token.allowance(wallet.address, spender);
  console.log("Current allowance:", current.toString());

  const tx = await token.approve(spender, amount);
  console.log("approve tx:", tx.hash);
  const rc = await tx.wait();
  console.log("Mined in block:", rc.blockNumber);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
