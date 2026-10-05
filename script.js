const API_URL = "http://localhost:3000";

const messageInput =
    document.getElementById("messageInput");

const actionButton =
    document.getElementById("actionButton");

const micIcon =
    document.getElementById("micIcon");

const sendIcon =
    document.getElementById("sendIcon");



/* =========================
   MIC / SEND SWITCH
========================= */

function updateActionButton() {

    const hasText =
        messageInput.value.trim().length > 0;


    if (hasText) {

        // SEND MODE

        micIcon.style.display = "none";

        sendIcon.style.display = "block";

        actionButton.classList.add(
            "send-mode"
        );

        actionButton.title = "Send";

        actionButton.setAttribute(
            "aria-label",
            "Send"
        );

    } else {

        // MIC MODE

        micIcon.style.display = "block";

        sendIcon.style.display = "none";

        actionButton.classList.remove(
            "send-mode"
        );

        actionButton.title = "Voice";

        actionButton.setAttribute(
            "aria-label",
            "Voice"
        );
    }
}



/* =========================
   INPUT CHANGE
========================= */

messageInput.addEventListener(
    "input",
    function () {

        updateActionButton();

        // Auto grow

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                150
            ) + "px";
    }
);



/* =========================
   BUTTON
========================= */

function handleAction() {

    const message =
        messageInput.value.trim();


    if (message) {

        sendMessage();

    } else {

        startVoice();

    }
}



/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) return;


    const welcome =
        document.getElementById("welcome");


    if (welcome) {

        welcome.style.display =
            "none";
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    messageInput.style.height =
        "auto";


    updateActionButton();


    const typingId =
        addTyping();


    try {

        const response =
            await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        const data =
            await response.json();


        const typingMessage =
            document.getElementById(
                typingId
            );


        if (typingMessage) {

            typingMessage.remove();
        }


        if (data.reply) {

            addMessage(
                data.reply,
                "ai"
            );


            speakAI(
                data.reply
            );

        } else {

            addMessage(
                "Sorry, mujhe response nahi mila. 😕",
                "ai"
            );
        }


    } catch (error) {

        console.error(
            "Connection Error:",
            error
        );


        const typingMessage =
            document.getElementById(
                typingId
            );


        if (typingMessage) {

            typingMessage.remove();
        }


        addMessage(
            "Backend se connection nahi ho raha. Check karo ke server chal raha hai.",
            "ai"
        );
    }
}



/* =========================
   ADD MESSAGE
========================= */

function addMessage(
    text,
    sender
) {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    const messageDiv =
        document.createElement(
            "div"
        );


    const id =
        "msg-" +
        Date.now() +
        Math.random();


    messageDiv.id = id;

    messageDiv.className =
        `message ${sender}`;


    messageDiv.innerHTML = `

        <div class="message-content">
            ${escapeHTML(text)}
        </div>

    `;


    chatArea.appendChild(
        messageDiv
    );


    chatArea.scrollTop =
        chatArea.scrollHeight;


    return id;
}



/* =========================
   TYPING
========================= */

function addTyping() {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    const messageDiv =
        document.createElement(
            "div"
        );


    const id =
        "typing-" +
        Date.now();


    messageDiv.id = id;

    messageDiv.className =
        "message ai";


    messageDiv.innerHTML = `

        <div class="message-content">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatArea.appendChild(
        messageDiv
    );


    chatArea.scrollTop =
        chatArea.scrollHeight;


    return id;
}



/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent = text;


    return div.innerHTML;
}



/* =========================
   SUGGESTIONS
========================= */

function useSuggestion(text) {

    messageInput.value =
        text;


    updateActionButton();


    messageInput.focus();
}



/* =========================
   NEW CHAT
========================= */

function newChat() {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    const welcome =
        document.getElementById(
            "welcome"
        );


    chatArea.innerHTML = "";


    chatArea.appendChild(
        welcome
    );


    welcome.style.display =
        "flex";


    messageInput.value = "";


    messageInput.style.height =
        "auto";


    updateActionButton();
}



/* =========================
   MOBILE SIDEBAR
========================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    sidebar.classList.toggle(
        "active"
    );
}



/* =========================
   VOICE INPUT
========================= */

let recognition = null;


function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input Chrome mein use karo."
        );

        return;
    }


    if (recognition) {

        recognition.stop();

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    actionButton.classList.add(
        "listening"
    );


    recognition.start();


    recognition.onresult =
        function (event) {

            let transcript = "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;
            }


            messageInput.value =
                transcript;


            updateActionButton();
        };


    recognition.onend =
        function () {

            actionButton.classList.remove(
                "listening"
            );


            recognition = null;


            updateActionButton();
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice Error:",
                event.error
            );


            actionButton.classList.remove(
                "listening"
            );


            recognition = null;


            updateActionButton();
        };
}



/* =========================
   AI VOICE
========================= */

function speakAI(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        "en-US";


    speech.rate =
        1;


    speech.pitch =
        1;


    speech.volume =
        1;


    speechSynthesis.speak(
        speech
    );
}



/* =========================
   ENTER
========================= */

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();


            if (
                messageInput.value.trim()
            ) {

                sendMessage();
            }
        }
    }
);



/* =========================
   INITIAL
========================= */

updateActionButton();