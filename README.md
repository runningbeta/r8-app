# r8-app
🌱Ethereum upgradeable application using a DelegateProxy with RBAC governance

## Getting started

You will need Truffle to work with EthPM:
```bash
# Make sure we have the latest truffle version
npm uninstall -g truffle
npm install -g truffle@latest
```

To test this project locally, clone the repo and run:

```bash
# install dependencies
npm install
truffle install zeppelin

# run tests
testrpc&
npm test
```

To use the code as an EthPM package:

```bash
# install dependencies
truffle install r8-app
```
