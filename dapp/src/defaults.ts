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
  perpetualTransfer: {
    asset: {
      type: 'SYNTHETIC',
      data: {
        symbol: 'BTC',
        resolution: '10'
      },
      amount: '1'
    },
    fee: {
      type: 'ETH',
      data: {
        quantum: '10000000000'
      },
      maxAmount: '1',
      positionId: '1'
    },
    sender: {
      positionId: '1'
    },
    receiver: {
      positionId: '1',
      starkKey:
        '0x0779f740681278532a60efcc9f277bae69c227a8cb07307cd8d1e6cf2b5635ea'
    },
    nonce: '1597237',
    expirationTimestamp: '444396',
    condition: ''
  },
  perpetualLimitOrder: {
    syntheticAsset: {
      type: 'SYNTHETIC',
      data: {
        symbol: 'BTC',
        resolution: '10'
      },
      amount: '1'
    },
    collateralAsset: {
      type: 'ETH',
      data: {
        quantum: '10000000000'
      },
      amount: '1'
    },
    isBuyingSynthetic: false,
    fee: {
      type: 'ETH',
      data: {
        quantum: '10000000000'
      },
      amount: '1'
    },
    nonce: '159723',
    positionId: '1',
    expirationTimestamp: '444396'
  },
  perpetualWithdraw: {
    collateralAsset: {
      type: 'ETH',
      data: {
        quantum: '10000000000'
      },
      amount: '1'
    },
    nonce: '1597237',
    positionId: '1',
    expirationTimestamp: '444396'
  }
}

export default defaults
