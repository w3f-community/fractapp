
## Getting Started

1. install yarn packages
```sh
yarn install
```


2. create debug.keystore
```sh
keytool -genkey -v -keystore android/app/debug1.keystore -storepass android -alias androiddebugkey1 -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

2. start dev server 
```sh
yarn start
```

3. start on android device or emulator
```sh
yarn android
```

## Tests

```sh
yarn test --coverage
```
