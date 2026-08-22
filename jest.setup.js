import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const MockIcon = (props) => {
          return React.createElement('IconMock', { ...props, 'data-icon-name': String(prop) });
        };
        MockIcon.displayName = String(prop);
        return MockIcon;
      },
    }
  );
});
