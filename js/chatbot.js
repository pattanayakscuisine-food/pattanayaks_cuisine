/* ===================================================
   PATTANAYAK'S CUISINE — Chef Bot
   Powered by Google Gemini AI
   API key is loaded from js/config.js (gitignored).
   For full server-side security, upgrade Firebase to
   Blaze plan — the proxy in functions/ is ready to go.
   =================================================== */

// Key is injected by js/config.js (loaded before this script)
const GEMINI_API_KEY = window.GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;

const SYSTEM_PROMPT = "You are Chef Bot, a friendly food assistant for Pattanayak's Cuisine — a food blog by Saini Pattanayak and Soham that explores Bengali and Italian cuisines. Answer questions about dishes, recipes, cooking techniques, and ingredients. Give simple numbered step-by-step recipes. Be warm and friendly. Use food emojis. Keep answers short. If someone asks something not about food, say: I am a food assistant! Ask me about recipes.";

var fab        = document.getElementById("chatbotFab");
var panel      = document.getElementById("chatbotPanel");
var closeBtn   = document.getElementById("chatbotClose");
var messagesEl = document.getElementById("chatbotMessages");
var inputEl    = document.getElementById("chatInput");
var sendBtn    = document.getElementById("chatSend");

var conversationHistory = [];

// Open / Close
fab.addEventListener("click", function() {
  panel.classList.toggle("open");
  fab.classList.toggle("active");
  if (panel.classList.contains("open")) inputEl.focus();
});

closeBtn.addEventListener("click", function() {
  panel.classList.remove("open");
  fab.classList.remove("active");
});

// Send on button click
sendBtn.addEventListener("click", function() {
  sendMessage();
});

// Send on Enter key
inputEl.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Suggestion chips
function sendSuggestion(btn) {
  inputEl.value = btn.textContent;
  var chips = document.querySelector(".chat-suggestions");
  if (chips) chips.remove();
  sendMessage();
}

// Main send function
function sendMessage() {
  var text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;

  appendMessage("user", text);
  showTyping();

  // Guard: check API key is present
  if (!GEMINI_API_KEY) {
    removeTyping();
    appendMessage("bot", "⚠️ <strong>API key missing!</strong><br/><br/>Make sure js/config.js exists and contains your Gemini API key.");
    inputEl.disabled = false;
    sendBtn.disabled = false;
    return;
  }

  conversationHistory.push({
    role: "user",
    parts: [{ text: text }]
  });

  callGemini(function(reply, error) {
    removeTyping();
    if (error) {
      appendMessage("bot", "❌ <strong>Error: " + error + "</strong><br/><br/>Press F12 → Console tab for details.");
    } else {
      appendMessage("bot", reply);
      conversationHistory.push({
        role: "model",
        parts: [{ text: reply }]
      });
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
    }
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  });
}

// Call Gemini API directly (key loaded from gitignored config.js)
function callGemini(callback) {
  var url = GEMINI_URL;

  var body = JSON.stringify({
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600
    }
  });

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    try {
      var data = JSON.parse(xhr.responseText);

      if (xhr.status !== 200) {
        var errMsg = (data.error && data.error.message) ? data.error.message : "HTTP " + xhr.status;
        callback(null, errMsg);
        return;
      }

      if (!data.candidates || !data.candidates[0]) {
        callback(null, "Empty response from Gemini");
        return;
      }

      var reply = data.candidates[0].content.parts[0].text;
      callback(reply, null);

    } catch (e) {
      callback(null, "Could not parse response: " + e.message);
    }
  };

  xhr.onerror = function() {
    callback(null, "Network error — check your internet connection");
  };

  xhr.send(body);
}

// Add message to chat
function appendMessage(role, text) {
  var wrapper = document.createElement("div");
  wrapper.className = "chat-msg " + role;

  var bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.innerHTML = formatText(text);

  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Format bold + line breaks
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// Typing dots
function showTyping() {
  var el = document.createElement("div");
  el.className = "chat-msg bot";
  el.id = "typingIndicator";
  el.innerHTML = '<div class="chat-bubble typing-indicator"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTyping() {
  var el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// Contact form
var contactForm = document.getElementById("contactForm");
var formSuccess = document.getElementById("formSuccess");

if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var submitBtn = contactForm.querySelector("button[type='submit']");
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    var formData = new FormData(contactForm);
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", contactForm.action, true);
    xhr2.setRequestHeader("Accept", "application/json");

    xhr2.onreadystatechange = function() {
      if (xhr2.readyState !== 4) return;
      if (xhr2.status === 200) {
        contactForm.classList.add("hidden");
        formSuccess.classList.remove("hidden");
      } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        submitBtn.disabled = false;
        alert("Something went wrong. Please contact us on Instagram!");
      }
    };

    xhr2.send(formData);
  });
}

function resetForm() {
  if (contactForm) contactForm.classList.remove("hidden");
  if (formSuccess) formSuccess.classList.add("hidden");
  var submitBtn = contactForm ? contactForm.querySelector("button[type='submit']") : null;
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    submitBtn.disabled = false;
  }
  if (contactForm) contactForm.reset();
}