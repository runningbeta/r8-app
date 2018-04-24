pragma solidity ^0.4.18;

import './Proxy.sol';

/**
 * @title UpgradeableProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeableProxy is Proxy {

  /**
   * @dev This event will be emitted every time the implementation gets upgraded
   * @param _version representing the version name of the upgraded implementation
   * @param _implementation representing the address of the upgraded implementation
   */
  event Upgraded(bytes32 _version, address _implementation);

  // Storage position of the version name of the current implementation
  bytes32 private constant versionPosition = keccak256("io.runningbeta.proxy.version");

  // Storage position of the address of the current implementation
  bytes32 private constant implementationPosition = keccak256("io.runningbeta.proxy.implementation");

  /**
   * @dev Tells the version name of the current implementation
   * @return bytes32 representing the name of the current version
   */
  function version() public view returns (bytes32 _version) {
    bytes32 position = versionPosition;
    assembly {
      _version := sload(position)
    }
  }

  /**
   * @dev Sets the bytes32 of the current version
   * @param _version representing the version name of the new implementation to be set
   */
  function _setVersion(bytes32 _version) internal {
    bytes32 position = versionPosition;
    assembly {
      sstore(position, _version)
    }
  }

  /**
   * @dev Tells the address of the current implementation
   * @return address of the current implementation
   */
  function implementation() public view returns (address _impl) {
    bytes32 position = implementationPosition;
    assembly {
      _impl := sload(position)
    }
  }

  /**
   * @dev Sets the address of the current implementation
   * @param _implementation address representing the new implementation to be set
   */
  function _setImplementation(address _implementation) internal {
    bytes32 position = implementationPosition;
    assembly {
      sstore(position, _implementation)
    }
  }

  /**
   * @dev Upgrades the implementation address
   * @param _version representing the version name of the new implementation to be set
   * @param _implementation representing the address of the new implementation to be set
   */
  function _upgradeTo(bytes32 _version, address _implementation) internal {
    require(version() != _version);
    require(implementation() != _implementation);
    _setVersion(_version);
    _setImplementation(_implementation);
    emit Upgraded(_version, _implementation);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param _version representing the version name of the new implementation to be set.
   * @param _implementation representing the address of the new implementation to be set.
   * @param _data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   */
  function _upgradeToAndCall(bytes32 _version, address _implementation, bytes _data) internal {
    _upgradeTo(_version, _implementation);
    require(address(this).call.value(msg.value)(_data));
  }

   /**
   * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
   */
  function proxyType() public pure returns (uint256 proxyTypeId) {
    return UPGRADEABLE;
  }

}
