import expectThrow from './helpers/expectThrow';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const Factory = artifacts.require('AppProxyFactory');
const OwnableUpgradeableProxy = artifacts.require('OwnableUpgradeableProxy');

const TokenV1_0 = artifacts.require('TokenV1_0');
const TokenV1_1 = artifacts.require('TokenV1_1');

var web3Utils = require('web3-utils');
const BigNumber = web3.BigNumber;
const contentURI = web3Utils.utf8ToHex('token.runningbeta.eth')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OwnableUpgradeableProxy', function (accounts) {
  beforeEach(async function () {
    this.impl_v1_0 = await TokenV1_0.new()
    this.impl_v1_1 = await TokenV1_1.new()
    this.factory = await Factory.new();
  });

  describe('newUgradeableProxy', function() {
    beforeEach(async function () {
      const {logs} = await this.factory.newUgradeableProxy(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the contract TokenV1_0 is initialized as upgradeable proxy', function () {
      it('it can mint coins', async function () {
        await TokenV1_0.at(this.proxy).mint(accounts[0], 100);
        const balance = await TokenV1_0.at(this.proxy).balanceOf(accounts[0]);
        balance.should.be.bignumber.equal(10100);
      });

      it('does not implement approve function', async function () {
        try {
          await TokenV1_0.at(this.proxy).approve(accounts[1], 100)
        } catch (e) {
          assert(e instanceof TypeError);
          assert(e.message === 'TokenV1_0.at(...).approve is not a function');
        }
      });

      it('isn\'t implemented as TokenV1_1', async function () {
        await assertRevert(
          TokenV1_1.at(this.proxy).approve(accounts[1], 100)
        );
      });

      it('can transfer tokens', async function () {
        await TokenV1_0.at(this.proxy).transfer(accounts[1], 50);
        const balance = await TokenV1_0.at(this.proxy).balanceOf(accounts[1]);
        balance.should.be.bignumber.equal(50);
      });
    });
  });

  describe('upgradeTo', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.newUgradeableProxy(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the contract TokenV1_0 is initialized as upgradeable proxy', function () {
      it('works', async function () {
        await TokenV1_0.at(this.proxy).transfer(accounts[1], 1, { from: accounts[0] });
        const balance = await TokenV1_0.at(this.proxy).balanceOf(accounts[1]);
        balance.should.be.bignumber.equal(1);
      });

      it('can be upgraded to TokenV1_1', async function () {
        await OwnableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI)
      });

      it('emits an event on upgrade', async function () {
        const {logs} = await OwnableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI);
        logs.length.should.be.equal(1);
        logs[0].event.should.be.eq('Upgraded');
        const version = web3Utils.padRight(web3Utils.utf8ToHex('1.1'), 64);
        logs[0].args._version.should.be.equal(version);
        logs[0].args._implementation.should.be.equal(this.impl_v1_1.address);
        logs[0].args._contentURI.should.be.equal(contentURI);
      })

      it('preserves state', async function () {
        await TokenV1_0.at(this.proxy).transfer(accounts[1], 1, { from: accounts[0] });
        const balanceBefore = await TokenV1_0.at(this.proxy).balanceOf(accounts[1]);
        balanceBefore.should.be.bignumber.equal(1);
        
        await OwnableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI)
        
        const balanceAfter = await TokenV1_1.at(this.proxy).balanceOf(accounts[1]);
        balanceAfter.should.be.bignumber.equal(balanceBefore);
      });

      it('implements new methods from TokenV1_1', async function () {
        const amount = 100;
        await OwnableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI)
        await TokenV1_1.at(this.proxy).approve(accounts[1], amount, { from: accounts[0] });
        await TokenV1_1.at(this.proxy).transferFrom(accounts[0], accounts[1], amount, { from: accounts[1] });
        const balance = await TokenV1_1.at(this.proxy).balanceOf(accounts[1]);
        balance.should.be.bignumber.equal(amount);
      });
    });
  });

  describe('proxyOwner', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.newUgradeableProxy(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the contract TokenV1_0 is Ownable', async function () {
      it('returns owners address', async function () {
        const owner = await OwnableUpgradeableProxy.at(this.proxy).proxyOwner();
        owner.should.be.equal(accounts[0]);
      });
    });
  });

  describe('transferProxyOwnership', function () {
    beforeEach(async function () {
      const { logs } = await this.factory.newUgradeableProxy(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
      this.transferTx = await OwnableUpgradeableProxy.at(this.proxy).transferProxyOwnership(accounts[1]);
    });

    describe('when the proxy ownership is transfered', async function () {
      it('returns new proxy owner correctly', async function () {
        const owner = await OwnableUpgradeableProxy.at(this.proxy).proxyOwner();
        owner.should.be.equal(accounts[1]);
      });

      it('emmits a ProxyOwnershipTransferred event', async function () {
        const {logs} = this.transferTx;
        logs.length.should.be.equal(1);
        logs[0].event.should.be.eq('ProxyOwnershipTransferred');
        logs[0].args.previousOwner.should.be.equal(accounts[0]);
        logs[0].args.newOwner.should.be.equal(accounts[1]);
      });

      it('allows new owner to upgrade', async function () {
        await OwnableUpgradeableProxy.at(this.proxy)
          .upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI, { from: accounts[1] });
      });
    });
  });
});
