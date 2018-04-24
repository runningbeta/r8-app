var web3Utils = require('web3-utils');

const TokenV1_0 = artifacts.require('TokenV1_0')
const TokenV1_1 = artifacts.require('TokenV1_1')

const Factory = artifacts.require('AppProxyFactory')
const Proxy = artifacts.require('OwnableUpgradeableProxy')

contract('R8App', function ([sender, receiver]) {

  it('should work', async function () {
    const impl_v1_0 = await TokenV1_0.new()
    const impl_v1_1 = await TokenV1_1.new()

    const factory = await Factory.new()

    const {logs} = await factory.createProxy(web3Utils.utf8ToHex('1.0'), impl_v1_0.address)

    const proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy

    await TokenV1_0.at(proxy).mint(sender, 100)

    await Proxy.at(proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), impl_v1_1.address)

    await TokenV1_1.at(proxy).mint(sender, 100)

    const transferTx = await TokenV1_1.at(proxy).transfer(receiver, 10, { from: sender })

    console.log("Transfer TX gas cost using Inherited Storage Proxy", transferTx.receipt.gasUsed);

    const balance = await TokenV1_1.at(proxy).balanceOf(sender)
    assert(balance.eq(10190))

  })

})
