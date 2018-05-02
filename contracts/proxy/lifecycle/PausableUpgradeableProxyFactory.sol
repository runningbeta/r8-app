pragma solidity ^0.4.23;

import "../../AppProxyFactory.sol";
import "./PausableUpgradeableProxy.sol";

contract PausableUpgradeableProxyFactory is AppProxyFactory {
  /**
   * @dev Creates a new PausableUpgradeableProxy proxy
   * @param _version representing the first version to be set for the proxy
   * @return address of the new proxy created
   */
  function create(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (Proxy) {
    PausableUpgradeableProxy proxy = new PausableUpgradeableProxy(_version, _implementation, _contentURI);
    proxy.transferProxyOwnership(msg.sender);
    _init(proxy, true);
    return proxy;
  }
}
