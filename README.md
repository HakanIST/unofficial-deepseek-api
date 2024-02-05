# Unofficial Deepseek API Wrapper

This is an unofficial Node.js wrapper for the Deepseek API, designed to simplify the process of interacting with Deepseek's artificial intelligence services. It provides a straightforward way to authenticate, manage chat sessions, and process responses in JavaScript applications.

## Features

- Easy authentication with Deepseek API.
- Simplified session management for initiating new chats.
- Streamlined message sending and receiving with support for real-time updates.
- Built-in error handling for robust application development.

## Installation

Install the package using npm:

```bash
npm install unofficial-deepseek-api
```

Or using yarn:

```bash
yarn add unofficial-deepseek-api
```

## Usage
First, import the DeepseekAPI class from the package and create an instance with your Deepseek credentials:

```bash
const DeepseekAPI = require('./src/DeepseekAPI');
// Creating an instance with a custom prompt
const deepseek = new DeepseekAPI('your-email@example.com', 'your-password', 'deepseek_chat', 'Custom prompt here. Adjust the tone, style, and content as needed.');
```

## Logging In
Authenticate your session with Deepseek:

```bash
deepseek.login().then(() => {
  console.log('Successfully logged in to Deepseek.');
}).catch(error => {
  console.error('Login failed:', error);
});
```
Starting a New Chat
Initiate a new chat session:

```bash
deepseek.newChat().then(() => {
  console.log('New chat session started.');
}).catch(error => {
  console.error('Failed to start a new chat:', error);
});
```

Sending a Message
Send a message and receive a response:

```bash
deepseek.chat('What are the best 10 hiking tips?').then(response => {
  console.log('Response:', response);
}).catch(error => {
  console.error('Failed to send message:', error);
});
```
## Contributing
Contributions are welcome! If you have suggestions for improving this wrapper, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
This is an unofficial wrapper for the Deepseek API, not affiliated with, authorized, maintained, sponsored, or endorsed by Deepseek or any of its affiliates or subsidiaries. Use at your own risk.
