// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Mood Tracker
    const moodChartCtx = document.getElementById('mood-chart').getContext('2d');
    let moodChart;
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];

    function updateMoodChart() {
        const labels = moodHistory.map(entry => new Date(entry.date).toLocaleDateString());
        const data = moodHistory.map(entry => {
            const moods = { happy: 3, sad: 1, angry: 2, anxious: 1 };
            return moods[entry.mood] || 2;
        });

        if (moodChart) moodChart.destroy();

        moodChart = new Chart(moodChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Trend',
                    data: data,
                    borderColor: '#5d93a6',
                    backgroundColor: 'rgba(93, 147, 166, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 3,
                        ticks: {
                            callback: function(value) {
                                const moods = { 1: 'Low', 2: 'Medium', 3: 'High' };
                                return moods[value] || '';
                            }
                        }
                    }
                }
            }
        });
    }

    document.querySelectorAll('.moods button').forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            const moodData = {
                date: new Date().toISOString(),
                mood: mood
            };
            
            moodHistory.push(moodData);
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
            
            document.getElementById('mood-result').innerHTML = `
                <p>You're feeling <strong>${mood}</strong></p>
                <p>${getMoodTip(mood)}</p>
            `;
            
            updateMoodChart();
        });
    });

    function getMoodTip(mood) {
        const tips = {
            happy: "Great! Consider journaling about what's making you happy.",
            sad: "It's okay to feel this way. Try a breathing exercise.",
            angry: "Take deep breaths. Count to 10 slowly.",
            anxious: "Let's do a 4-7-8 breathing exercise."
        };
        return tips[mood] || "Thank you for sharing.";
    }

    // Journal System
    const journal = {
        entries: JSON.parse(localStorage.getItem('journal')) || [],
        
        addEntry: function(text) {
            this.entries.push({
                date: new Date().toISOString(),
                text: text
            });
            localStorage.setItem('journal', JSON.stringify(this.entries));
            this.renderEntries();
        },
        
        renderEntries: function() {
            const container = document.getElementById('journal-entries');
            container.innerHTML = '';
            
            this.entries.forEach(entry => {
                const div = document.createElement('div');
                div.className = 'journal-entry';
                div.innerHTML = `
                    <small>${new Date(entry.date).toLocaleString()}</small>
                    <p>${entry.text}</p>
                `;
                container.appendChild(div);
            });
        }
    };

    document.getElementById('journal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('journal-text').value.trim();
        if (text) {
            journal.addEntry(text);
            document.getElementById('journal-text').value = '';
        }
    });

    // Breathing Exercise Functionality
const startBreathingBtn = document.getElementById('start-breathing');
if (startBreathingBtn) {
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    let isBreathing = false;
    let breathInterval;

    startBreathingBtn.addEventListener('click', function() {
        if (isBreathing) {
            clearInterval(breathInterval);
            isBreathing = false;
            this.textContent = 'Start';
            breathingText.textContent = 'Ready';
            breathingCircle.style.transform = 'scale(1)';
            breathingCircle.style.backgroundColor = 'var(--primary)';
            breathingCircle.classList.remove('breathing-in', 'holding', 'breathing-out');
            breathingCircle.classList.remove('breathing-active');
            return;
        }
        
        isBreathing = true;
        this.textContent = 'Stop';
        const pattern = document.getElementById('breathing-pattern').value;
        
        let inhale = 4, hold = 4, exhale = 4, pause = 0;
        
        switch(pattern) {
            case '478':
                inhale = 4; hold = 7; exhale = 8; break;
            case 'box':
                inhale = 4; hold = 4; exhale = 4; pause = 4; break;
            case 'relax':
                inhale = 4; hold = 7; exhale = 8; break;
        }
        
        let cycle = 0;
        breathingCircle.classList.add('breathing-active');
        
        breathInterval = setInterval(() => {
            const phase = cycle % (pause ? 4 : 3);
            
            breathingCircle.classList.remove('breathing-in', 'holding', 'breathing-out', 'pausing');
            
            if (phase === 0) {
                // Inhale
                breathingText.textContent = `Breathe In (${inhale}s)`;
                breathingCircle.style.backgroundColor = 'var(--accent)';
                breathingCircle.style.transform = 'scale(1.1)';
                breathingCircle.classList.add('breathing-in');
            } 
            else if (phase === 1) {
                // Hold
                breathingText.textContent = `Hold (${hold}s)`;
                breathingCircle.classList.add('holding');
            } 
            else if (phase === 2) {
                // Exhale
                breathingText.textContent = `Breathe Out (${exhale}s)`;
                breathingCircle.style.backgroundColor = 'var(--primary)';
                breathingCircle.style.transform = 'scale(1)';
                breathingCircle.classList.add('breathing-out');
            }
            else if (phase === 3) {
                // Pause (for box breathing)
                breathingText.textContent = `Pause (${pause}s)`;
                breathingCircle.classList.add('pausing');
            }
            
            cycle++;
        }, (inhale + hold + exhale + pause) * 1000 / (pause ? 4 : 3));
    });
}

    // Chatbot
    const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800,
        maxResponseTime: 3000
    },

    init: function() {
        const sendBtn = document.getElementById('send-message');
        const inputField = document.getElementById('chatbot-input');
        
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

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
                this.addMessage('bot', "I'm having trouble connecting. Let's try again later.");
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
                        max_length: 150,
                        temperature: 0.9,
                        repetition_penalty: 1.2
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
        let cleaned = text.replace(/^[^a-zA-Z0-9]+/, '').trim();
        
        if (!/[.!?]$/.test(cleaned)) {
            cleaned += '.';
        }
        
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

document.addEventListener('DOMContentLoaded', function() {
    chatbot.init();
});

    // Initialize
    if (moodHistory.length > 0) updateMoodChart();
    journal.renderEntries();
});
