// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TimeLocks (12 months)
 * @notice Minimal 12-month time locks for ERC-20 tokens and ERC-721 NFTs.
 *         Intended for educational/portfolio purposes; NOT audited.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes calldata) external returns (bytes4);
}

/**
 * @notice Lock any ERC-20 token for 12 months.
 *         Transfer tokens to this contract, then call `release()` after the deadline.
 */
contract ERC20TimeLock12M {
    IERC20  public immutable token;
    address public immutable beneficiary;
    uint64  public immutable releaseTime;

    event Released(address indexed to, uint256 amount);

    constructor(IERC20 token_, address beneficiary_) {
        require(address(token_) != address(0), "token=0");
        require(beneficiary_ != address(0), "beneficiary=0");
        token = token_;
        beneficiary = beneficiary_;
        releaseTime = uint64(block.timestamp + 365 days);
    }

    /// @return when Unlock timestamp; amount Releasable now
    function releasable() external view returns (uint256 when, uint256 amount) {
        when = releaseTime;
        amount = block.timestamp >= releaseTime ? token.balanceOf(address(this)) : 0;
    }

    /// @notice Transfer all locked tokens to the beneficiary after the deadline
    function release() external {
        require(block.timestamp >= releaseTime, "too early");
        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, "nothing to release");
        require(token.transfer(beneficiary, amount), "transfer failed");
        emit Released(beneficiary, amount);
    }
}

/**
 * @notice Lock a specific ERC-721 token (e.g. Uniswap V3 LP NFT) for 12 months.
 *         Transfer the NFT via `safeTransferFrom`; then call `release()` after the deadline.
 */
contract ERC721TimeLock12M is IERC721Receiver {
    IERC721 public immutable nft;
    uint256 public immutable tokenId;
    address public immutable beneficiary;
    uint64  public immutable releaseTime;
    bool    public deposited;

    event Deposited(uint256 indexed tokenId);
    event Released(address indexed to, uint256 indexed tokenId);

    constructor(IERC721 nft_, uint256 tokenId_, address beneficiary_) {
        require(address(nft_) != address(0), "nft=0");
        require(beneficiary_ != address(0), "beneficiary=0");
        nft = nft_;
        tokenId = tokenId_;
        beneficiary = beneficiary_;
        releaseTime = uint64(block.timestamp + 365 days);
    }

    function onERC721Received(address, address, uint256 _tokenId, bytes calldata)
        external
        override
        returns (bytes4)
    {
        require(msg.sender == address(nft), "unexpected nft");
        require(_tokenId == tokenId, "unexpected tokenId");
        deposited = true;
        emit Deposited(_tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    function release() external {
        require(block.timestamp >= releaseTime, "too early");
        require(deposited, "nothing deposited");
        nft.safeTransferFrom(address(this), beneficiary, tokenId);
        emit Released(beneficiary, tokenId);
    }
}
