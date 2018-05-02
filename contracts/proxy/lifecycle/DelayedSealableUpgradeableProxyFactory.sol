pragma solidity ^0.4.23;

import "../../AppProxyFactory.sol";
import "./DelayedSealableUpgradeableProxy.sol";

contract DelayedSealableUpgradeableProxyFactory is AppProxyFactory {
  /**
   * @dev Creates a new DelayedSealableUpgradeableProxy proxy
   * @param _version representing the first version to be set for the proxy
   * @return address of the new proxy created
   */
  function create(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (Proxy) {
    DelayedSealableUpgradeableProxy proxy = new DelayedSealableUpgradeableProxy(_version, _implementation, _contentURI);
    proxy.transferProxyOwnership(msg.sender);
    _init(proxy, true);
    return proxy;
  }
}
