pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "./Token_V0.sol";


/**
 * @title Token_V1
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing burnable functionalities
 * in addition to what's provided in version 0
 */
contract Token_V1 is Token_V0, BurnableToken {}
