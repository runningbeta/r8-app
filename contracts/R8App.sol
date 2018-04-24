pragma solidity ^0.4.18;

import './AppStorage.sol';
import './Initializable.sol';

/**
 * @title R8App
 * @dev This contract holds all the minimum required functionality for a behavior to be upgradeable.
 * This means, required state variables for owned upgradeability purpose and simple initialization validation.
 */
contract R8App is AppStorage, Initializable {
  /**
  * @dev Validates the caller is the versions registry.
  * THIS FUNCTION SHOULD BE OVERRIDDEN CALLING SUPER
  * @param sender representing the address deploying the initial behavior of the contract
  */
  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
  }
}
