pragma solidity ^0.4.18;

import "./ProxyBase.sol";


/**
 * @title UpgradeableProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeableProxy is ProxyBase {

  /**
   * @dev This event will be emitted every time the implementation gets upgraded
   * @param _version representing the version name of the upgraded implementation
   * @param _implementation representing the address of the upgraded implementation
   */
  event Upgraded(bytes32 _version, address _implementation, bytes _contentURI);

  /**
   * @dev Upgrades the implementation address
   * @param _version representing the version name of the new implementation to be set
   * @param _implementation representing the address of the new implementation to be set
   */
  function _upgradeTo(bytes32 _version, address _implementation, bytes _contentURI) internal {
    require(_version > 0);
    require(version() != _version);
    require(_implementation != address(0));
    require(implementation() != _implementation);
    _setVersion(_version);
    _setImplementation(_implementation);
    _setContentURI(_contentURI);
    emit Upgraded(_version, _implementation, _contentURI);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param _version representing the version name of the new implementation to be set.
   * @param _implementation representing the address of the new implementation to be set.
   * @param _data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   */
  function _upgradeToAndCall(bytes32 _version, address _implementation, bytes _contentURI, bytes _data) internal {
    _upgradeTo(_version, _implementation, _contentURI);
    require(address(this).call.value(msg.value)(_data));
  }

  /// @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
  function proxyType() public pure returns (uint256 proxyTypeId) {
    return UPGRADEABLE;
  }

}
