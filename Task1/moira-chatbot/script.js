const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800
    },

    init: function() {
        if (!document.getElementById('send-message')) return;
        
        document.getElementById('send-message').onclick = () => this.sendMessage();
        document.getElementById('chatbot-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };

        setTimeout(() => {
            this.addMessage('bot', "Hello! I'm Moira. How can I support you today?");
        }, 1000);
    },

    sendMessage: function() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';
        
        const typingIndicator = this.showTypingIndicator();
        
        this.getAIResponse(message)
            .then(response => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', response);
            })
            .catch(error => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', "I'm having some trouble. Let's try again later.");
                console.error(error);
            });
    },

    getAIResponse: async function(userMessage) {
        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({ inputs: userMessage })
            });
            const data = await response.json();
            return data.generated_text || "I'm not sure how to respond to that.";
        } catch (error) {
            console.error(error);
            return "Sorry, I'm having trouble connecting.";
        }
    },

    showTypingIndicator: function() {
        const container = document.getElementById('chatbot-messages');
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
        return indicator;
    },

    hideTypingIndicator: function(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    },

    addMessage: function(sender, text) {
        const container = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
};

// Initialize only if on chatbot page
if (window.location.pathname.includes('chatbot.html')) {
    window.onload = function() {
        chatbot.init();
    };
  }
