import expectThrow from './helpers/expectThrow';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const Factory = artifacts.require('PausableUpgradeableProxyFactory');
const PausableUpgradeableProxy = artifacts.require('PausableUpgradeableProxy');

const TokenV1_0 = artifacts.require('TokenV1_0');
const TokenV1_1 = artifacts.require('TokenV1_1');

var web3Utils = require('web3-utils');
const BigNumber = web3.BigNumber;
const contentURI = web3Utils.utf8ToHex('token.runningbeta.eth')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PausableUpgradeableProxy', function (accounts) {
  beforeEach(async function () {
    this.impl_v1_0 = await TokenV1_0.new()
    this.impl_v1_1 = await TokenV1_1.new()
    this.factory = await Factory.new();
  });

  describe('pauseProxy', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.create(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the proxy is not paused', async function () {
      it('reverts on unpause', async function () {
        await assertRevert(
          PausableUpgradeableProxy.at(this.proxy).unpauseProxy()
        );
      });

      it('can be upgraded', async function () {
        await PausableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI);
      });

      it('can be paused', async function () {
        await PausableUpgradeableProxy.at(this.proxy).pauseProxy();
      });

      it('emits a ProxyPaused event when paused', async function () {
        const {logs} = await PausableUpgradeableProxy.at(this.proxy).pauseProxy();
        logs.length.should.be.equal(1);
        logs[0].event.should.be.eq('ProxyPause');
      });
    });
  });

  describe('unpauseProxy', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.create(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
      await PausableUpgradeableProxy.at(this.proxy).pauseProxy();
    });

    describe('when the proxy is paused', async function () {
      it('reverts on pause', async function () {
        await assertRevert(
          PausableUpgradeableProxy.at(this.proxy).pauseProxy()
        );
      });

      it('can still be upgraded', async function () {
        await PausableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI);
      });

      it('can\'t invoke Token functions', async function () {
        await assertRevert(
          TokenV1_0.at(this.proxy).mint(accounts[0], 100)
        );
      });

      it('can be unpaused', async function () {
        await PausableUpgradeableProxy.at(this.proxy).unpauseProxy({ from: accounts[0] });
      });

      it('emits a ProxyUnpause event when unpaused', async function () {
        const {logs} = await PausableUpgradeableProxy.at(this.proxy).unpauseProxy({ from: accounts[0] });
        logs.length.should.be.equal(1);
        logs[0].event.should.be.eq('ProxyUnpause');
      });
    });
  });
});
