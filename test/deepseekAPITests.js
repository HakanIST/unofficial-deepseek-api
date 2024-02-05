const DeepseekAPI = require('../src/DeepseekAPI');
const axios = require('axios');

// Axios'un jest ile mocklanması
jest.mock('axios');

describe('DeepseekAPI', () => {
    let deepseek;

    beforeEach(() => {
        // Her testten önce yeni bir DeepseekAPI instance'ı oluştur
        deepseek = new DeepseekAPI('test@example.com', 'password');
    });

    test('successfully creates an instance', () => {
        expect(deepseek).toBeInstanceOf(DeepseekAPI);
        expect(deepseek.email).toBe('test@example.com');
        expect(deepseek.password).toBe('password');
    });

    test('login method successfully logs in', async () => {
        // Mock response for login
        axios.post.mockResolvedValue({ data: { data: { user: { token: 'fake_token' } } } });

        await expect(deepseek.login()).resolves.not.toThrow();
        expect(axios.post).toHaveBeenCalled();
        expect(deepseek.baseHeaders['Authorization']).toBe('Bearer fake_token');
    });

    test('newChat method starts a new chat session', async () => {
        // Mock response for newChat
        axios.post.mockResolvedValue({ data: 'New chat started successfully' });

        await expect(deepseek.newChat()).resolves.not.toThrow();
        expect(axios.post).toHaveBeenCalled();
    });

    test('chat method sends a message and receives a response', async () => {
        // Mock response for chat
        const mockStreamResponse = {
            data: {
                on: (event, handler) => {
                    if (event === 'data') {
                        handler(Buffer.from(JSON.stringify({ choices: [{ delta: { content: "Response" } }] }), 'utf-8'));
                    }
                    if (event === 'end') {
                        handler();
                    }
                },
                pipe: jest.fn(),
            },
        };
        axios.post.mockResolvedValue(mockStreamResponse);

        await expect(deepseek.chat('Hello')).resolves.toEqual("Response");
        expect(axios.post).toHaveBeenCalled();
    });
});
