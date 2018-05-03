import assertRevert from './helpers/assertRevert';

const web3Utils = require('web3-utils');
const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const encodeCall = require('./helpers/encodeCall')
const OwnableUpgradeableProxy = artifacts.require('OwnableUpgradeableProxy')
const Factory = artifacts.require('OwnableUpgradeableProxyFactory');

contract('OwnableUpgradeableProxy_V1', ([_, proxyOwner, tokenOwner, anotherAccount]) => {
  let proxy
  let impl_v0
  let impl_v1
  let token_v0
  let token_v1
  // const initializeData = encodeCall('initialize', ['address'], [tokenOwner]);

  const createProxy = async (_factory, _version, _implAddr, _contentURI, _owner) => {
    const {logs} = await _factory.create(web3Utils.utf8ToHex(_version), _implAddr, web3Utils.utf8ToHex(_contentURI), { from: _owner });
    return OwnableUpgradeableProxy.at(logs.find(l => l.event === 'NewAppProxy').args._proxy);
  }

  beforeEach(async () => {
    const factory = await Factory.new();
    impl_v0 = await Token_V0.new()
    impl_v1 = await Token_V1.new()
    proxy = await createProxy(factory, '0.1', impl_v0.address, 'token.runningbeta.eth', proxyOwner);
    token_v0 = Token_V0.at(proxy.address)
    token_v1 = Token_V1.at(proxy.address)

    // TODO: proxy vs impl owner
    await token_v0.transferOwnership(tokenOwner, { from: proxyOwner })
  })

  describe('owner', () => {
    it('has an owner', async () => {
      const owner = await proxy.proxyOwner()

      assert.equal(owner, proxyOwner)
    })
  })

  describe('transferOwnership', () => {
    describe('when the new proposed owner is not the zero address', () => {
      const newOwner = anotherAccount

      describe('when the sender is the owner', () => {
        const from = proxyOwner

        it('transfers the ownership', async () => {
          await proxy.transferProxyOwnership(newOwner, { from })

          const owner = await proxy.proxyOwner()
          assert.equal(owner, newOwner)
        })

        it('emits an event', async () => {
          const { logs } = await proxy.transferProxyOwnership(newOwner, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'ProxyOwnershipTransferred')
          assert.equal(logs[0].args.previousOwner, proxyOwner)
          assert.equal(logs[0].args.newOwner, newOwner)
        })
      })

      describe('when the sender is the token owner', () => {
        const from = tokenOwner

        beforeEach(async () => await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from: proxyOwner }))

        it('reverts', async () => {
          await assertRevert(proxy.transferProxyOwnership(newOwner, { from }))
        })
      })

      describe('when the sender is not the owner', () => {
        const from = anotherAccount

        it('reverts', async () => {
          await assertRevert(proxy.transferProxyOwnership(newOwner, { from }))
        })
      })
    })

    describe('when the new proposed owner is the zero address', () => {
      const newOwner = 0x0
      it('reverts', async () => {
        await assertRevert(proxy.transferProxyOwnership(newOwner, { from: proxyOwner }))
      })
    })
  })

  describe('implementation', () => {
    describe('when an initial implementation was provided', () => {
      it('zero address is returned', async () => {
        const implementation = await proxy.implementation()
        assert.equal(implementation, impl_v0.address)
      })
    })

    describe('when proxy is upgraded', () => {
      beforeEach(async () => await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from: proxyOwner }))

      it('returns the given implementation', async () => {
        const implementation = await proxy.implementation()
        assert.equal(implementation, impl_v1.address)
      })
    })
  })

  describe('upgrade', () => {
    describe('when the new implementation is not the zero address', () => {

      describe('when the sender is the proxy owner', () => {
        const from = proxyOwner;

        describe('when no initial implementation was provided', () => {
          it('upgrades to the given implementation', async () => {
            await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from: proxyOwner })

            const implementation = await proxy.implementation();
            assert.equal(implementation, impl_v1.address);
          })
        })

        describe('when an initial implementation was provided', () => {

          describe('when the given implementation is equal to the current one', () => {
            it('reverts', async () => {
              await assertRevert(proxy.upgradeTo('1.0', impl_v0.address, 'token.runningbeta.eth', { from }))
            })
          })

          describe('when the given implementation is different than the current one', () => {
            it('upgrades to the new implementation', async () => {
              await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from })

              const implementation = await proxy.implementation();
              assert.equal(implementation, impl_v1.address);
            })
          })
        })
      })

      describe('when the sender is not the proxy owner', () => {
        const from = anotherAccount;

        it('reverts', async () => {
          await assertRevert(proxy.upgradeTo('1.0', impl_v0.address, 'token.runningbeta.eth', { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', () => {
      it('reverts', async () => {
        await assertRevert(proxy.upgradeTo('1.0', 0x0, 'token.runningbeta.eth', { from: proxyOwner }))
      })
    })
  })

  describe('upgrade and call', () => {

    describe('when the new implementation is not the zero address', () => {

      describe('when the sender is the proxy owner', () => {
        const from = proxyOwner;

        it('upgrades to the given implementation', async () => {
          await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from })

          const implementation = await proxy.implementation();
          assert.equal(implementation, impl_v1.address);
        })

        it('calls the implementation using the given data as msg.data', async () => {
          await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from })

          const owner = await token_v1.owner()
          assert.equal(owner, tokenOwner);

          await assertRevert(token_v1.mint(anotherAccount, 100, { from: anotherAccount }))
          await token_v1.mint(anotherAccount, 100, { from: tokenOwner })

          const balance = await token_v1.balanceOf(anotherAccount)
          assert(balance.eq(100))
        })
      })

      describe('when the sender is not the proxy owner', () => {
        const from = anotherAccount;

        it('reverts', async () => {
          await assertRevert(proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', () => {
      it('reverts', async () => {
        await assertRevert(proxy.upgradeTo('1.0', 0x0, 'token.runningbeta.eth', { from: proxyOwner }))
      })
    })
  })

  describe('delegatecall', () => {
    describe('when an initial implementation was given', () => {
      const sender = anotherAccount

      // beforeEach(async () => await proxy.upgradeTo('1.0', impl_v0.address, 'token.runningbeta.eth', { from: proxyOwner }))

      describe('when there were no further upgrades', () => {

        it('delegates calls to the initial implementation', async function() {
          await token_v0.mint(sender, 100, { from: tokenOwner })

          const balance = await token_v0.balanceOf(sender)
          assert(balance.eq(100))

          const totalSupply = await token_v0.totalSupply()
          assert(totalSupply.eq(100))
        })

        it('fails when trying to call an unknown function of the current implementation', async () => {
          await token_v0.mint(sender, 100, { from: tokenOwner })

          await assertRevert(token_v1.burn(20, { from: tokenOwner }))
        })
      })

      describe('when there was another upgrade', () => {
        beforeEach(async () => {
          await token_v0.mint(sender, 100, { from: tokenOwner })
          await proxy.upgradeTo('1.0', impl_v1.address, 'token.runningbeta.eth', { from: proxyOwner })
        })

        it('delegates calls to the last upgraded implementation', async function() {
          await token_v1.mint(sender, 20, { from: tokenOwner })
          await assertRevert(token_v1.mint(sender, 20, { from: sender }))
          await token_v1.burn(40, { from: sender })

          const balance = await token_v1.balanceOf(sender)
          assert(balance.eq(80))

          const totalSupply = await token_v1.totalSupply()
          assert(totalSupply.eq(80))
        })
      })
    })
  })
})
