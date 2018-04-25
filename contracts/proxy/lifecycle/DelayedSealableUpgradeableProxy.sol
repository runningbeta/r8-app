pragma solidity ^0.4.23;

import "./SealableUpgradeableProxy.sol";


/**
 * @title DelayedSealableUpgradeableProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract DelayedSealableUpgradeableProxy is SealableUpgradeableProxy {
  event ProxySealRequest(address _owner, uint256 _sealBlock);
  event ProxySealRequestCancelled(address _owner);

  // Use Sealable base contract if you need a delay less than this
  uint256 public constant MIN_DELAY = 120;

  // Storage position of the flag indicating that the seal was requested by the owner
  bytes32 private constant proxySealRequestedPosition = keccak256("io.runningbeta.proxy.sealRequested");
  // Storage position of the var indicating when sealing is possible
  bytes32 private constant proxySealBlockPosition = keccak256("io.runningbeta.proxy.sealBlock");

  /**
   * @dev the constructor sets the original owner of the contract to the sender account.
   */
  constructor(bytes32 _version, address _implementation, bytes _contentURI)
    SealableUpgradeableProxy(_version, _implementation, _contentURI)
    public
  {
    // Set to Max(uint256)
    _setProxySealBlock(2**256-1);
  }

  /**
   * @dev Tells weather the proxy seal is requested
   * @return true if the seal is requested else false
   */
  function proxySealRequested() public view returns (bool _sealRequested) {
    bytes32 position = proxySealRequestedPosition;
    assembly {
      _sealRequested := sload(position)
    }
  }

  /**
   * @dev Sets the seal requested flag for the proxy
   */
  function _setProxySealRequested(bool _sealRequested) internal {
    bytes32 position = proxySealRequestedPosition;
    assembly {
      sstore(position, _sealRequested)
    }
  }

  /**
   * @dev Tells weather the proxy seal is requested
   * @return true if the seal is requested else false
   */
  function proxySealBlock() public view returns (uint256 _sealBlock) {
    bytes32 position = proxySealBlockPosition;
    assembly {
      _sealBlock := sload(position)
    }
  }

  /**
   * @dev Sets the seal requested flag for the proxy
   */
  function _setProxySealBlock(uint256 _sealBlock) internal {
    bytes32 position = proxySealBlockPosition;
    assembly {
      sstore(position, _sealBlock)
    }
  }

   /// @dev Request to seal the contract
  function sealRequest(uint256 _delay) onlyProxyOwner whenProxyNotSealed public {
    require(!proxySealRequested());
    require(_delay >= MIN_DELAY);
    // Seal is now requested
    _setProxySealRequested(true);
    _setProxySealBlock(block.number + _delay);
    // Tell the world
    emit ProxySealRequest(msg.sender, proxySealBlock());
  }

  /// @dev Cancel the latest request to seal the contract
  function cancelSealRequest() onlyProxyOwner whenProxyNotSealed public {
    require(proxySealRequested());
    _setProxySealRequested(false);
    // No need to change sealBlock since sealRequest() has to be called again.
    emit ProxySealRequestCancelled(msg.sender);
  }

  /// @dev Seal the contract
  function sealProxy() onlyProxyOwner whenProxyNotSealed public {
    require(proxySealRequested());
    require(block.number >= proxySealBlock());
    super.sealProxy();
  }

}
