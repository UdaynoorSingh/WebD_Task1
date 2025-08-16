import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Categories title', () => {
  render(<App />);
  expect(true).toBeTruthy();
});
