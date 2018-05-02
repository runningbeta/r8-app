import expectThrow from './helpers/expectThrow';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const Factory = artifacts.require('DelayedSealableUpgradeableProxyFactory');
const DelayedSealableUpgradeableProxy = artifacts.require('DelayedSealableUpgradeableProxy');

const BlockMiner = artifacts.require('BlockMiner');
const TokenV1_0 = artifacts.require('TokenV1_0');
const TokenV1_1 = artifacts.require('TokenV1_1');

var web3Utils = require('web3-utils');
const BigNumber = web3.BigNumber;
const contentURI = web3Utils.utf8ToHex('token.runningbeta.eth')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DelayedSealableUpgradeableProxy', function (accounts) {
  beforeEach(async function () {
    this.impl_v1_0 = await TokenV1_0.new()
    this.impl_v1_1 = await TokenV1_1.new()
    this.factory = await Factory.new();
    this.blockMiner = await BlockMiner.new();
  });

  describe('proxySealed', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.create(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the proxy is sealable', async function () {
      it('returns sealed status as false', async function () {
        const sealed = await DelayedSealableUpgradeableProxy.at(this.proxy).proxySealed();
        sealed.should.be.equal(false);
      });
    });
  });

  describe('proxySealRequest', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.create(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
    });

    describe('when the proxy is sealable', async function () {
      it('seal can\'t be requested if proposed delay is less than minimal [delay:120]', async function () {
        await assertRevert(
          DelayedSealableUpgradeableProxy.at(this.proxy).proxySealRequest(1)
        );
      });

      it('seal can be requested if proposed delay is more or equal to [delay:120]', async function () {
        await DelayedSealableUpgradeableProxy.at(this.proxy).proxySealRequest(120);
      });
    });
  });

  describe('sealProxy', function () {
    beforeEach(async function () {
      const {logs} = await this.factory.create(web3Utils.utf8ToHex('1.0'), this.impl_v1_0.address, contentURI);
      this.proxy = logs.find(l => l.event === 'NewAppProxy').args._proxy;
      await DelayedSealableUpgradeableProxy.at(this.proxy).proxySealRequest(120);
    });

    describe('when the proxy seal is requested', async function () {
      it('returns sealed status as false', async function () {
        const sealed = await DelayedSealableUpgradeableProxy.at(this.proxy).proxySealed();
        sealed.should.be.equal(false);
      });

      it('seal proposal can be canceled', async function () {
        await DelayedSealableUpgradeableProxy.at(this.proxy).cancelProxySealRequest();
      });

      it('seal can\'t be confirmed if less than [delay:120] blocks have passed', async function () {
        await assertRevert(
          DelayedSealableUpgradeableProxy.at(this.proxy).sealProxy()
        );
      });

      it('[long] seal can be confirmed if more than [delay:120] blocks have passed', async function () {
        for (var ii = 0; ii < 120; ii++) {
          await this.blockMiner.mine({ from: accounts[0] });
        }
        await DelayedSealableUpgradeableProxy.at(this.proxy).sealProxy();
      });
    });
  });
});
