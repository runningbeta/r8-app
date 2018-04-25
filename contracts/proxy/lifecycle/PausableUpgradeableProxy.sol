pragma solidity ^0.4.18;

import "../OwnableUpgradeableProxy.sol";


/**
 * @title PausableUpgradeableProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract PausableUpgradeableProxy is OwnableUpgradeableProxy {
  event ProxyPause();
  event ProxyUnpause();

  // Storage position of the paused flag
  bytes32 private constant proxyPausedPosition = keccak256("io.runningbeta.proxy.paused");

  /**
   * @dev the constructor sets the original owner of the contract to the sender account.
   */
  function PausableUpgradeableProxy(bytes32 _version, address _implementation, bytes _contentURI)
    OwnableUpgradeableProxy(_version, _implementation, _contentURI)
    public
  {}

  /**
   * @dev Tells the proxy is paused
   * @return true if the proxy is paused else false
   */
  function proxyPaused() public view returns (bool _paused) {
    bytes32 position = proxyPausedPosition;
    assembly {
      _paused := sload(position)
    }
  }

  /**
   * @dev Sets the paused flag for the proxy
   */
  function _setProxyPaused(bool _paused) internal {
    bytes32 position = proxyPausedPosition;
    assembly {
      sstore(position, _paused)
    }
  }

  /// @dev Modifier to make a function callable only when the contract is not paused.
  modifier whenProxyNotPaused() {
    require(!proxyPaused());
    _;
  }

  /// @dev Modifier to make a function callable only when the contract is paused.
  modifier whenProxyPaused() {
    require(proxyPaused());
    _;
  }

  /// @dev called by the owner to pause, triggers stopped state
  function pauseProxy() onlyProxyOwner whenProxyNotPaused public {
    _setProxyPaused(true);
    emit ProxyPause();
  }

  /// @dev called by the owner to unpause, returns to normal state
  function unpauseProxy() onlyProxyOwner whenProxyPaused public {
    _setProxyPaused(false);
    emit ProxyUnpause();
  }

  /**
   * @dev Fallback function allowing to perform a delegatecall to the given implementation.
   * This function will return whatever the implementation call returns
   */
  function () payable public whenProxyNotPaused {
    address target = implementation();
    // if app code hasn't been set yet, don't call
    require(target != address(0));
    delegatedFwd(target, msg.data);
  }

}
