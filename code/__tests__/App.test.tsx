import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('shows the app name as the screen heading', async () => {
    await render(<App />);
    expect(screen.getByRole('header', { name: 'Personal Finance Tracker' })).toBeOnTheScreen();
  });
});
