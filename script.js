lucide.createIcons();

const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('drop-area');
const statusArea = document.getElementById('status');
const fileNameDisp = document.getElementById('fileName');
const fileSizeDisp = document.getElementById('fileSize');
const uploadBtn = document.getElementById('uploadBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const successModal = document.getElementById('successModal');

// Dynamic modal elements
const auditScore = document.getElementById('auditScore');
const candidateSummary = document.getElementById('candidateSummary');
const candidateSkills = document.getElementById('candidateSkills');

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
    progressBar.style.width = '0%';
};

const closeModal = () => {
    successModal.classList.add('hidden');
    resetUI();
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
            // Parse JSON response returned from n8n / webhook
            const data = await response.json();

            // Populating data into the modal fields (adjust keys according to your n8n workflow response structure)
            auditScore.innerText = data.score ? `${data.score} / 100` : 'Evaluated';
            candidateSummary.innerText = data.summary || 'Resume analyzed successfully.';
            
            // Render skills as badges if returned as an array
            if (Array.isArray(data.skills)) {
                candidateSkills.innerHTML = data.skills
                    .map(skill => `<span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">${skill}</span>`)
                    .join('');
            } else {
                candidateSkills.innerText = data.skills || 'N/A';
            }

            progressBar.style.width = '100%';
            setTimeout(() => {
                successModal.classList.remove('hidden');
                lucide.createIcons();
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