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
        const response = await fetch('http://localhost:5678/webhook-test/50f24481-550e-4ba5-8d31-eb1042de4789', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            let responseData = await response.json();

            // Debugging log to see actual object in browser console
            console.log("n8n Response Data:", responseData);

            // اگر n8n سے ڈیٹا Array میں آ رہا ہو تو پہلا آئٹم منتخب کریں
            const data = Array.isArray(responseData) ? responseData[0] : responseData;

            // 1. Candidate Name (تعدد کیز چیک کریں)
            const name = data.candidateName || data.candidate_name || data.name || 'Candidate Name Not Found';
            resName.innerText = name;

            // 2. Score
            resScore.innerText = (data.score !== undefined && data.score !== null) ? `${data.score}%` : 'N/A';

            // 3. Summary
            resSummary.innerText = data.summary || 'Audit evaluation complete.';

            // 4. Populate skills tags safely
            let skillsArray = [];
            if (Array.isArray(data.skills)) {
                skillsArray = data.skills;
            } else if (typeof data.skills === 'string') {
                skillsArray = data.skills.split(',').map(s => s.trim());
            }

            if (skillsArray.length > 0) {
                resSkills.innerHTML = skillsArray
                    .map(skill => `<span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-mono font-medium">${skill}</span>`)
                    .join('');
            } else {
                resSkills.innerText = 'No key skills extracted.';
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
        console.error("Fetch Error:", err);
        alert('Fatal: Remote host connection refused. Ensure n8n is running.');
        resetUI();
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `<span>Initialize AI Audit</span> <i data-lucide="sparkles" class="w-4 h-4"></i>`;
        lucide.createIcons();
    }
};