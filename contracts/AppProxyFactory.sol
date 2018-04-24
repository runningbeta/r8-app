pragma solidity ^0.4.18;

import "./R8App.sol";
import "./UpgradeabilityProxy.sol";

contract AppProxyFactory {

  /**
   * @dev This event will be emitted every time a new proxy is created
   * @param _proxy representing the address of the proxy created
   */
  event NewAppProxy(address _proxy, bool _isUpgradeable);

  /**
  * @dev Creates an upgradeable proxy
  * @param _version representing the first version to be set for the proxy
  * @return address of the new proxy created
  */
  function createProxy(string _version, address _implementation) public payable returns (UpgradeabilityProxy) {
    UpgradeabilityProxy proxy = new UpgradeabilityProxy(_version, _implementation);
    R8App(proxy).initialize.value(msg.value)(msg.sender);
    emit NewAppProxy(proxy, true);
    return proxy;
  }

}