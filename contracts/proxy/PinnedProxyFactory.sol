pragma solidity ^0.4.23;

import "../AppProxyFactory.sol";
import "./PinnedProxy.sol";

contract PinnedProxyFactory is AppProxyFactory {
  /**
   * @dev Creates a new PinnedProxy proxy
   * @param _version representing the first version to be set for the proxy
   * @return address of the new proxy created
   */
  function create(bytes32 _version, address _implementation, bytes _contentURI) public payable returns (Proxy) {
    PinnedProxy proxy = new PinnedProxy(_version, _implementation, _contentURI);
    _init(proxy, true);
    return proxy;
  }
}
