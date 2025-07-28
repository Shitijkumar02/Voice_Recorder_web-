// Updated Voice_Recorder_web.js with Pause/Resume support
let mediaRecorder, audioChunks = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const status = document.getElementById('status');
const player = document.getElementById('player');
const recordingsList = document.getElementById('recordings');

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio_data', blob);

    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const { filename } = await res.json();
    const audioURL = `/recordings/${filename}`;
    player.src = audioURL;
    player.style.display = 'block';
    status.textContent = "✅ Recording saved and ready to play!";
    document.body.classList.remove('recording');
    loadRecordings();
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  pauseBtn.disabled = false;
  status.textContent = "🎙️ Recording...";
  document.body.classList.add('recording');
};

pauseBtn.onclick = () => {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    pauseBtn.textContent = "▶️ Resume";
    status.textContent = "⏸ Recording paused.";
  } else if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    pauseBtn.textContent = "⏸ Pause";
    status.textContent = "🎙️ Recording resumed...";
  }
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  pauseBtn.disabled = true;
  pauseBtn.textContent = "⏸ Pause";
  status.textContent = "⏹️ Stopping...";
};

async function loadRecordings() {
  const res = await fetch('/list');
  const recordings = await res.json();

  recordingsList.innerHTML = '';
  recordings.forEach(filename => {
    const li = document.createElement('li');
    li.innerHTML = `
      <audio controls src="/recordings/${filename}"></audio>
      <button onclick="deleteRecording('${filename}')">🗑️ Delete</button>
    `;
    recordingsList.appendChild(li);
  });
}

async function deleteRecording(filename) {
  await fetch(`/delete/${filename}`, { method: 'DELETE' });
  loadRecordings();
}

window.onload = loadRecordings;
