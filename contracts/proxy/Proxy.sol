pragma solidity ^0.4.18;

import "../lib/aragon/DepositableDelegateProxy.sol";

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy is DepositableDelegateProxy {

  /**
  * @dev Tells the address of the implementation where every call will be delegated.
  * @return address of the implementation to which it will be delegated
  */
  function implementation() public view returns (address);

  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function () payable public {
    address target = implementation();
    // if app code hasn't been set yet, don't call
    require(target != address(0));
    delegatedFwd(target, msg.data);
  }
}
