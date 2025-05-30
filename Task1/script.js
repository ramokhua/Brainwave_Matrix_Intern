// script.js
document.addEventListener('DOMContentLoaded', function() {
// Initialize components
initMoodTracker();
initBreathingExercise();
initReminders();
initChatbot();
initProfile();
initVoiceGreeting();
});
// 1. Mood Tracker with Chart
function initMoodTracker() {
const moodChartCtx = document.getElementById('mood-chart').getContext('2d');
let moodChart;
let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
// Update mood history chart
function updateMoodChart() {
const labels = moodHistory.map(entry => new Date(entry.date).toLocaleDateString());
const data = moodHistory.map(entry => {
const moods = { happy: 5, sad: 1, angry: 2, anxious: 3, tired: 4 };
return moods[entry.mood] || 3;
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
max: 5,
ticks: {
callback: function(value) {
const moods = { 1: 'Sad', 2: 'Angry', 3: 'Anxious', 4: 'Tired', 5: 'Happy' };
return moods[value] || '';
}
}
}
}
}
});
}
// Mood buttons click handler
document.querySelectorAll('.moods button').forEach(btn => {
btn.addEventListener('click', function() {
const mood = this.getAttribute('data-mood');
const moodData = {
date: new Date().toISOString(),
mood: mood
};
moodHistory.push(moodData);
localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
// Update UI
document.getElementById('mood-result').innerHTML = `
<p>You're feeling <strong>${mood}</strong> today</p>
<p>${getMoodTip(mood)}</p>
`;
// Update streak
updateStreak();
updateMoodChart();
});
});
// Mood tips
function getMoodTip(mood) {
const tips = {
happy: "Great to hear! Consider journaling about what's making you happy today.",
sad: "It's okay to feel this way. Would you like to try a breathing exercise?",
angry: "Try counting to 10 slowly. Journaling can help process these feelings.",
anxious: "Let's do a 4-7-8 breathing exercise together.",
tired: "Remember to hydrate and consider a short mindful break."
};
return tips[mood] || "Thank you for sharing how you feel.";
}
// Initialize chart
if (moodHistory.length > 0) {
updateMoodChart();
}
}
// 2. Breathing Exercise
function initBreathingExercise() {
const circle = document.getElementById('breathing-circle');
const text = document.getElementById('breathing-text');
const startBtn = document.getElementById('start-breathing');
const stopBtn = document.getElementById('stop-breathing');
let breathingInterval;
let isBreathing = false;
// Breathing patterns
const patterns = {
'478': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Calm' },
'box': { inhale: 4, hold: 4, exhale: 4, name: 'Box Breathing' }
};
startBtn.addEventListener('click', startBreathing);
stopBtn.addEventListener('click', stopBreathing);
function startBreathing() {
if (isBreathing) return;
isBreathing = true;
const pattern = patterns[document.getElementById('breathing-pattern').value];
let cycle = 0;
breathingInterval = setInterval(() => {
const phase = cycle % 3;
if (phase === 0) {
// Inhale
circle.style.animation = `breatheIn ${pattern.inhale}s ease-in forwards`;
text.textContent = 'Breathe In...';
} else if (phase === 1) {
// Hold
circle.style.animation = `breatheHold ${pattern.hold}s ease-in-out forwards`;
text.textContent = 'Hold...';
} else {
// Exhale
circle.style.animation = `breatheOut ${pattern.exhale}s ease-out forwards`;
text.textContent = 'Breathe Out...';
}
cycle++;
}, (pattern.inhale + pattern.hold + pattern.exhale) * 1000);
// Initial start
circle.style.animation = `breatheIn ${pattern.inhale}s ease-in forwards`;
text.textContent = 'Breathe In...';
}
function stopBreathing() {
clearInterval(breathingInterval);
isBreathing = false;
circle.style.animation = '';
text.textContent = 'Click to Start';
}
}
// 3. Reminders System
function initReminders() {
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
// Add new reminder
document.getElementById('add-reminder').addEventListener('click', function() {
const text = document.getElementById('reminder-text').value.trim();
const time = document.getElementById('reminder-time').value;
const type = document.getElementById('reminder-type').value;
if (!text || !time) {
alert('Please enter reminder text and time');
return;
}
const reminder = {
id: Date.now(),
text,
time,
type,
createdAt: new Date().toISOString()
};
reminders.push(reminder);
saveReminders();
renderReminders();
// Clear inputs
document.getElementById('reminder-text').value = '';
document.getElementById('reminder-time').value = '';
});
// Render reminders list
function renderReminders() {
const list = document.getElementById('reminder-list');
list.innerHTML = '';
reminders.sort((a, b) => a.time.localeCompare(b.time)).forEach(reminder => {
const li = document.createElement('li');
li.innerHTML = `
<div class="reminder-content">
<span class="reminder-time">${formatTime(reminder.time)}</span>
<span class="reminder-text">${reminder.text}</span>
<span class="reminder-type ${reminder.type}">${reminder.type}</span>
</div>
<button class="delete-reminder" data-id="${reminder.id}">×</button>
`;
list.appendChild(li);
});
// Add delete handlers
document.querySelectorAll('.delete-reminder').forEach(btn => {
btn.addEventListener('click', function() {
const id = parseInt(this.getAttribute('data-id'));
reminders = reminders.filter(r => r.id !== id);
saveReminders();
renderReminders();
});
});
// Check for upcoming reminders
checkReminders();
}
// Check for due reminders
function checkReminders() {
const now = new Date();
const currentTime = `${now.getHours().toString().padStart(2,
'0')}:${now.getMinutes().toString().padStart(2, '0')}`;
reminders.forEach(reminder => {
if (reminder.time === currentTime) {
showReminderNotification(reminder);
}
});
}
// Show notification
function showReminderNotification(reminder) {
if (Notification.permission === 'granted') {
new Notification(`MindMoor Reminder: ${reminder.text}`, {
body: `It's time for your ${reminder.type}`
});
} else if (Notification.permission !== 'denied') {
Notification.requestPermission().then(permission => {
if (permission === 'granted') {
showReminderNotification(reminder);
}
});
}
// Speak reminder if TTS is enabled
if (window.ttsEnabled) {
const speech = new SpeechSynthesisUtterance(`Reminder: ${reminder.text}`);
window.speechSynthesis.speak(speech);
}
}
// Format time (HH:MM to 12-hour format)
function formatTime(timeStr) {
const [hours, minutes] = timeStr.split(':');
const hour = parseInt(hours);
const ampm = hour >= 12 ? 'PM' : 'AM';
const hour12 = hour % 12 || 12;
return `${hour12}:${minutes} ${ampm}`;
}
// Save to localStorage
function saveReminders() {
localStorage.setItem('reminders', JSON.stringify(reminders));
}
// Request notification permission on load
if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
Notification.requestPermission();
}
// Check reminders every minute
setInterval(checkReminders, 60000);
// Initial render
renderReminders();
}
// 4. AI Chatbot with TTS
function initChatbot() {
const messagesContainer = document.getElementById('chatbot-messages');
const inputField = document.getElementById('chatbot-input');
const sendBtn = document.getElementById('send-message');
const ttsBtn = document.getElementById('tts-toggle');
// TTS toggle state
window.ttsEnabled = localStorage.getItem('ttsEnabled') === 'true';
ttsBtn.textContent = window.ttsEnabled ? '🔊 TTS ON' : '🔇 TTS OFF';
ttsBtn.style.backgroundColor = window.ttsEnabled ? '#5d93a6' : '#ccc';
// Chatbot responses
const responses = {
greetings: ["Hello! How are you feeling today?", "Hi there! What's on your mind?"],
feelings: {
sad: "I'm sorry to hear you're feeling sad. Remember, it's okay to feel this way. Would you like to try journaling about it?",
anxious: "When feeling anxious, try the 4-7-8 breathing exercise. Would you like me to guide you through it?",
happy: "That's wonderful! Celebrating good moments is important. Would you like to journal about what's making you happy?"
},
default: "I'm here to listen. Can you tell me more about how you're feeling?",
resources: "Here are some resources that might help: \n1. Practice mindfulness\n2. Try journaling\n3. Do a breathing exercise"
};
// Send message handler
function sendMessage() {
const message = inputField.value.trim();
if (!message) return;
// Add user message
addMessage('user', message);
inputField.value = '';
// Bot response
setTimeout(() => {
let response;
if (message.toLowerCase().includes('hi') || message.toLowerCase().includes('hello')) {
response = responses.greetings[Math.floor(Math.random() *
responses.greetings.length)];
}
else if (message.toLowerCase().includes('sad')) {
response = responses.feelings.sad;
}
else if (message.toLowerCase().includes('anxious') ||
message.toLowerCase().includes('stress')) {
response = responses.feelings.anxious;
}
else if (message.toLowerCase().includes('happy')) {
response = responses.feelings.happy;
}
else if (message.toLowerCase().includes('help') ||
message.toLowerCase().includes('resource')) {
response = responses.resources;
}
else {
response = responses.default;
}
addMessage('bot', response);
// Speak if TTS enabled
if (window.ttsEnabled) {
const speech = new SpeechSynthesisUtterance(response);
window.speechSynthesis.speak(speech);
}
}, 500);
}
// Add message to chat
function addMessage(sender, text) {
const messageDiv = document.createElement('div');
messageDiv.classList.add('message', sender);
messageDiv.textContent = text;
messagesContainer.appendChild(messageDiv);
messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
// Event listeners
sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', function(e) {
if (e.key === 'Enter') sendMessage();
});
// TTS toggle
ttsBtn.addEventListener('click', function() {
window.ttsEnabled = !window.ttsEnabled;
localStorage.setItem('ttsEnabled', window.ttsEnabled);
this.textContent = window.ttsEnabled ? '🔊 TTS ON' : '🔇 TTS OFF';
this.style.backgroundColor = window.ttsEnabled ? '#5d93a6' : '#ccc';
});
// Initial bot greeting
setTimeout(() => {
addMessage('bot', "Hi! I'm Moira, your mental health companion. How are you feeling today?");
}, 1000);
}
// 5. Profile System
function initProfile() {
// Load profile data
const profileData = JSON.parse(localStorage.getItem('profile')) || {
name: 'User',
streak: 0,
lastActive: null,
moodEntries: 0,
journalEntries: 0
};
// Update streak if active today
const today = new Date().toDateString();
if (profileData.lastActive !== today) {
if (profileData.lastActive && isYesterday(new Date(profileData.lastActive))) {
profileData.streak++;
} else if (!profileData.lastActive) {
profileData.streak = 1;
} else {
profileData.streak = 1;
}
profileData.lastActive = today;
saveProfile();
}
// Set initial values
document.getElementById('profile-name').value = profileData.name;
document.getElementById('streak-count').textContent = profileData.streak;
document.getElementById('mood-entries').textContent = profileData.moodEntries;
document.getElementById('journal-entries').textContent = profileData.journalEntries;
// Profile picture upload
document.getElementById('profile-upload').addEventListener('change', function(e) {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onload = function(event) {
document.getElementById('profile-pic').src = event.target.result;
profileData.avatar = event.target.result;
saveProfile();
};
reader.readAsDataURL(file);
}
});
// Name change
document.getElementById('profile-name').addEventListener('change', function() {
profileData.name = this.value;
saveProfile();
});
// Check if yesterday
function isYesterday(date) {
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
return date.toDateString() === yesterday.toDateString();
}
// Save profile
function saveProfile() {
localStorage.setItem('profile', JSON.stringify(profileData));
}
// Update mood entries count
function updateMoodEntries() {
profileData.moodEntries++;
document.getElementById('mood-entries').textContent = profileData.moodEntries;
saveProfile();
}
// Update streak display
function updateStreak() {
profileData.streak++;
document.getElementById('streak-count').textContent = profileData.streak;
saveProfile();
}
// Expose functions to other components
window.profileFunctions = {
updateMoodEntries,
updateStreak
};
}
// 6. Voice Greeting
function initVoiceGreeting() {
document.getElementById('voice-greeting').addEventListener('click', function() {
if (window.ttsEnabled) {
const greeting = new SpeechSynthesisUtterance(
"Welcome to MindMoor. Your safe harbor for mental wellness. " +
"You can track your mood, set reminders, and talk to me anytime."
);
window.speechSynthesis.speak(greeting);
}
});
}