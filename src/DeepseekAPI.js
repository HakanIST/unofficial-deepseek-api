require('dotenv').config();
const { Readable } = require('stream');
const axios = require('axios');
const iconv = require('iconv-lite');

const API_URL = "https://coder.deepseek.com/api/v0";

class DeepseekAPI {
    constructor(email, password, modelClass = 'deepseek_chat') {
        this.email = email;
        this.password = password;
        this.modelClass = modelClass;
        this.baseHeaders = {
            "Accept-Language": "en-IN,en;q=0.9",
            "Content-Type": "application/json"
        };
        this.prompt = "Your name is Josh. You will act as a Customer Service representative for kitchen supplies and appliances. Adopt a friendly and helpful attitude. Keep your responses concise. Provide answers from the scope of kitchen supplies and appliances. If the answer is not included, say exactly “Sorry, I can't help you with that right now. Please ask something about kitchen appliances.” Refuse to answer any question or respond to any statement not contained in the context. Never break character.";
    }

    async login() {
        try {
            const response = await axios.post(`${API_URL}/users/login`, {
                email: this.email,
                password: this.password
            }, { headers: this.baseHeaders });

            this.credentials = response.data;
            this.baseHeaders['Authorization'] = `Bearer ${this.credentials.data.user.token}`;
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async newChat() {
    try {
        const response = await axios.post(`${API_URL}/chat/clear_context`, {
            model_class: this.modelClass
        }, { headers: this.baseHeaders });

        // Başarılı bir istek durumunda loglama
        console.log('New chat started successfully:', response.data);
    } catch (error) {
        console.error('Failed to start a new chat:', error.message);
        if (error.response) {
            // API tarafından dönen hata bilgileri
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            // İstek yapıldı ama yanıt alınamadı
            console.error('No response received:', error.request);
        } else {
            // İstek yapılırken hata oluştu
            console.error('Error setting up request:', error.message);
        }
    }
}





    async chat(message) {
        const fullMessage = this.prompt + "\n\n" + message;

        try {
            const response = await axios.post(`${API_URL}/chat/completions`, {
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
                    // Iconv-lite ile UTF-8'e dönüştür
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
                            }
                        }
                    });
                    resolve(finalResponse);
                });
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
}

(async () => {
    const deepseek = new DeepseekAPI(
        process.env.DEEPSEEK_EMAIL,
        process.env.DEEPSEEK_PASSWORD,
        'deepseek_chat'
    );

    await deepseek.login();
    await deepseek.newChat();
    const finalResponse = await deepseek.chat('What are best 10 hiking tips?');
    console.log('Final Response:', finalResponse);
})();
