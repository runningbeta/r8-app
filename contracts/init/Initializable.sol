pragma solidity ^0.4.18;

import "./InitializableStorage.sol";


contract Initializable is InitializableStorage {

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
