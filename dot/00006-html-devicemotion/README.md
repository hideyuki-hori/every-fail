# 加速度センサー

スマホの傾きでカニを動かした。
localhost を https にしないといけないので `mkcert` を入れた。

```sh
brew install mkcert
```

```sh
mkcert -install
mkcert localhost
```

これで localhost.pem ができる。
vite.config.ts に設定を書く。

カメラと同じく requestPermission() する際は button などのユーザのタッチ操作が必須。

`event.accelerationIncludingGravity.x` はめちゃくちゃ細かい値が入ってる。