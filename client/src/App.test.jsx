import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Dashboard', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('./components/FundDetail', () => () => <div>FundDetail</div>);
jest.mock('./components/Screener', () => () => <div>Screener</div>);
jest.mock('./components/Compare', () => () => <div>Compare</div>);
jest.mock('./components/CategoryOverview', () => () => <div>CategoryOverview</div>);
jest.mock('./components/Watchlist', () => () => <div>Watchlist</div>);

test('renders the app shell with navigation', () => {
  render(<App />);
  expect(screen.getByText('FundLens')).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Screener')).toBeInTheDocument();
});
