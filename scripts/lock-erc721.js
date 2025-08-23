// scripts/lock-erc721.js
// Send an ERC-721 (e.g., Uniswap V3 position NFT) to the timelock (ethers v6)
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
dotenv();

const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external"
];

async function main() {
  const { RPC_URL, PRIVATE_KEY, NFT, TOKEN_ID, LOCKER } = process.env;
  if (!RPC_URL || !PRIVATE_KEY || !NFT || !TOKEN_ID || !LOCKER) {
    throw new Error("Missing env vars: RPC_URL, PRIVATE_KEY, NFT, TOKEN_ID, LOCKER");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const nft = new ethers.Contract(NFT, ERC721_ABI, wallet);

  console.log(`Sender: ${wallet.address}`);
  console.log(`Transferring NFT #${TOKEN_ID} to timelock: ${LOCKER}`);
  const tx = await nft.safeTransferFrom(wallet.address, LOCKER, BigInt(TOKEN_ID));
  console.log("safeTransferFrom tx:", tx.hash);
  const rc = await tx.wait();
  console.log("Mined in block:", rc.blockNumber);
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
