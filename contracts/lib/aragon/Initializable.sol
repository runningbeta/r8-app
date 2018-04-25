pragma solidity ^0.4.23;


contract Initializable {

  // Block number when the app was initialized
  uint256 internal initializationBlock_;

  /// @return Block number in which the contract was initialized
  function initializationBlock() public view returns (uint256) {
    return initializationBlock_;
  }

  modifier onlyInit {
    require(initializationBlock_ == 0);
    _;
  }

  modifier isInitialized {
    require(initializationBlock_ > 0);
    _;
  }

  /// @dev Function to be called by top level contract after initialization has finished.
  function initialized() internal onlyInit {
    initializationBlock_ = getBlockNumber();
  }

  /**
   * @dev Returns the current block number.
   * @notice Using a function rather than `block.number` allows us to easily mock the block number in tests.
   */
  function getBlockNumber() internal view returns (uint256) {
    return block.number;
  }

}
