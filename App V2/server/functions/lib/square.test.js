"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const square_1 = require("./square");
const square_2 = require("square");
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
        expect(() => (0, square_1.makeClient)()).toThrow('Square token missing');
    });
    it('returns SquareClient when token provided', () => {
        functions.config.mockReturnValue({ square: { token: 'token', env: 'production' } });
        const client = (0, square_1.makeClient)();
        expect(client).toBeInstanceOf(square_2.SquareClient);
    });
});
//# sourceMappingURL=square.test.js.map