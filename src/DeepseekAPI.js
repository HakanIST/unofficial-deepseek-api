// src/DeepseekAPI.js
const axios = require('axios');
const iconv = require('iconv-lite');

class DeepseekAPI {
    constructor(email, password, modelClass = 'deepseek_chat') {
        this.email = email;
        this.password = password;
        this.modelClass = modelClass;
        this.API_URL = "https://coder.deepseek.com/api/v0";
        this.baseHeaders = {
            "Accept-Language": "en-IN,en;q=0.9",
            "Content-Type": "application/json"
        };
        this.prompt = "Your name is Ali. You will play the role of a blogger. Conform to a positive and informational tone. Try to craft content within 500 words. Maintain character at all times.";
    }

    async login() {
        try {
            const response = await axios.post(`${this.API_URL}/users/login`, {
                email: this.email,
                password: this.password
            }, { headers: this.baseHeaders });

            this.credentials = response.data;
            this.baseHeaders['Authorization'] = `Bearer ${this.credentials.data.user.token}`;
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Hata yönetimi için error'u fırlat
        }
    }

    async newChat() {
        try {
            const response = await axios.post(`${this.API_URL}/chat/clear_context`, {
                model_class: this.modelClass
            }, { headers: this.baseHeaders });

            console.log('New chat started successfully:', response.data);
        } catch (error) {
            console.error('Failed to start a new chat:', error.message);
            throw error; // Hata yönetimi için error'u fırlat
        }
    }

    async chat(message) {
        const fullMessage = this.prompt + "\n\n" + message;

        try {
            const response = await axios.post(`${this.API_URL}/chat/completions`, {
                message: fullMessage,
                stream: true,
                model_class: this.modelClass
            }, { headers: this.baseHeaders, responseType: 'stream' });

            return new Promise((resolve, reject) => {
                const stream = response.data;
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => {
                    const decodedBody = iconv.decode(Buffer.concat(chunks), 'utf-8');
                    const lines = decodedBody.split('\n');
                    let finalResponse = '';
                    lines.forEach(line => {
                        if (line.trim()) {
                            try {
                                const parsedLine = JSON.parse(line.replace('data: ', ''));
                                if (parsedLine.choices && parsedLine.choices[0].delta) {
                                    finalResponse += parsedLine.choices[0].delta.content || '';
                                }
                            } catch (error) {
                                console.error('Error parsing line:', line);
                                reject(error); // Hata yönetimi için reject kullan
                            }
                        }
                    });
                    resolve(finalResponse);
                });
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error; // Hata yönetimi için error'u fırlat
        }
    }
}

module.exports = DeepseekAPI;
