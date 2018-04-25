pragma solidity ^0.4.23;

import "./R8App.sol";
import "./proxy/PinnedProxy.sol";
import "./proxy/OwnableUpgradeableProxy.sol";
import "./proxy/lifecycle/PausableUpgradeableProxy.sol";
import "./proxy/lifecycle/SealableUpgradeableProxy.sol";
import "./proxy/lifecycle/DelayedSealableUpgradeableProxy.sol";


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
  function newUgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (OwnableUpgradeableProxy) {
    OwnableUpgradeableProxy proxy = new OwnableUpgradeableProxy(_version, _implementation, _contentURI);
    proxy.transferProxyOwnership(msg.sender);
    _init(proxy, true);
    return proxy;
  }

  function newPausableUgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (PausableUpgradeableProxy) {
    PausableUpgradeableProxy proxy = new PausableUpgradeableProxy(_version, _implementation, _contentURI);
    proxy.transferProxyOwnership(msg.sender);
    _init(proxy, true);
    return proxy;
  }

  // TODO: this makes test fail with Error: VM Exception while processing transaction: out of gas
  // function newSealableUgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (SealableUpgradeableProxy) {
  //   SealableUpgradeableProxy proxy = new SealableUpgradeableProxy(_version, _implementation, _contentURI);
  //   proxy.transferProxyOwnership(msg.sender);
  //   _init(proxy, true);
  //   return proxy;
  // }

  function newDelayedSealableUpgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (DelayedSealableUpgradeableProxy) {
    DelayedSealableUpgradeableProxy proxy = new DelayedSealableUpgradeableProxy(_version, _implementation, _contentURI);
    proxy.transferProxyOwnership(msg.sender);
    _init(proxy, true);
    return proxy;
  }

  function newPinnedProxy(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (PinnedProxy) {
    PinnedProxy proxy = new PinnedProxy(_version, _implementation, _contentURI);
    _init(proxy, false);
    return proxy;
  }

  function _init(Proxy _proxy, bool _isUpgradeable) internal {
    R8App(_proxy).initialize.value(msg.value)(msg.sender);
    emit NewAppProxy(address(_proxy), _isUpgradeable);
  }

}
