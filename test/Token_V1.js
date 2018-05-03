import assertRevert from './helpers/assertRevert';

const web3Utils = require('web3-utils');
const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const encodeCall = require('./helpers/encodeCall')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const OwnableUpgradeableProxy = artifacts.require('OwnableUpgradeableProxy')
const Factory = artifacts.require('OwnableUpgradeableProxyFactory');

contract('Token_V1', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {

    const createProxy = async (_factory, _version, _implAddr, _contentURI, _owner) => {
      const {logs} = await _factory.create(web3Utils.utf8ToHex(_version), _implAddr, web3Utils.utf8ToHex(_contentURI), { from: _owner });
      return OwnableUpgradeableProxy.at(logs.find(l => l.event === 'NewAppProxy').args._proxy);
    }

    const factory = await Factory.new();

    const impl_v0 = await Token_V0.new()
    const proxy = await createProxy(factory, '0.1', impl_v0.address, 'token.runningbeta.eth', proxyOwner);
    // const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    // TODO: proxy vs impl owner
    await Token_V0.at(proxy.address).transferOwnership(tokenOwner, { from: proxyOwner })

    const impl_v1 = await Token_V1.new()
    await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from: proxyOwner })

    this.token = await Token_V1.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount)

  describe('burn', function () {
    const from = owner

    beforeEach(async function () {
      await this.token.mint(owner, 100, { from: tokenOwner })
    })

    describe('when the given amount is not greater than balance of the sender', function () {
      const amount = 100

      it('burns the requested amount', async function () {
        await this.token.burn(amount, { from })

        const balance = await this.token.balanceOf(from)
        assert.equal(balance, 0)
      })

      it('emits a burn event', async function () {
        const { logs } = await this.token.burn(amount, { from })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Burn')
        assert.equal(logs[0].args.burner, owner)
        assert.equal(logs[0].args.value, amount)
      })
    })

    describe('when the given amount is greater than the balance of the sender', function () {
      const amount = 101

      it('reverts', async function () {
        await assertRevert(this.token.burn(amount, { from }))
      })
    })
  })
})
