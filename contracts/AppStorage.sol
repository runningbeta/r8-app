pragma solidity ^0.4.18;

/**
 * @title AppStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract AppStorage {
  // Version name of the current implementation
  string internal version_;

  // Address of the current implementation
  address internal implementation_;

  // Block number when the app was initialized
  uint256 internal initializationBlock;

  /**
   * @dev Tells the version name of the current implementation
   * @return string representing the name of the current version
   */
  function version() public view returns (string) {
    return version_;
  }

  /**
   * @dev Tells the address of the current implementation
   * @return address of the current implementation
   */
  function implementation() public view returns (address) {
    return implementation_;
  }

}
