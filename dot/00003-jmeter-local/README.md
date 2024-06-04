# install

[JDK](https://www.oracle.com/jp/java/technologies/downloads/#jdk22-mac) を入れる。
Apple Silicon の場合は ARM64


```sh
brew install jmeter
```

# 使い方

## テストプラン作成

- GUI を開く
  - terminal で jmeter
- メインメニューから「File」 -> 「New」を選択
- Thead Group 追加
  - テストプランを右クリックし、「Add」 -> 「Threads (Users)」 -> 「Thread Group」を選択
- 「Thread Group」の設定
  - Number of Threads (users): 10 （テストユーザーの数）
  - Ramp-Up Period (in seconds): 10 （ユーザーが順次開始されるまでの時間）
  - Loop Count: 1 （各ユーザーがリクエストを送信する回数）
- 「HTTP Request Defaults」を追加
  - 「Thread Group」を右クリックし、「Add」 -> 「Config Element」 -> 「HTTP Request Defaults」
  - Server Name or IP: example.com
- 「HTTP Request」を追加
  - 「Thread Group」を右クリックし、「Add」 -> 「Sampler」 -> 「HTTP Request」を選択
  - Path: / （ホームページを指定）
- 「View Results Tree」を追加
  - 「Thread Group」を右クリックし、「Add」 -> 「Listener」 -> 「View Results Tree」を選択
- テストプランを保存

## 実行

```sh
jmeter -n -t /path/to/testplan.jmx -l /path/to/results.jtl
```

## レポート生成

html になる

```sh
jmeter -g /path/to/results.jtl -o /path/to/report
```
