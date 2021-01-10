const defaults: any = {
  dappConfig: {
    layer: 'starkex',
    application: 'starkexdemo',
    index: '0'
  },
  register: {
    ethKey: '',
    operatorSignature: ''
  },
  deposit: {
    amount: '100000000000000000',
    asset: {
      type: 'ETH',
      data: {
        quantum: '10'
      }
    },
    vaultId: '10'
  },
  withdraw: {
    asset: {
      type: 'ETH',
      data: {
        quantum: '10'
      }
    },
    vaultId: '10'
  },
  transfer: {
    from: {
      vaultId: '5'
    },
    to: {
      starkKey:
        '0x0779f740681278532a60efcc9f277bae69c227a8cb07307cd8d1e6cf2b5635ea',
      vaultId: '10'
    },
    asset: {
      type: 'ETH',
      data: {
        quantum: '10'
      }
    },
    amount: '1',
    nonce: '123',
    expirationTimestamp: `${Math.floor(Date.now() / (1000 * 3600)) + 720}`,
    condition: ''
  },
  limitOrder: {
    sell: {
      type: 'ETH',
      data: {
        quantum: '10'
      },
      amount: '1',
      vaultId: '1'
    },
    buy: {
      type: 'ETH',
      data: {
        quantum: '10'
      },
      amount: '1',
      vaultId: '5'
    },
    nonce: '1597237097',
    expirationTimestamp: `${Math.floor(Date.now() / (1000 * 3600)) + 720}`
  },
  perpetualTransfer: {},
  perpetualLimitOrder: {},
  perpetualWithdraw: {}
}

export default defaults
