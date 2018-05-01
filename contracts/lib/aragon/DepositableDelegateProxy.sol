pragma solidity ^0.4.23;

import "./DelegateProxy.sol";


contract DepositableDelegateProxy is DelegateProxy {

  event ProxyDeposit(address sender, uint256 value);

  function () payable public {
    // send / transfer
    if (gasleft() < FWD_GAS_LIMIT) {
      require(msg.value > 0 && msg.data.length == 0);
      emit ProxyDeposit(msg.sender, msg.value);
    } else { // all calls except for send or transfer
      address target = implementation();
      delegatedFwd(target, msg.data);
    }
  }

}
