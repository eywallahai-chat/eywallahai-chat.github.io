const chatList = document.getElementById("chatList");
const chatOutput = document.getElementById("chatOutput");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");
const modMenu = document.getElementById("modMenu");
const modBtn = document.getElementById("modBtn");

// Yeni sohbet oluştur
newChat.addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = `Sohbet ${chatList.children.length + 1}`;
  li.onclick = () => alert("Sohbet seçimi (yakında)");
  chatList.appendChild(li);
});

// Mesaj gönder
sendBtn.addEventListener("click", sendMessage);

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  setTimeout(() => appendMessage(`Cevap: ${text}`, "bot"), 500);

  userInput.value = "";
}

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;
  div.textContent = text;
  chatOutput.appendChild(div);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Mod menü toggle
modBtn.addEventListener("click", toggleModMenu);

function toggleModMenu() {
  modMenu.classList.toggle("hidden");
}
