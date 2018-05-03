import assertRevert from './helpers/assertRevert';

const web3Utils = require('web3-utils');
const Token_V0 = artifacts.require('Token_V0')
const encodeCall = require('./helpers/encodeCall')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const OwnableUpgradeableProxy = artifacts.require('OwnableUpgradeableProxy')
const Factory = artifacts.require('OwnableUpgradeableProxyFactory');

contract('Token_V0', function ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {

    const createProxy = async (_factory, _version, _implAddr, _contentURI, _owner) => {
      const {logs} = await _factory.create(web3Utils.utf8ToHex(_version), _implAddr, web3Utils.utf8ToHex(_contentURI), { from: _owner });
      return OwnableUpgradeableProxy.at(logs.find(l => l.event === 'NewAppProxy').args._proxy);
    }
    
    const factory = await Factory.new();

    const impl_v0 = await Token_V0.new()
    const proxy = await createProxy(factory, '1.0', impl_v0.address, 'token.runningbeta.eth', proxyOwner);
    // const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    this.token = await Token_V0.at(proxy.address)
    // TODO: proxy vs impl owner
    await this.token.transferOwnership(tokenOwner, { from: proxyOwner })
  })

  shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount)
})
