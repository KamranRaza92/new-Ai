// Set the standardFontDataUrl BEFORE any PDF parsing operations take place
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = 
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/standard_fonts/`;
}

lucide.createIcons();

const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('drop-area');
const statusArea = document.getElementById('status');
const fileNameDisp = document.getElementById('fileName');
const fileSizeDisp = document.getElementById('fileSize');
const uploadBtn = document.getElementById('uploadBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

// Result Dashboard Elements
const resultsContainer = document.getElementById('resultsContainer');
const resScore = document.getElementById('resScore');
const resName = document.getElementById('resName');
const resSummary = document.getElementById('resSummary');
const resSkills = document.getElementById('resSkills');

dropArea.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisp.innerText = file.name;
        fileSizeDisp.innerText = (file.size / (1024 * 1024)).toFixed(2) + ' MB • Verified';
        statusArea.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        dropArea.classList.add('hidden');
    }
};

const resetUI = () => {
    fileInput.value = "";
    statusArea.classList.add('hidden');
    dropArea.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    progressBar.style.width = '0%';
};

uploadBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i> Analyzing...`;
    lucide.createIcons();

    progressContainer.classList.remove('hidden');
    setTimeout(() => { progressBar.style.width = '75%'; }, 100);

    try {
        const response = await fetch('http://localhost:5678/webhook/50f24481-550e-4ba5-8d31-eb1042de4789', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();

            // Populate the UI with incoming JSON fields from your n8n response node
            resScore.innerText = data.score ? `${data.score}%` : 'N/A';
            resName.innerText = data.candidateName || data.name || 'Candidate';
            resSummary.innerText = data.summary || 'Audit evaluation complete.';

            // Populate skills tags
            if (Array.isArray(data.skills) && data.skills.length > 0) {
                resSkills.innerHTML = data.skills
                    .map(skill => `<span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-mono font-medium">${skill}</span>`)
                    .join('');
            } else {
                resSkills.innerText = data.skills || 'No key skills extracted.';
            }

            progressBar.style.width = '100%';

            setTimeout(() => {
                resultsContainer.classList.remove('hidden');
                lucide.createIcons();
                // Smooth scroll down to the rendered results
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 600);

        } else {
            alert('System Error: Infrastructure response failed.');
            resetUI();
        }
    } catch (err) {
        alert('Fatal: Remote host connection refused.');
        resetUI();
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `<span>Initialize AI Audit</span> <i data-lucide="sparkles" class="w-4 h-4"></i>`;
        lucide.createIcons();
    }
};