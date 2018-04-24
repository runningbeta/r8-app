pragma solidity ^0.4.18;

/**
 * @title AppStorage
 * @dev This contract holds all the necessary state variables required for R8App
 */
contract AppStorage {
  /// @notice This forces App storage to start at after 100 slots (compatible with aragonOS)
  /// @dev see https://github.com/aragon/aragonOS/blob/dev/contracts/apps/AppStorage.sol
  uint256[100] private storageOffset;

}
