> ⚠️ **Update – August 2025:**  
> This version is deprecated and non-functional for Uniswap V3 liquidity on Base.  
> The original contract was designed for ERC-20 LP tokens (Uniswap V2 model),  
> while Uniswap V3 liquidity is stored as ERC-721 NFTs.  
> Therefore, the lock function never actually held the LP position.  
>
> The working replacement is now available here:  
> [univ3-nft-locker-base-v2](https://github.com/<your-username>/univ3-nft-locker-base-v2)


# CRRX Locking Kit

Minimal repository for experiments with token and LP position time-locks on Base network.  
Includes our first attempt to lock liquidity for a memecoin (CRRX).

> ⚠️ This code is experimental and unaudited. Use at your own risk.

## Structure
- `contracts/` — Solidity contracts (ERC-20 and ERC-721 12-month time locks).
- `scripts/` — helper scripts (approve, lock, check).
- `docs/` — documentation and notes (`POSTMORTEM.md`).
- `.env.example` — environment variables (RPC, PRIVATE_KEY, etc.).

## Network
- **Base Mainnet**
- Token (CRRX): `0x271eB17040aE44A3487065976Dc46898CbCBcc5D`

## How it works

### ERC20TimeLock12M
1. Deploy with parameters: `token` (ERC-20 address), `beneficiary`.
2. Transfer tokens to the contract (this is the "lock").
3. After 12 months call `release()` → all tokens go to the beneficiary.

### ERC721TimeLock12M
1. Deploy with parameters: `nft` (ERC-721 address, e.g. Uniswap V3 PositionManager), `tokenId`, `beneficiary`.
2. Transfer the NFT via `safeTransferFrom`.
3. After 12 months call `release()` → NFT goes to the beneficiary.

## Scripts usage

All scripts use environment variables from `.env`.  
Install dependencies first:

```bash
npm install ethers dotenv
