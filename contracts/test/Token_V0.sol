pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../R8App.sol";


/**
 * @title Token_V0
 * @dev Version 0 of a token to show upgradeability.
 */
contract Token_V0 is R8App, MintableToken {

  function initialize(address sender) public payable {
    super.initialize(sender);
    owner = sender;
  }

}
