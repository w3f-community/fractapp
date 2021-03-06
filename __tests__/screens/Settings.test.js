import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {Settings} from 'screens/Settings';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});
jest.mock('react-native-keychain', () => ({
  getSupportedBiometryType: jest.fn(),
}));
useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
