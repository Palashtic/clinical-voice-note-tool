// ----- Global Variables -----
let recognition;
let finalTranscript = "";

// ----- Initialize Speech Recognition -----
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Your browser does not support Web Speech API. Use Chrome or Edge.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;        // keep listening
  recognition.interimResults = true;    // show partial results
  recognition.lang = "en-US";

  // Fired when speech is recognized
  recognition.onresult = (event) => {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];

      if (result.isFinal) {
        finalTranscript += result[0].transcript + " ";
      } else {
        interim += result[0].transcript;
      }
    }

    // Update transcript screen live
    document.getElementById("transcript-box").textContent =
      finalTranscript + " " + interim;
  };

  // Optional: show visual status
  recognition.onstart = () => {
    document.getElementById("record-status").textContent = "Recording...";
  };

  recognition.onend = () => {
    document.getElementById("record-status").textContent = "Stopped";
  };
}

// ----- Screen Navigation -----
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ----- Start Recording -----
document.getElementById("btn-start-record").addEventListener("click", () => {
  initSpeechRecognition();

  finalTranscript = "";
  recognition.start();

  // Enable stop button
  document.getElementById("btn-stop-record").disabled = false;

  // Switch to transcript screen immediately
  showScreen("screen-transcript");
});

// ----- Stop Recording -----
document.getElementById("btn-stop-record").addEventListener("click", () => {
  if (recognition) recognition.stop();
  document.getElementById("btn-stop-record").disabled = true;
});

// ----- Go to Summary -----
document.getElementById("goto-summary").addEventListener("click", () => {
  // Move transcript into summary box to prepare for AI summary later
  document.getElementById("summary-text").value = finalTranscript;

  showScreen("screen-summary");
});
// ----- Clear Transcript -----
document.getElementById("clear-transcript").addEventListener("click", () => {
  finalTranscript = "";
  document.getElementById("transcript-box").textContent = "";
});

// ----- Download Transcript (.txt) -----
document.getElementById("download-transcript").addEventListener("click", () => {
  if (!finalTranscript.trim()) {
    alert("Transcript is empty!");
    return;
  }

  const blob = new Blob([finalTranscript], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transcript.txt";
  a.click();

  URL.revokeObjectURL(url);
});
// ----- Mock AI Summary Generator -----
// ----- Generate Summary Using Serverless Function -----
document.getElementById("download-summary").insertAdjacentHTML(
  "beforebegin",
  `<button id="generate-summary">Generate AI Summary</button>`
);

document.getElementById("generate-summary").addEventListener("click", async () => {
  const transcript = finalTranscript;

  if (!transcript.trim()) {
    alert("Transcript is empty!");
    return;
  }

  // Show loading state
  const summaryBox = document.getElementById("summary-text");
  summaryBox.value = "Generating summary...\nPlease wait.";

  try {
    const response = await fetch("https://clinical-voice-note-tool.vercel.app/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();

    if (data.summary) {
      summaryBox.value = data.summary;
    } else {
      summaryBox.value = "Error creating summary.";
    }
  } catch (err) {
    console.error(err);
    summaryBox.value = "Network error while generating summary.";
  }
});
