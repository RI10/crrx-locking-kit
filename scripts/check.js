// scripts/check.js
// Query timelock contracts (ERC20 + ERC721)
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
dotenv();

const ERC20LOCK_ABI = [
  "function releasable() view returns (uint256 when, uint256 amount)",
  "function beneficiary() view returns (address)"
];

const ERC721LOCK_ABI = [
  "function releaseTime() view returns (uint64)",
  "function beneficiary() view returns (address)",
  "function deposited() view returns (bool)",
  "function tokenId() view returns (uint256)"
];

async function main() {
  const { RPC_URL, LOCKER } = process.env;
  if (!RPC_URL || !LOCKER) {
    throw new Error("Missing env vars: RPC_URL, LOCKER");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
    console.log("Checking ERC20TimeLock12M at", LOCKER);
    const erc20Lock = new ethers.Contract(LOCKER, ERC20LOCK_ABI, provider);
    const [when, amount] = await erc20Lock.releasable();
    const beneficiary = await erc20Lock.beneficiary();
    console.log("Beneficiary:", beneficiary);
    console.log("Unlock time:", new Date(Number(when) * 1000).toISOString());
    console.log("Releasable amount:", amount.toString());
  } catch (e) {
    console.log("Not an ERC20 lock (or call failed):", e.message);
  }

  try {
    console.log("\nChecking ERC721TimeLock12M at", LOCKER);
    const erc721Lock = new ethers.Contract(LOCKER, ERC721LOCK_ABI, provider);
    const releaseTime = await erc721Lock.releaseTime();
    const beneficiary = await erc721Lock.beneficiary();
    const deposited = await erc721Lock.deposited();
    const tokenId = await erc721Lock.tokenId();
    console.log("Beneficiary:", beneficiary);
    console.log("Unlock time:", new Date(Number(releaseTime) * 1000).toISOString());
    console.log("Deposited:", deposited);
    console.log("Token ID:", tokenId.toString());
  } catch (e) {
    console.log("Not an ERC721 lock (or call failed):", e.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
