import React, {
  ChangeEvent,
  ReactElement,
  useState,
  useEffect,
  useMemo
} from 'react'
import Onboard from '@authereum/bnc-onboard'
import defaults from './defaults'

// const blocknativeDappId = '12153f55-f29e-4f11-aa07-90f10da5d778'
const blocknativeDappId = 'fccf560b-943a-45e9-9af3-6b19e44e167e'
const rpcUrl = 'https://ropsten.rpc.authereum.com'
const networkId = 3

const toCamel = (str: string) => {
  return str
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/\W+/g, ' ')
    .replace(/ (.)/g, function ($1) {
      return $1.toUpperCase()
    })
    .replace(/ /g, '')
}

function MethodBox (props: any) {
  const { method, onSubmit } = props
  const key = toCamel(method)
  const [params, setParams] = useState<string>(() => {
    return localStorage.getItem(key) || JSON.stringify(defaults[key], null, 2)
  })
  const [result, setResult] = useState<any>('')
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const params = event.target.value
    setParams(params)
    localStorage.setItem(key, params)
  }
  const handleClick = async () => {
    try {
      if (params) {
        const payload = JSON.parse(params)
        let result: any = await onSubmit(payload)
        if (result instanceof Object) {
          result = JSON.stringify(result, null, 2)
        }
        setResult(result)
      } else {
        let result: any = await onSubmit()
        setResult(result)
      }
    } catch (err) {
      alert(err.message)
    }
  }
  return (
    <section>
      {params && <textarea value={params} onChange={handleChange}></textarea>}
      <button onClick={handleClick}>{method}</button>
      {result && <div>{result}</div>}
    </section>
  )
}

function App () {
  const [provider, setProvider] = useState<any>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const [dappConfig, setDappConfig] = useState<string>(() => {
    return (
      localStorage.getItem('dappConfig') ||
      JSON.stringify(defaults['dappConfig'], null, 2)
    )
  })
  const onboard = useMemo(() => {
    const { layer, application, index } = JSON.parse(dappConfig)
    const onboard = Onboard({
      dappId: blocknativeDappId,
      networkId,
      walletSelect: {
        wallets: [
          { walletName: 'ledger', rpcUrl, preferred: true },
          { walletName: 'authereum', preferred: true },
          { walletName: 'metamask', preferred: true },
          {
            walletName: 'walletConnect',
            infuraKey: 'd5e29c9b9a9d4116a7348113f57770a8',
            preferred: true
          },
          {
            walletName: 'trezor',
            appUrl: 'example.com',
            email: 'contact@example.com',
            rpcUrl
          },
          { walletName: 'dapper' },
          //{ walletName: 'fortmatic', apiKey: fortmaticApiKey },
          //{ walletName: 'portis', apiKey: portisDappId, label: 'Portis' },
          { walletName: 'torus' },
          //{ walletName: 'squarelink', apiKey: squarelinkClientId },
          { walletName: 'unilogin' },
          { walletName: 'coinbase' },
          { walletName: 'trust', rpcUrl },
          { walletName: 'opera' },
          { walletName: 'operaTouch' },
          { walletName: 'status' },
          { walletName: 'imToken', rpcUrl }
        ]
      },
      walletCheck: [
        { checkName: 'derivationPath' },
        { checkName: 'connect' },
        { checkName: 'accounts' }
        //{ checkName: 'network' },
        //{ checkName: 'balance', minimumBalance: '100000' }
      ],
      starkConfig: {
        authMessage: () => 'Example auth message: 123',
        exchangeAddress: '0x4a2ac1e2ba79d4b73d86b5dbd1a05a627964b33c',
        layer,
        application,
        index
      },
      subscriptions: {
        wallet: async wallet => {
          if (wallet.name) {
            console.log('wallet:', wallet)
            console.log(`${wallet.name} connected!`)
            setProvider(wallet.provider)
          }
        },
        address: address => {
          setConnected(!!address)
        }
      }
    })

    return onboard
  }, [setProvider, dappConfig])
  const [starkKey, setStarkKey] = useState<string>('')
  const [accountAddress, setAccountAddress] = useState<string>('')
  const connect = async () => {
    await onboard.walletSelect()
    await onboard.walletCheck()
  }
  const disconnect = async () => {
    onboard?.walletReset()
    setStarkKey('')
    setAccountAddress('')
  }

  useEffect(() => {
    const update = async () => {
      if (!connected) return
      if (!provider) return
      const { layer, application, index } = JSON.parse(dappConfig)
      try {
        console.debug('demo', 'account', layer, application, index)
        console.debug('demo', 'provider', provider)
        const starkKey = await provider.account(layer, application, index)
        setStarkKey(starkKey)
      } catch (err) {
        alert(err.message)
        console.error(err)
      }

      try {
        console.debug('demo', 'requestAccounts')
        const accounts = await provider.requestAccounts()
        setAccountAddress(accounts[0])
      } catch (err) {
        alert(err.message)
        console.error(err)
      }
    }

    update()
  }, [dappConfig, provider, connected])

  const renderStarkKey = () => {
    return (
      <section>
        <div>network: Ropsten</div>
        <div>stark key: {starkKey}</div>
        <div>account address: {accountAddress}</div>
        <div>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      </section>
    )
  }
  const getStarkKey = async () => {
    const starkKey = await provider.account()
    return starkKey
  }
  const register = async (payload: any) => {
    const txhash = await provider.registerUser(payload)
    return txhash
  }
  const deposit = async (payload: any) => {
    const txhash = await provider.deposit(payload, {
      //gasLimit: '0x493e0',
      //gasPrice: '0xba43b7400'
    })
    return txhash
  }
  const withdraw = async (payload: any) => {
    const txhash = await provider.withdraw(payload)
    return txhash
  }
  const transfer = async (payload: any) => {
    const starkSignature = await provider.transfer(payload)
    return starkSignature
  }
  const limitOrder = async (payload: any) => {
    const starkSignature = await provider.createOrder(payload)
    return starkSignature
  }
  const transferWithFees = async (payload: any) => {
    const starkSignature = await provider.transferWithFees(payload)
    return starkSignature
  }
  const limitOrderWithFees = async (payload: any) => {
    const starkSignature = await provider.limitOrderWithFees(payload)
    return starkSignature
  }
  const withdrawWithFees = async (payload: any) => {
    const starkSignature = await provider.withdrawWithFees(payload)
    return starkSignature
  }

  const renderConnected = () => {
    return (
      <div>
        {renderStarkKey()}
        <MethodBox method='Stark Key' onSubmit={getStarkKey} />
        <MethodBox method='Register' onSubmit={register} />
        <MethodBox method='Deposit' onSubmit={deposit} />
        <MethodBox method='Withdraw' onSubmit={withdraw} />
        <MethodBox method='Transfer' onSubmit={transfer} />
        <MethodBox method='Limit Order' onSubmit={limitOrder} />
        <MethodBox method='Transfer With Fees' onSubmit={transferWithFees} />
        <MethodBox
          method='Limit Order With Fees'
          onSubmit={limitOrderWithFees}
        />
        <MethodBox method='Withdraw With Fees' onSubmit={withdrawWithFees} />
      </div>
    )
  }
  const handleDappConfig = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const config = event.target.value
    setDappConfig(config)
    localStorage.setItem('dappConfig', config)
  }
  const clearLocalStorage = () => {
    localStorage.clear()
    onboard.walletReset()
    window.location.reload()
  }
  const renderDisconnected = () => {
    return (
      <div>
        <section>
          <div>network: Ropsten</div>
        </section>
        <section>
          <div>dapp config</div>
          <textarea value={dappConfig} onChange={handleDappConfig}></textarea>
        </section>
        <section>
          <div>Not connected</div>
          <button onClick={connect}>Connect wallet</button>
          <button onClick={clearLocalStorage}>clear local storage</button>
        </section>
      </div>
    )
  }

  const children: ReactElement = starkKey
    ? renderConnected()
    : renderDisconnected()
  return (
    <main>
      <h1>WalletConnect StarkWare dapp example</h1>
      {children}
    </main>
  )
}

export default App
