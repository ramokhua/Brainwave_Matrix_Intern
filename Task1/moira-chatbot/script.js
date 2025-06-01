const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800,
        maxResponseTime: 3000
    },

    init: function() {
        if (!document.getElementById('send-message')) return;
        
        // Event listeners
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Welcome message
        setTimeout(() => {
            this.addMessage('bot', "Hello! I'm Moira. How can I help you today?");
        }, 1000);
    },

    sendMessage: function() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';
        input.focus();
        
        const typingIndicator = this.showTypingIndicator();
        
        // Add delay for better UX
        const delay = Math.max(
            this.config.minResponseTime,
            Math.random() * this.config.maxResponseTime
        );
        
        this.getAIResponse(message)
            .then(response => {
                setTimeout(() => {
                    this.hideTypingIndicator(typingIndicator);
                    this.addMessage('bot', response);
                }, delay);
            })
            .catch(error => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', "I'm having some trouble. Let's try again later.");
                console.error("Chatbot error:", error);
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
                body: JSON.stringify({ 
                    inputs: userMessage,
                    parameters: {
                        return_full_text: false,
                        max_length: 150
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processResponse(data);
        } catch (error) {
            console.error("API Error:", error);
            return this.getFallbackResponse();
        }
    },
    
    processResponse: function(data) {
        if (data.error) {
            console.error("API Error:", data.error);
            return "I'm having some technical difficulties. Could you rephrase that?";
        }
        
        const responseText = data.generated_text || 
                           (Array.isArray(data) && data[0]?.generated_text) || 
                           "I'm not sure how to respond to that.";
        
        return this.cleanResponse(responseText);
    },
    
    cleanResponse: function(text) {
        // Remove any leading non-alphanumeric characters
        let cleaned = text.replace(/^[^a-zA-Z0-9]+/, '').trim();
        
        // Ensure the response ends with punctuation
        if (!/[.!?]$/.test(cleaned)) {
            cleaned += '.';
        }
        
        // Capitalize first letter
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    },
    
    getFallbackResponse: function() {
        const fallbacks = [
            "I'm still learning. Could you tell me more?",
            "Let me think about that... maybe try a breathing exercise while you wait?",
            "I want to understand better. Could you rephrase that?",
            "Sometimes writing helps. Would you like to try journaling instead?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('chatbot.html') || 
        document.getElementById('chatbot-messages')) {
        chatbot.init();
    }
});
