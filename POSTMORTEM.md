# Postmortem: CRRX Locking

## Summary
Our first deployment of the CRRX locking contract on Base Mainnet succeeded (tx: `0xae4bdeec32c96f25c6147c57502d0d91abedf851c551cd4121f069ecde2bb985`).  
However, the final step **"Verify & Publish"** on BaseScan was skipped.  
As a result, functions were not visible in the explorer UI, which made interaction harder (especially with MetaMask / Trezor).

## Lessons Learned
- Always verify contracts immediately after deployment.  
- Without verification, only bytecode is visible and there is no Web3 UI.  
- Hardware wallets may fail to sign transactions with large calldata if UI is missing.  
- Documenting failed attempts is as important as documenting successful ones.

## Next Steps
- Re-deploy or verify the existing contract on BaseScan.  
- Add helper scripts for `approve`, `lock`, and `check`.  
- Log transaction hashes and revert reasons for better debugging.  

## Checklist for future attempts
- [ ] Approve amount ≥ lock amount  
- [ ] Run `callStatic` before sending to simulate  
- [ ] Set explicit `gasLimit` if MetaMask cuts it  
- [ ] Test with a software wallet first (exclude HW quirks)  
- [ ] Consider `permit()` flow if token supports EIP-2612
