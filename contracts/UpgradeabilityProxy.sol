pragma solidity ^0.4.18;

import './Proxy.sol';
import './IRegistry.sol';
import './AppStorage.sol';

/**
 * @title UpgradeabilityProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeabilityProxy is Proxy, AppStorage {

  /**
   * @dev Constructor function
   */
  function UpgradeabilityProxy(string _version) public {
    registry = IRegistry(msg.sender);
    upgradeTo(_version);
  }

  /**
   * @dev Upgrades the implementation to the requested version
   * @param _version representing the version name of the new implementation to be set
   */
  function upgradeTo(string _version) public {
    _implementation = registry.getVersion(_version);
  }

   /**
   * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
   */
  function proxyType() public pure returns (uint256 proxyTypeId) {
    return UPGRADEABLE;
  }

}
