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
function generateMockSummary(transcript) {
  if (!transcript || transcript.trim().length === 0) {
    return "No transcript available to summarize.";
  }

  // Extract simple things (very basic heuristics)
  const vitalsMatch = transcript.match(/(bp|blood pressure|heart rate|hr|temperature|temp)[^.,]*/gi);
  const medsMatch = transcript.match(/(administered|gave|given|medication|dose)[^.,]*/gi);

  let summary = "### Clinical Summary\n\n";

  summary += "**Chief Complaint / Context:**\n";
  summary += transcript.split(".")[0] + ".\n\n";

  summary += "**Vitals:**\n";
  summary += vitalsMatch ? "- " + vitalsMatch.join("\n- ") + "\n\n" : "- No vitals detected.\n\n";

  summary += "**Medications Administered:**\n";
  summary += medsMatch ? "- " + medsMatch.join("\n- ") + "\n\n" : "- No medications detected.\n\n";

  summary += "**Assessment & Plan:**\n";
  summary += "- Continue monitoring.\n";
  summary += "- Follow up as needed.\n";
  summary += "- Handoff ready.\n";

  return summary;
}
// ----- Generate Summary -----
document.getElementById("generate-summary").addEventListener("click", () => {
  const transcript = finalTranscript;
  document.getElementById("summary-text").value = generateMockSummary(transcript);
});
// ----- Download Summary -----
document.getElementById("download-summary").addEventListener("click", () => {
  const text = document.getElementById("summary-text").value;

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "summary.txt";
  a.click();

  URL.revokeObjectURL(url);
});
document.getElementById("back-to-transcript").addEventListener("click", () => {
  showScreen("screen-transcript");
});
