import { ConfigProvider, Layer } from 'effect'

const provider = ConfigProvider.fromJson({
  api: 'http://localhost:8787/api',
})

export const ConfigProviderLive = Layer.setConfigProvider(provider)
