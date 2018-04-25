pragma solidity ^0.4.18;

import './ProxyBase.sol';

/**
 * @title PinnedProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract PinnedProxy is ProxyBase {

  /**
  * @dev the constructor sets the original owner of the contract to the sender account.
  */
  function PinnedProxy(bytes32 _version, address _implementation) public {
    require(version() != _version);
    require(implementation() != _implementation);
    _setVersion(_version);
    _setImplementation(_implementation);
  }

  /**
   * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
   */
  function proxyType() public pure returns (uint256 proxyTypeId) {
    return FORWARDING;
  }

}
