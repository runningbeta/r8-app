pragma solidity ^0.4.18;

import "./R8App.sol";
import "./proxy/OwnableUpgradeableProxy.sol";
import "./proxy/PinnedProxy.sol";

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
  function newAppProxy(bytes32 _version, address _implementation) public payable returns (OwnableUpgradeableProxy) {
    OwnableUpgradeableProxy proxy = new OwnableUpgradeableProxy(_version, _implementation);
    R8App(proxy).initialize.value(msg.value)(msg.sender);
    proxy.transferProxyOwnership(msg.sender);
    emit NewAppProxy(address(proxy), true);
    return proxy;
  }

  function newAppProxyPinned(bytes32 _version, address _implementation) public returns (PinnedProxy) {
    PinnedProxy proxy = new PinnedProxy(_version, _implementation);
    R8App(proxy).initialize.value(msg.value)(msg.sender);
    emit NewAppProxy(address(proxy), true);
    return proxy;
  }

}