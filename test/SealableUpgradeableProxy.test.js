import expectThrow from './helpers/expectThrow';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const Factory = artifacts.require('SealableUpgradeableProxyFactory');
const SealableUpgradeableProxy = artifacts.require('SealableUpgradeableProxy');

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

contract('SealableUpgradeableProxy', function (accounts) {
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
        const sealed = await SealableUpgradeableProxy.at(this.proxy).proxySealed();
        sealed.should.be.equal(false);
      });
    });

    describe('when the proxy is sealed', async function () {
      beforeEach(async function () {
        await SealableUpgradeableProxy.at(this.proxy).sealProxy();
      });

      it('returns sealed status as true', async function () {
        const sealed = await SealableUpgradeableProxy.at(this.proxy).proxySealed();
        sealed.should.be.equal(true);
      });

      it('reverts on upgrade', async function () {
        await assertRevert(
          SealableUpgradeableProxy.at(this.proxy).upgradeTo(web3Utils.utf8ToHex('1.1'), this.impl_v1_1.address, contentURI)
        );
      });
    })
  });
});
