const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800,
        maxResponseTime: 3000
    },
    conversationHistory: [],
    lastMessageTime: null,

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
        // Rate limiting
        if (this.lastMessageTime && Date.now() - this.lastMessageTime < 1000) {
            this.addMessage('bot', "Please wait a moment before sending another message.");
            return;
        }
        this.lastMessageTime = Date.now();

        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.conversationHistory.push({ sender: 'user', message });
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
                    this.conversationHistory.push({ sender: 'bot', response });
                }, delay);
            })
            .catch(error => {
                this.hideTypingIndicator(typingIndicator);
                const fallback = this.getFallbackResponse();
                this.addMessage('bot', fallback);
                this.conversationHistory.push({ sender: 'bot', response: fallback });
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
                    inputs: {
                        past_user_inputs: this.conversationHistory
                            .filter(m => m.sender === 'user')
                            .slice(-2)
                            .map(m => m.message),
                        generated_responses: this.conversationHistory
                            .filter(m => m.sender === 'bot')
                            .slice(-2)
                            .map(m => m.response),
                        text: userMessage
                    },
                    parameters: {
                        return_full_text: false,
                        max_length: 150
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 503 && errorData.error === "Model is loading") {
                    return "I'm still waking up. Please try again in a few seconds.";
                }
                if (response.status === 429) {
                    return "I'm getting too many requests. Please wait a moment before trying again.";
                }
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
            return this.getFallbackResponse();
        }
        
        // Handle different response formats
        let responseText = "";
        
        // Format 1: Direct generated_text
        if (data.generated_text) {
            responseText = data.generated_text;
        } 
        // Format 2: Array response
        else if (Array.isArray(data) && data.length > 0) {
            responseText = data[0].generated_text || "";
        }
        // Format 3: Conversation history format
        else if (data.conversation && data.conversation.generated_responses) {
            responseText = data.conversation.generated_responses.slice(-1)[0];
        }
        
        if (!responseText.trim()) {
            return this.getFallbackResponse();
        }
        
        return this.cleanResponse(responseText);
    },
    
    cleanResponse: function(text) {
        if (!text) return this.getFallbackResponse();
        
        // Remove any bot-specific prefixes
        let cleaned = text.replace(/^\s*(bot|ai|moira):?\s*/i, '').trim();
        
        // Remove special tokens or weird characters
        cleaned = cleaned.replace(/<\/?s>|\[|\]|\(|\)/g, '');
        
        // Ensure proper punctuation
        if (!/[.!?]$/.test(cleaned)) {
            cleaned += '.';
        }
        
        // Capitalize first letter and fix spacing
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        cleaned = cleaned.replace(/\s+([.,!?])/g, '$1'); // Remove space before punctuation
        cleaned = cleaned.replace(/([.,!?])([a-zA-Z])/g, '$1 $2'); // Add space after punctuation
        
        return cleaned;
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
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
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
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
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
