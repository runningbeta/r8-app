var web3Utils = require('web3-utils');

// TODO: setup babel and require the module
// var expectThrow = require('zeppelin-solidity/test/helpers/expectThrow');
const expectThrow = async promise => {
  try {
    await promise;
  } catch (error) {
    // TODO: Check jump destination to destinguish between a throw
    //       and an actual invalid jump.
    const invalidOpcode = error.message.search('invalid opcode') >= 0;
    // TODO: When we contract A calls contract B, and B throws, instead
    //       of an 'invalid jump', we get an 'out of gas' error. How do
    //       we distinguish this from an actual out of gas event? (The
    //       ganache log actually show an 'invalid jump' event.)
    const outOfGas = error.message.search('out of gas') >= 0;
    const revert = error.message.search('revert') >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      'Expected throw, got \'' + error + '\' instead'
    );
    return;
  }
  assert.fail('Expected throw not received');
};

const TokenV1_0 = artifacts.require('TokenV1_0')
const TokenV1_1 = artifacts.require('TokenV1_1')

const Factory = artifacts.require('AppProxyFactory')
const Proxy = artifacts.require('PausableUpgradeableProxy')

contract('R8App', function ([sender, receiver]) {

  it('should work', async function () {
    const contentURI = web3Utils.utf8ToHex('token.runningbeta.eth')

    const impl_v1_0 = await TokenV1_0.new()
    const impl_v1_1 = await TokenV1_1.new()

    const factory = await Factory.new()

    const {logs} = await factory.newPausableUgradeableProxy(web3Utils.utf8ToHex('1.0'), impl_v1_0.address, contentURI)

    const proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy

    await TokenV1_0.at(proxy).mint(sender, 100)

    await Proxy.at(proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), impl_v1_1.address, contentURI)

    await TokenV1_1.at(proxy).mint(sender, 100)

    const transferTx = await TokenV1_1.at(proxy).transfer(receiver, 10, { from: sender })

    console.log("Transfer TX gas cost using Inherited Storage Proxy", transferTx.receipt.gasUsed)

    const balance = await TokenV1_1.at(proxy).balanceOf(sender)
    assert(balance.eq(10190))
  })

  it('should throw when paused', async function () {
    const contentURI = web3Utils.utf8ToHex('token.runningbeta.eth')

    const impl_v1_0 = await TokenV1_0.new()
    const impl_v1_1 = await TokenV1_1.new()

    const factory = await Factory.new()

    const {logs} = await factory.newPausableUgradeableProxy(web3Utils.utf8ToHex('1.0'), impl_v1_0.address, contentURI)

    const proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy

    await Proxy.at(proxy).pauseProxy()
    await expectThrow(TokenV1_0.at(proxy).mint(sender, 100))
  })

})
