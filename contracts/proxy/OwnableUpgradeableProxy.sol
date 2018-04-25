pragma solidity ^0.4.18;

import './UpgradeableProxy.sol';

/**
 * @title OwnableUpgradeableProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract OwnableUpgradeableProxy is UpgradeableProxy {
  /**
   * @dev Event to show ownership has been transferred
   * @param previousOwner representing the address of the previous owner
   * @param newOwner representing the address of the new owner
   */
  event ProxyOwnershipTransferred(address previousOwner, address newOwner);

  // Storage position of the owner of the contract
  bytes32 private constant proxyOwnerPosition = keccak256("io.runningbeta.proxy.owner");

  /**
   * @dev the constructor sets the original owner of the contract to the sender account.
   */
  function OwnableUpgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI) public {
    _setProxyOwner(msg.sender);
    _upgradeTo(_version, _implementation, _contentURI);
  }

  /// @dev Throws if called by any account other than the owner.
  modifier onlyProxyOwner() {
    require(msg.sender == proxyOwner());
    _;
  }

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function proxyOwner() public view returns (address owner) {
    bytes32 position = proxyOwnerPosition;
    assembly {
      owner := sload(position)
    }
  }

  /**
   * @dev Sets the address of the owner
   */
  function _setProxyOwner(address newProxyOwner) internal {
    bytes32 position = proxyOwnerPosition;
    assembly {
      sstore(position, newProxyOwner)
    }
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferProxyOwnership(address newOwner) public onlyProxyOwner {
    require(newOwner != address(0));
    emit ProxyOwnershipTransferred(proxyOwner(), newOwner);
    _setProxyOwner(newOwner);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy.
   * @param version representing the version name of the new implementation to be set.
   * @param implementation representing the address of the new implementation to be set.
   */
  function upgradeTo(bytes32 version, address implementation, bytes _contentURI) public onlyProxyOwner {
    _upgradeTo(version, implementation, _contentURI);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param version representing the version name of the new implementation to be set.
   * @param implementation representing the address of the new implementation to be set.
   * @param data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   */
  function upgradeToAndCall(bytes32 version, address implementation, bytes _contentURI, bytes data) payable public onlyProxyOwner {
    upgradeToAndCall(version, implementation, _contentURI, data);
  }

  /**
   * @dev Sets the contentURI of the current implementation
   * @param _contentURI bytes representing the external URI for fetching new version's content
   */
  function updateContentURI(bytes _contentURI) public onlyProxyOwner {
    _setContentURI(_contentURI);
  }

}
