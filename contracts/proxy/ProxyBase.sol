pragma solidity ^0.4.18;

import './Proxy.sol';

/**
 * @title ProxyBase
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract ProxyBase is Proxy {

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

}
