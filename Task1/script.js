document.addEventListener('DOMContentLoaded', function() {
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

    // Breathing Exercise
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    let isBreathing = false;
    let breathInterval;

    document.getElementById('start-breathing').addEventListener('click', function() {
        if (isBreathing) return;
        
        isBreathing = true;
        const pattern = document.getElementById('breathing-pattern').value;
        let inhale = 4, hold = 4, exhale = 4;
        
        if (pattern === '478') {
            inhale = 4; hold = 7; exhale = 8;
        }
        
        let cycle = 0;
        breathInterval = setInterval(() => {
            if (cycle % 3 === 0) {
                // Inhale
                breathingText.textContent = 'Breathe In...';
                breathingCircle.style.transform = 'scale(1.2)';
                breathingCircle.style.backgroundColor = '#ff9e7d';
            } else if (cycle % 3 === 1) {
                // Hold
                breathingText.textContent = 'Hold...';
            } else {
                // Exhale
                breathingText.textContent = 'Breathe Out...';
                breathingCircle.style.transform = 'scale(1)';
                breathingCircle.style.backgroundColor = '#5d93a6';
            }
            cycle++;
        }, (inhale + hold + exhale) * 1000);
    });

    // Chatbot
async function getAIResponse(userMessage) {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: userMessage })
        });
        const data = await response.json();
        
        if (data.generated_text) {
            return data.generated_text;
        } else if (Array.isArray(data) && data[0]?.generated_text) {
            return data[0].generated_text;
        } else if (data.error) {
            return "Sorry, the AI service is temporarily unavailable.";
        } else {
            return "Sorry, I couldn't get a response right now.";
        }
    } catch (error) {
        return "Sorry, there was a problem connecting to the AI service.";
    }
}


function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;
    addMessage('user', message);
    input.value = '';
    
    addMessage('bot', "Thinking...");
    
    getAIResponse(message).then(response => {
        const container = document.getElementById('chatbot-messages');
        const lastMessage = container.querySelector('.message.bot:last-child');
        if (lastMessage && lastMessage.textContent === "Thinking...") {
            container.removeChild(lastMessage);
        }
        addMessage('bot', response);
    });
    }

    // Initialize
    if (moodHistory.length > 0) updateMoodChart();
    journal.renderEntries();
});
