pragma solidity ^0.4.18;

import './proxy/ProxyStorage.sol';
import './init/InitializableStorage.sol';

/**
 * @title AppStorage
 * @dev This contract holds all the necessary state variables required for R8App
 */
contract AppStorage is ProxyStorage, InitializableStorage {
  // forces App storage to start at after 100 slots
  uint256[50] private storageOffset;

}
