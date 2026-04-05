import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowingChild = () => {
  throw new Error('Test error');
};

const GoodChild = () => <div>All good</div>;

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test('renders children when no error', () => {
  render(
    <ErrorBoundary>
      <GoodChild />
    </ErrorBoundary>,
  );
  expect(screen.getByText('All good')).toBeInTheDocument();
});

test('shows fallback UI when a child throws', () => {
  render(
    <ErrorBoundary>
      <ThrowingChild />
    </ErrorBoundary>,
  );
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText('Reload Page')).toBeInTheDocument();
  expect(screen.getByText('Try Again')).toBeInTheDocument();
});

test('resets error state on Try Again click', () => {
  const { rerender } = render(
    <ErrorBoundary>
      <ThrowingChild />
    </ErrorBoundary>,
  );
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Try Again'));

  rerender(
    <ErrorBoundary>
      <GoodChild />
    </ErrorBoundary>,
  );
  expect(screen.getByText('All good')).toBeInTheDocument();
});
