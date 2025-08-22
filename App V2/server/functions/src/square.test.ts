import { makeClient } from './square';
import { SquareClient } from 'square';

jest.mock('firebase-functions', () => ({
  config: jest.fn()
}));

const functions = require('firebase-functions');

describe('makeClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SQUARE_ACCESS_TOKEN;
    delete process.env.SQUARE_ENV;
  });

  it('throws when token missing', () => {
    functions.config.mockReturnValue({});
    expect(() => makeClient()).toThrow('Square token missing');
  });

  it('returns SquareClient when token provided', () => {
    functions.config.mockReturnValue({ square: { token: 'token', env: 'production' } });
    const client = makeClient();
    expect(client).toBeInstanceOf(SquareClient);
  });
});
