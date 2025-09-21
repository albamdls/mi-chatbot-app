        // Referencias a los elementos del DOM
        const chatWindow = document.getElementById('chat-window');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');

        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temperature-value');
        const topkSlider = document.getElementById('top-k');
        const topkValue = document.getElementById('top-k-value');
        const toppSlider = document.getElementById('top-p');
        const toppValue = document.getElementById('top-p-value');

        const API_URL = 'http://127.0.0.1:8000/chat';

        // Actualizar los valores numéricos al mover los sliders
        tempSlider.addEventListener('input', () => tempValue.textContent = tempSlider.value);
        topkSlider.addEventListener('input', () => topkValue.textContent = topkSlider.value);
        toppSlider.addEventListener('input', () => toppValue.textContent = toppSlider.value);

        // Función para añadir mensajes a la ventana del chat
        function addMessage(message, sender, params = null) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);

            // Limpiar el texto para evitar inyección de HTML
            const textNode = document.createTextNode(message);
            messageElement.appendChild(textNode);

            // Si es un mensaje del bot y tiene parámetros, los añade
            if (params) {
                const paramsElement = document.createElement('div');
                paramsElement.classList.add('params');
                paramsElement.textContent = `T: ${params.temperature}, K: ${params.top_k}, P: ${params.top_p}`;
                messageElement.appendChild(paramsElement);
            }

            chatWindow.appendChild(messageElement);
            chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll hacia abajo
        }

        // Función principal para enviar el mensaje
        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;

            // Mostrar el mensaje del usuario inmediatamente
            addMessage(message, 'user');
            userInput.value = '';

            // Recoger los valores de los parámetros
            const params = {
                temperature: parseFloat(tempSlider.value),
                top_k: parseInt(topkSlider.value),
                top_p: parseFloat(toppSlider.value)
            };

            try {
                // Mostrar un indicador de "pensando..."
                const thinkingMessage = document.createElement('div');
                thinkingMessage.classList.add('message', 'bot-message');
                thinkingMessage.textContent = 'Pensando...';
                chatWindow.appendChild(thinkingMessage);
                chatWindow.scrollTop = chatWindow.scrollHeight;

                // Realizar la petición a la API del backend
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        ...params // Añadir los parámetros al cuerpo de la petición
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.statusText}`);
                }

                const data = await response.json();

                // Eliminar el mensaje de "Pensando..."
                chatWindow.removeChild(thinkingMessage);

                // Mostrar la respuesta del bot con sus parámetros
                addMessage(data.reply || data.error, 'bot', params);

            } catch (error) {
                console.error('Error al contactar la API:', error);
                addMessage('Lo siento, no pude conectar con el servidor. Revisa la consola.', 'bot');
            }
        }

        // Event Listeners
        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });