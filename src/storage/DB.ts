import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import {base64Encode, randomAsU8a} from '@polkadot/util-crypto';
import PasscodeUtil from 'utils/passcode';
import {Keyring} from '@polkadot/keyring';
import {u8aToHex} from '@polkadot/util';
import {Account} from 'types/account';
import {Currency, getSymbol} from 'types/wallet';
import {Transaction} from 'types/transaction';
import {ChatInfo} from 'types/chatInfo';
import {AuthInfo} from 'types/authInfo';
import {MyProfile} from 'types/myProfile';
import {UserProfile} from 'types/profile';
import BN from 'bn.js';
/**
 * @namespace
 * @category Storage
 */

namespace DB {
  export const secureOption = {
    service: 'com.fractapp',
  };
  export const biometryOption = {
    service: 'com.fractapp',
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  };

  export const AsyncStorageKeys = {
    price: (currency: Currency) => `price_${currency}`,
    profile: 'profile',
    authInfo: 'auth_info',
    notificationCount: 'notification_count',
    accounts: 'accounts',
    contacts: 'contacts',
    users: 'users',
    accountInfo: (address: string) => `account_${address}`,
    transactions: (currency: Currency) => `transactions_${getSymbol(currency)}`,
    pendingTransactions: (currency: Currency) =>
      `pending_transactions_${getSymbol(currency)}`,
    chatByChatId: (chatId: string) => `chat_${chatId}`,
    chatsInfo: 'chats_info',
  };
  export const SecureStorageKeys = {
    firebaseToken: 'firebase_token',
    authJWT: 'auth_jwt',
    seed: 'seed',
    salt: 'salt',
    passcodeHash: 'passcode_hash',
  };
  export const PasscodeStorageKeys = {
    passcode: 'passcode',
  };

  export async function setSecureItem(key: string, value: string) {
    const result = await Keychain.setInternetCredentials(
      key,
      key,
      value,
      secureOption,
    );
    if (result === false) {
      throw new Error(`invalid set ${key}`);
    }
  }
  export async function getSecureItem(key: string): Promise<string | null> {
    const result = await Keychain.getInternetCredentials(key, secureOption);
    if (result === false) {
      return null;
    }

    return result.password;
  }

  export async function setAuthInfo(auth: AuthInfo) {
    await AsyncStorage.setItem(AsyncStorageKeys.authInfo, JSON.stringify(auth));
  }
  export async function getAuthInfo(): Promise<AuthInfo | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.authInfo);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setPrice(currency: Currency, value: number) {
    await AsyncStorage.setItem(AsyncStorageKeys.price(currency), String(value));
  }
  export async function getPrice(currency: Currency): Promise<number> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.price(currency));
    if (result == null) {
      return 0;
    }
    return Number(result);
  }

  export async function setProfile(profile: MyProfile) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.profile,
      JSON.stringify(profile),
    );
  }
  export async function getProfile(): Promise<MyProfile | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.profile);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setNotificationCount(count: number) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.notificationCount,
      String(count),
    );
  }
  export async function getNotificationCount(): Promise<number> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.notificationCount,
    );
    return Number(result);
  }

  export async function enablePasscode(passcode: string, isBiometry: boolean) {
    if (isBiometry) {
      const result = await Keychain.setInternetCredentials(
        PasscodeStorageKeys.passcode,
        PasscodeStorageKeys.passcode,
        passcode,
        biometryOption,
      );
      if (result === false) {
        throw new Error('invalid set passcode');
      }
    }

    const salt = base64Encode(randomAsU8a(32));
    const hash = PasscodeUtil.hash(passcode, salt);
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        isSynced: false,
        isAuthed: false,
        isPasscode: false,
        isBiometry: false,
      };
    }

    try {
      await setSecureItem(SecureStorageKeys.salt, salt);
      await setSecureItem(SecureStorageKeys.passcodeHash, hash);
      authInfo.isPasscode = true;
      authInfo.isBiometry = isBiometry;
    } catch (e) {
      await disablePasscode();
    }

    await setAuthInfo(authInfo);
  }
  export async function disablePasscode() {
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        isSynced: false,
        isAuthed: false,
        isPasscode: false,
        isBiometry: false,
      };
    }
    authInfo.isPasscode = false;
    authInfo.isBiometry = false;

    await setAuthInfo(authInfo);

    await Keychain.resetInternetCredentials(
      SecureStorageKeys.salt,
      secureOption,
    );
    await Keychain.resetInternetCredentials(
      SecureStorageKeys.passcodeHash,
      secureOption,
    );
  }

  export async function getSalt(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.salt);
  }
  export async function getPasscodeHash(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.passcodeHash);
  }
  export async function getPasscode(): Promise<string> {
    const result = await Keychain.getInternetCredentials(
      PasscodeStorageKeys.passcode,
      biometryOption,
    );
    if (result === false) {
      throw new Error('value by passcode key not found');
    }

    return result.password;
  }

  export async function createAccounts(seed: string) {
    let polkadotWallet = new Keyring({
      type: 'sr25519',
      ss58Format: 0,
    }).addFromUri(seed);
    let kusamaWallet = new Keyring({type: 'sr25519', ss58Format: 2}).addFromUri(
      seed,
    );
    let accountsInfo = new Array<Account>(
      {
        name: 'Polkadot wallet',
        address: polkadotWallet.address,
        pubKey: u8aToHex(polkadotWallet.publicKey),
        currency: Currency.Polkadot,
        balance: 0,
        planks: new BN(0).toString(10),
      },
      {
        name: 'Kusama wallet',
        address: kusamaWallet.address,
        pubKey: u8aToHex(kusamaWallet.publicKey),
        currency: Currency.Kusama,
        balance: 0,
        planks: new BN(0).toString(10),
      },
    );
    let accounts = new Array<string>();
    for (let i = 0; i < accountsInfo.length; i++) {
      const account = accountsInfo[i];
      accounts.push(account.address);
      await setAccountInfo(account);
    }
    await setAccounts(accounts);
    await setSecureItem(SecureStorageKeys.seed, seed);
  }
  export async function getSeed(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.seed);
  }

  export async function setAccounts(accounts: Array<string>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.accounts,
      JSON.stringify(accounts),
    );
  }
  export async function getAccounts(): Promise<Array<string> | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.accounts);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setChatsInfo(chats: Map<string, ChatInfo>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.chatsInfo,
      JSON.stringify([...chats]),
    );
  }
  export async function getChatsInfo(): Promise<Map<string, ChatInfo>> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.chatsInfo);

    if (result == null) {
      return new Map<string, ChatInfo>();
    }
    return new Map<string, ChatInfo>(JSON.parse(result));
  }

  export async function setChat(chatId: string, chats: Map<string, Currency>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.chatByChatId(chatId),
      JSON.stringify([...chats]),
    );
  }
  export async function getChat(
    chatId: string,
  ): Promise<Map<string, Currency>> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.chatByChatId(chatId),
    );

    if (result == null) {
      return new Map<string, Currency>();
    }
    return new Map<string, Currency>(JSON.parse(result));
  }

  export async function setTx(currency: Currency, tx: Transaction) {
    const txs = await getTxs(currency);

    txs.set(tx.id, tx);
    await AsyncStorage.setItem(
      AsyncStorageKeys.transactions(currency),
      JSON.stringify([...txs]),
    );
  }
  export async function getTxs(
    currency: Currency,
  ): Promise<Map<string, Transaction>> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.transactions(currency),
    );

    if (result == null) {
      return new Map<string, Transaction>();
    }
    return new Map<string, Transaction>(JSON.parse(result));
  }

  export async function setContacts(contacts: Array<UserProfile>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.contacts,
      JSON.stringify(contacts),
    );
  }
  export async function getContacts(): Promise<Array<UserProfile>> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.contacts);

    if (result == null) {
      return [];
    }

    return JSON.parse(result);
  }

  export async function setUsers(users: Map<string, UserProfile>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.users,
      JSON.stringify([...users]),
    );
  }

  export async function getUsers(): Promise<Map<string, UserProfile>> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.users);

    if (result == null) {
      return new Map<string, UserProfile>();
    }
    return new Map<string, UserProfile>(JSON.parse(result));
  }

  export async function setPendingTxs(currency: Currency, txs: Array<string>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.pendingTransactions(currency),
      JSON.stringify(txs),
    );
  }

  export async function getPendingTxs(
    currency: Currency,
  ): Promise<Array<string>> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.pendingTransactions(currency),
    );

    if (result == null) {
      return [];
    }

    return JSON.parse(result);
  }

  export async function setAccountInfo(account: Account) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.accountInfo(account.address),
      JSON.stringify(account),
    );
  }
  export async function getAccountInfo(
    address: string,
  ): Promise<Account | null> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.accountInfo(address),
    );
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setFirebaseToken(token: string) {
    await setSecureItem(SecureStorageKeys.firebaseToken, token);
  }
  export async function getFirebaseToken(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.firebaseToken);
  }

  export async function setJWT(token: string) {
    await setSecureItem(SecureStorageKeys.authJWT, token);
  }
  export async function getJWT(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.authJWT);
  }
}

export default DB;
