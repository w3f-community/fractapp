import React, {useState} from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {Send} from 'screens/Send';
import {Network} from 'types/account';
import {Currency, Wallet} from 'types/wallet';
import { Adaptors } from 'adaptors/adaptor';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});
jest.mock('utils/tasks', () => {});

jest.mock('@polkadot/util-crypto', () => {});
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    get: jest.fn(),
  },
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);

  const tree = await render(
      <Send
        navigation={null}
        route={{
          params: {
            wallet: new Wallet(
              'Wallet Polkadot',
              'address#1',
              Currency.DOT,
              Network.Polkadot,
              100,
              '1000000000000',
              10,
            ),
            isEditable: false,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});
