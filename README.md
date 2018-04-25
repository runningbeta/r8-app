# r8-app 🌱

[![CircleCI](https://circleci.com/gh/runningbeta/r8-app/tree/master.svg?style=svg)](https://circleci.com/gh/runningbeta/r8-app/tree/master)

This is a simplified version of the system being used by the
[AragonOS](https://github.com/aragon/aragonOS) and [ZepplinOS](https://github.com/zeppelinos/core) systems.

Proxy contracts are being increasingly used as both as an upgradeability mechanism and a way to save gas when deploying many instances of a particular contract. [EIP897 standard](https://github.com/ethereum/EIPs/pull/897) proposes a set of interfaces for proxies to signal how they work and what their main implementation is.

## Getting started

You will need [Truffle framework](http://truffleframework.com):
```bash
# Make sure we have the latest truffle version
npm uninstall -g truffle
npm install -g truffle@latest
```

To test this project locally, clone the repo and run:

```bash
# install dependencies
npm install

# run tests
truffle test
```

To use the code we provide an NPM package:

```bash
# install dependencies
npm install r8-app
```

## The upgrade mechanism

The pattern used is `Upgradeability using Unstructured Storage` as described in [this repo](https://github.com/zeppelinos/labs/tree/master/upgradeability_using_unstructured_storage) and in [this](https://blog.zeppelinos.org/upgradeability-using-unstructured-storage/) blog post by [Zeppelin](https://zeppelinos.org/).

Understanding the [DELEGATECALL](https://solidity.readthedocs.io/en/develop/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries) Ethereum opcode is key to understanding the upgradeable proxy pattern.
