pragma solidity ^0.4.23;


/**
 * @title ERC-897 DelegateProxy, basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-897.md
 */
contract ERCProxy {
  uint256 constant public FORWARDING = 1;
  uint256 constant public UPGRADEABLE = 2;

  function proxyType() public pure returns (uint256 proxyTypeId);
  function implementation() public view returns (address codeAddr);
}
