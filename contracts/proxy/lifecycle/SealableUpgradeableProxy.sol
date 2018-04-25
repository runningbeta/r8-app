pragma solidity ^0.4.18;

import "../OwnableUpgradeableProxy.sol";


/**
 * @title SealableUpgradeableProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract SealableUpgradeableProxy is OwnableUpgradeableProxy {
  event ProxySealed(address _owner);

  // Storage position of the sealed flag
  bytes32 private constant proxySealedPosition = keccak256("io.runningbeta.proxy.sealed");

  /**
   * @dev the constructor sets the original owner of the contract to the sender account.
   */
  function SealableUpgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI)
    OwnableUpgradeableProxy(_version, _implementation, _contentURI)
    public
  {}

  /**
   * @dev Tells the proxy is sealed
   * @return true if the proxy is sealed else false
   */
  function proxySealed() public view returns (bool _sealed) {
    bytes32 position = proxySealedPosition;
    assembly {
      _sealed := sload(position)
    }
  }

  /**
   * @dev Sets the sealed flag for the proxy
   */
  function _setProxySealed(bool _sealed) internal {
    bytes32 position = proxySealedPosition;
    assembly {
      sstore(position, _sealed)
    }
  }

  /// @dev Modifier to make a function callable only when the contract is not sealed.
  modifier whenProxyNotSealed() {
    require(!proxySealed());
    _;
  }

  /// @dev Modifier to make a function callable only when the contract is sealed.
  modifier whenProxySealed() {
    require(proxySealed());
    _;
  }

  /// @dev Seal the contract
  function seal() onlyProxyOwner whenProxyNotSealed public {
    // Contract is now sealed forever
    _setProxySealed(true);
    emit ProxySealed(msg.sender);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferProxyOwnership(address newOwner) public whenProxyNotSealed {
    super.transferProxyOwnership(newOwner);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy.
   * @param version representing the version name of the new implementation to be set.
   * @param implementation representing the address of the new implementation to be set.
   */
  function upgradeTo(bytes32 version, address implementation, bytes _contentURI) public whenProxyNotSealed {
    super.upgradeTo(version, implementation, _contentURI);
  }

  /**
   * @dev Allows the upgradeability owner to upgrade the current version of the proxy and call the new implementation
   * to initialize whatever is needed through a low level call.
   * @param version representing the version name of the new implementation to be set.
   * @param implementation representing the address of the new implementation to be set.
   * @param data represents the msg.data to bet sent in the low level call. This parameter may include the function
   * signature of the implementation to be called with the needed payload
   */
  function upgradeToAndCall(bytes32 version, address implementation, bytes _contentURI, bytes data) payable public whenProxyNotSealed {
    super.upgradeToAndCall(version, implementation, _contentURI, data);
  }

  /**
   * @dev Sets the contentURI of the current implementation
   * @param _contentURI bytes representing the external URI for fetching new version's content
   */
  function updateContentURI(bytes _contentURI) public whenProxyNotSealed {
    super.updateContentURI(_contentURI);
  }

}
