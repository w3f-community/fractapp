import React from 'react';
import renderer from 'react-test-renderer';
import { WalletDetailsInfo } from 'components';
import { Currency, Wallet } from 'models/wallet'

it('Test Polkadot wallet', () => {
    const tree = renderer
        .create(<WalletDetailsInfo wallet={new Wallet("Wallet Polkadot", "address#1", Currency.Polkadot, 100, 10)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test Kusams wallet', () => {
    const tree = renderer
        .create(<WalletDetailsInfo wallet={new Wallet("Wallet Kusama", "address#2", Currency.Kusama, 20, 5)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});