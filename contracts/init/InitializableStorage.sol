pragma solidity ^0.4.18;


/**
 * @title InitializableStorage
 * @dev This contract holds all the necessary state variables to support the app initialization
 */
contract InitializableStorage {
  // Block number when the app was initialized
  uint256 internal initializationBlock_;

  /// @return Block number in which the contract was initialized
  function initializationBlock() public view returns (uint256) {
    return initializationBlock_;
  }

}
