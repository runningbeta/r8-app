
const web3Utils = require('web3-utils');
const encodeCall = require('./helpers/encodeCall')
const OwnableUpgradeableProxy = artifacts.require('OwnableUpgradeableProxy')
const Factory = artifacts.require('OwnableUpgradeableProxyFactory');
const Token_V0 = artifacts.require('Token_V0')

contract('OwnableUpgradeableProxy', ([_, proxyOwner, tokenOwner, anotherAccount]) => {
  let proxy
  let impl_v0
  let token_v0

  beforeEach(async function () {

    const createProxy = async (_factory, _version, _implAddr, _contentURI, _owner) => {
      const {logs} = await _factory.create(web3Utils.utf8ToHex(_version), _implAddr, web3Utils.utf8ToHex(_contentURI), { from: _owner });
      return OwnableUpgradeableProxy.at(logs.find(l => l.event === 'NewAppProxy').args._proxy);
    }
    
    const factory = await Factory.new();

    impl_v0 = await Token_V0.new()
    proxy = await createProxy(factory, '1.0', impl_v0.address, 'token.runningbeta.eth', proxyOwner);
    token_v0 = Token_V0.at(proxy.address)

    // const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    // TODO: proxy vs impl owner
    await token_v0.transferOwnership(tokenOwner, { from: proxyOwner })
    // await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from: proxyOwner })
  });

  it('should store implementation in specified location', async function () {
    const position = web3.sha3("io.runningbeta.proxy.implementation");
    const storage = await web3.eth.getStorageAt(proxy.address, position);
    assert.equal(storage, impl_v0.address);
  });
  
});