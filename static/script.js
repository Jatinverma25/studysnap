// StudySnap Frontend Logic & Quiz Mode
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Upload & General
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = dropZone.querySelector('.upload-content');
    const fileInfo = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    const fileSizeSpan = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const submitBtn = document.getElementById('submitBtn');
    const uploadQuizBtn = document.getElementById('uploadQuizBtn');

    const uploadSection = document.getElementById('uploadSection');
    const loadingSection = document.getElementById('loadingSection');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingStatus = document.getElementById('loadingStatus');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const dismissErrorBtn = document.getElementById('dismissErrorBtn');

    // DOM Elements - Summaries Results
    const resultsSection = document.getElementById('resultsSection');
    const resultDocName = document.getElementById('resultDocName');
    const newUploadBtn = document.getElementById('newUploadBtn');
    const resultsQuizBtn = document.getElementById('resultsQuizBtn');
    const summaryQuizCtaBtn = document.getElementById('summaryQuizCtaBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const activeModeBadge = document.getElementById('activeModeBadge');
    const summaryContent = document.getElementById('summaryContent');
    const copyBtn = document.getElementById('copyBtn');

    // DOM Elements - Quiz Mode
    const quizSection = document.getElementById('quizSection');
    const quizDocName = document.getElementById('quizDocName');
    const quizQuestionCounter = document.getElementById('quizQuestionCounter');
    const quizScoreCounter = document.getElementById('quizScoreCounter');
    const timerCircle = document.getElementById('timerCircle');
    const timerText = document.getElementById('timerText');
    const quizTimerWrapper = document.getElementById('quizTimerWrapper');
    const exitQuizBtn = document.getElementById('exitQuizBtn');
    const quizProgressBarFill = document.getElementById('quizProgressBarFill');
    const quizActiveCard = document.getElementById('quizActiveCard');
    const qTag = document.getElementById('qTag');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsContainer = document.getElementById('quizOptionsContainer');
    const quizExplanationBox = document.getElementById('quizExplanationBox');
    const explanationIcon = document.getElementById('explanationIcon');
    const explanationTitle = document.getElementById('explanationTitle');
    const quizExplanationText = document.getElementById('quizExplanationText');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const nextBtnText = document.getElementById('nextBtnText');

    // DOM Elements - Quiz Completed Card
    const quizCompletedCard = document.getElementById('quizCompletedCard');
    const finalScoreVal = document.getElementById('finalScoreVal');
    const finalTotalVal = document.getElementById('finalTotalVal');
    const finalResultTitle = document.getElementById('finalResultTitle');
    const finalResultMsg = document.getElementById('finalResultMsg');
    const statAccuracy = document.getElementById('statAccuracy');
    const statCorrect = document.getElementById('statCorrect');
    const statTotalQuestions = document.getElementById('statTotalQuestions');
    const statDifficulty = document.getElementById('statDifficulty');
    const quizDifficultyBadge = document.getElementById('quizDifficultyBadge');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');
    const changeQuizSettingsBtn = document.getElementById('changeQuizSettingsBtn');
    const backToSummariesBtn = document.getElementById('backToSummariesBtn');
    const quizNewUploadBtn = document.getElementById('quizNewUploadBtn');

    // DOM Elements - Quiz Configuration / Decision Modal
    const quizConfigModal = document.getElementById('quizConfigModal');
    const closeQuizModalBtn = document.getElementById('closeQuizModalBtn');
    const cancelQuizModalBtn = document.getElementById('cancelQuizModalBtn');
    const startCustomQuizBtn = document.getElementById('startCustomQuizBtn');
    const startQuizBtnText = document.getElementById('startQuizBtnText');
    const quizTargetFileName = document.getElementById('quizTargetFileName');
    const quizPillBtns = document.querySelectorAll('.quiz-pill-btn');
    const diffCardBtns = document.querySelectorAll('.diff-card-btn');

    // DOM Elements - Phase 3: Progress Dashboard
    const myProgressBtn = document.getElementById('myProgressBtn');
    const quizViewProgressBtn = document.getElementById('quizViewProgressBtn');
    const progressSection = document.getElementById('progressSection');
    const backFromProgressBtn = document.getElementById('backFromProgressBtn');
    const progressQuickQuizBtn = document.getElementById('progressQuickQuizBtn');
    const gamerRankBanner = document.getElementById('gamerRankBanner');
    const rankBadgeOrb = document.getElementById('rankBadgeOrb');
    const rankBadgeEmoji = document.getElementById('rankBadgeEmoji');
    const rankTierPill = document.getElementById('rankTierPill');
    const rankTitle = document.getElementById('rankTitle');
    const rankDesc = document.getElementById('rankDesc');
    const rankAvgScoreDisplay = document.getElementById('rankAvgScoreDisplay');
    const nextRankLabel = document.getElementById('nextRankLabel');
    const rankProgressBar = document.getElementById('rankProgressBar');
    const rankProgressFill = document.getElementById('rankProgressFill');
    const tierStepBeginner = document.getElementById('tierStepBeginner');
    const tierStepLearner = document.getElementById('tierStepLearner');
    const tierStepScholar = document.getElementById('tierStepScholar');
    const tierStepMaster = document.getElementById('tierStepMaster');
    const tierStepImpossible = document.getElementById('tierStepImpossible');

    const statCardTotalQuizzes = document.getElementById('statCardTotalQuizzes');
    const statCardAverageScore = document.getElementById('statCardAverageScore');
    const statCardBestScore = document.getElementById('statCardBestScore');
    const statCardBestScoreSub = document.getElementById('statCardBestScoreSub');
    const statCardTotalQuestions = document.getElementById('statCardTotalQuestions');
    const statCardCorrectRatio = document.getElementById('statCardCorrectRatio');
    const statCardOverallAccuracy = document.getElementById('statCardOverallAccuracy');

    const chartTypeLineBtn = document.getElementById('chartTypeLineBtn');
    const chartTypeBarBtn = document.getElementById('chartTypeBarBtn');
    const scoreTrendChartCanvas = document.getElementById('scoreTrendChartCanvas');
    const chartEmptyState = document.getElementById('chartEmptyState');

    const historyCountBadge = document.getElementById('historyCountBadge');
    const quizHistoryTable = document.getElementById('quizHistoryTable');
    const quizHistoryTableBody = document.getElementById('quizHistoryTableBody');
    const historyEmptyState = document.getElementById('historyEmptyState');
    const historyStartQuizBtn = document.getElementById('historyStartQuizBtn');

    // DOM Elements - Restart Progress Modal & Alert
    const restartProgressBtn = document.getElementById('restartProgressBtn');
    const restartConfirmModal = document.getElementById('restartConfirmModal');
    const restartModalBackdrop = document.getElementById('restartModalBackdrop');
    const closeRestartModalBtn = document.getElementById('closeRestartModalBtn');
    const cancelRestartModalBtn = document.getElementById('cancelRestartModalBtn');
    const confirmRestartBtn = document.getElementById('confirmRestartBtn');
    const progressResetAlert = document.getElementById('progressResetAlert');
    const dismissResetAlertBtn = document.getElementById('dismissResetAlertBtn');
    let resetAlertTimeout = null;

    // DOM Elements - Phase 4: Word Help
    const wordHelpTriggerBtn = document.getElementById('wordHelpTriggerBtn');
    const resultsWordHelpBtn = document.getElementById('resultsWordHelpBtn');
    const wordHelpModal = document.getElementById('wordHelpModal');
    const wordHelpModalBackdrop = document.getElementById('wordHelpModalBackdrop');
    const closeWordHelpModalBtn = document.getElementById('closeWordHelpModalBtn');
    const cancelWordHelpModalBtn = document.getElementById('cancelWordHelpModalBtn');
    const wordHelpTargetFileName = document.getElementById('wordHelpTargetFileName');
    const wordHelpForm = document.getElementById('wordHelpForm');
    const wordHelpInput = document.getElementById('wordHelpInput');
    const wordHelpClearBtn = document.getElementById('wordHelpClearBtn');
    const wordHelpSubmitBtn = document.getElementById('wordHelpSubmitBtn');
    const wordHelpAlert = document.getElementById('wordHelpAlert');
    const wordHelpAlertMsg = document.getElementById('wordHelpAlertMsg');
    const wordHelpLoading = document.getElementById('wordHelpLoading');
    const wordHelpResult = document.getElementById('wordHelpResult');
    const wordHelpResultTerm = document.getElementById('wordHelpResultTerm');
    const wordHelpAnswerBody = document.getElementById('wordHelpAnswerBody');
    const closeWordHelpResultBtn = document.getElementById('closeWordHelpResultBtn');

    // Progress Dashboard State
    let progressChartInstance = null;
    let currentChartType = 'line';
    let previousViewBeforeProgress = 'upload';
    let cachedQuizHistory = [];

    // Application State
    let selectedFile = null;
    let summariesData = null;
    let currentMode = 'easy';
    let statusInterval = null;
    let pendingAction = null;

    // Quiz State & Decision Options
    let selectedNumQuestions = null;
    let selectedDifficulty = null;
    let activeQuizDifficulty = 'medium';
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let quizScore = 0;
    let timerSeconds = 30;
    let timerInterval = null;
    let isQuestionAnswered = false;

    // Helper: format file size
    function formatBytes(bytes, decimals = 1) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // Helper: Safely parse JSON from API response, validating status & content-type
    async function safeParseJsonResponse(response, actionDescription = 'request') {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.toLowerCase().includes('application/json');

        if (!isJson) {
            let errorDetails = '';
            try {
                const text = await response.text();
                // Strip HTML tags to extract readable snippet if present
                const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                errorDetails = cleanText.slice(0, 160);
            } catch (e) {
                errorDetails = '';
            }

            if (response.status === 504 || response.status === 502) {
                throw new Error(
                    `Server timeout (${response.status}). The AI model or document processing took too long to respond. Please try again or test with a smaller PDF.`
                );
            }
            if (response.status === 404) {
                throw new Error(`Endpoint not found (404). Please verify your deployment URL and routing.`);
            }
            if (response.status === 500) {
                const detailMsg = errorDetails ? ` (Server message: "${errorDetails}")` : '';
                throw new Error(
                    `Server Error (500).${detailMsg} Please check your hosting dashboard logs and ensure GEMINI_API_KEY is configured in Environment settings.`
                );
            }
            if (response.status === 413) {
                throw new Error(`File size is too large (413). Please upload a PDF under 30MB.`);
            }

            throw new Error(
                `Server returned an HTML error instead of JSON (${response.status}): ${errorDetails || 'Non-JSON response received.'}`
            );
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            throw new Error(`Unable to parse server response as valid JSON: ${jsonErr.message}`);
        }

        if (!response.ok || (data && data.success === false)) {
            const errorMsg = (data && (data.error || data.message)) || `Failed during ${actionDescription}.`;
            if (response.status === 503 || errorMsg.includes('503') || errorMsg.toLowerCase().includes('busy')) {
                throw new Error('The service is busy right now, please try again in a minute.');
            }
            throw new Error(errorMsg);
        }

        return data;
    }

    // Helper: fetch JSON with one automatic retry. The Progress dashboard loads
    // history and stats as two separate requests; without a retry a single
    // transient failure (e.g. brief "database is locked") leaves the stat cards
    // showing data while the chart/history show empty, or vice versa.
    async function fetchJsonWithRetry(url, actionDescription, retries = 1) {
        let lastErr = null;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const r = await fetch(url);
                return await safeParseJsonResponse(r, actionDescription);
            } catch (err) {
                lastErr = err;
                if (attempt < retries) {
                    await new Promise(res => setTimeout(res, 600));
                }
            }
        }
        throw lastErr;
    }

    // File selection handler
    function handleFile(file) {
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showError('Please select a valid PDF document (.pdf).');
            return;
        }

        const maxSize = 30 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('File size exceeds the 30MB limit.');
            return;
        }

        hideError();
        selectedFile = file;
        quizQuestions = []; // Reset cached quiz for new file
        fileNameSpan.textContent = file.name;
        fileSizeSpan.textContent = formatBytes(file.size);

        uploadContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        submitBtn.classList.add('file-ready');
        if (uploadQuizBtn) uploadQuizBtn.classList.add('file-ready');
        hideWordHelpAlert();

        // Execute any action the user clicked prior to picking the file
        if (pendingAction === 'quiz') {
            pendingAction = null;
            setTimeout(() => openQuizConfigModal(), 120);
        } else if (pendingAction === 'summarize') {
            pendingAction = null;
            setTimeout(() => submitBtn.click(), 120);
        }
    }

    // Reset selected file
    function resetFile() {
        selectedFile = null;
        summariesData = null;
        quizQuestions = [];
        pendingAction = null;
        fileInput.value = '';
        uploadContent.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        submitBtn.classList.remove('file-ready');
        if (uploadQuizBtn) uploadQuizBtn.classList.remove('file-ready');
        hideWordHelpAlert();
        if (wordHelpResult) wordHelpResult.classList.add('hidden');
    }

    // Error helpers
    function showError(msg) {
        const friendlyMessage = 'The service is busy right now, please try again in a minute.';
        const msgStr = String(msg || '');
        const isTemporary = (
            msgStr.includes('503') ||
            msgStr.toLowerCase().includes('unavailable') ||
            msgStr.toLowerCase().includes('busy') ||
            msgStr.includes('429') ||
            msgStr.toLowerCase().includes('resource_exhausted') ||
            msgStr.toLowerCase().includes('overloaded') ||
            msgStr.toLowerCase().includes('try again')
        );

        if (isTemporary) {
            errorText.textContent = friendlyMessage;
        } else {
            errorText.textContent = msgStr;
        }
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    dismissErrorBtn.addEventListener('click', hideError);

    // Drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
            handleFile(dt.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFile();
    });

    // Loading status cycling
    const summaryLoadingSteps = [
        'Uploading and analyzing document...',
        'Analyzing document structure and concepts...',
        'Synthesizing Easy Mode for beginners...',
        'Extracting technical deep-dive insights...',
        'Adding analogies and lively fun tone...',
        'Finalizing summaries...'
    ];

    const quizLoadingSteps = [
        'Uploading and analyzing document...',
        'Reading document sections and core topics...',
        'Crafting challenging multiple-choice questions...',
        'Verifying options, correct answers, and explanations...',
        'Finalizing your interactive quiz...'
    ];

    function startLoadingAnimation(title, steps) {
        if (loadingTitle) loadingTitle.textContent = title || 'Analyzing your document...';
        let stepIdx = 0;
        loadingStatus.textContent = steps[0];
        statusInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            loadingStatus.textContent = steps[stepIdx];
        }, 2200);
    }

    function stopLoadingAnimation() {
        if (statusInterval) {
            clearInterval(statusInterval);
            statusInterval = null;
        }
    }

    // Helper: Render LaTeX math in element using KaTeX auto-render
    function renderMath(element) {
        if (!element) return;
        const autoRender = () => {
            if (typeof renderMathInElement === 'function') {
                try {
                    renderMathInElement(element, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\(', right: '\\)', display: false },
                            { left: '\\[', right: '\\]', display: true }
                        ],
                        throwOnError: false,
                        errorColor: '#ef4444'
                    });
                } catch (err) {
                    console.warn('KaTeX auto-render error:', err);
                }
            }
        };

        if (typeof renderMathInElement === 'function') {
            autoRender();
        } else {
            // Fallback retry if CDN script is still downloading
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (typeof renderMathInElement === 'function') {
                    clearInterval(interval);
                    autoRender();
                } else if (attempts > 20) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }

    // Switch summary modes with smooth animation
    function switchMode(mode) {
        if (!summariesData || !summariesData[mode]) return;
        currentMode = mode;

        modeButtons.forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        activeModeBadge.className = `mode-badge ${mode}`;
        if (mode === 'easy') {
            activeModeBadge.textContent = '🌱 Easy Mode (Beginner)';
        } else if (mode === 'deep') {
            activeModeBadge.textContent = '🔬 Deep Mode (Technical)';
        } else if (mode === 'fun') {
            activeModeBadge.textContent = '🚀 Fun Mode (Analogies & Emojis)';
        }

        summaryContent.classList.add('switching');
        setTimeout(() => {
            const markdownText = summariesData[mode] || 'No summary available for this mode.';
            summaryContent.innerHTML = marked.parse(markdownText);
            // Run KaTeX auto-render script so all LaTeX notation converts into formatted math
            renderMath(summaryContent);
            summaryContent.classList.remove('switching');
            summaryContent.classList.add('active');
        }, 200);
    }

    // Submit and Generate Summaries handler
    submitBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            // Give instant glowing pulse to drop zone and prompt user to choose a PDF
            dropZone.classList.remove('pulse-highlight');
            void dropZone.offsetWidth;
            dropZone.classList.add('pulse-highlight');
            setTimeout(() => dropZone.classList.remove('pulse-highlight'), 1200);
            pendingAction = 'summarize';
            fileInput.click();
            return;
        }

        hideError();
        uploadSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        startLoadingAnimation('Analyzing your document...', summaryLoadingSteps);

        const formData = new FormData();
        formData.append('pdf', selectedFile);

        try {
            const response = await fetch('/summarize', {
                method: 'POST',
                body: formData
            });

            const data = await safeParseJsonResponse(response, 'summarizing document');

            summariesData = data.summaries;
            resultDocName.textContent = data.filename || selectedFile.name;

            stopLoadingAnimation();
            loadingSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            switchMode('easy');

        } catch (err) {
            console.error(err);
            stopLoadingAnimation();
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
            showError(err.message || 'An error occurred while communicating with the server.');
        }
    });

    // Mode tab buttons click
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        if (!summariesData || !summariesData[currentMode]) return;
        navigator.clipboard.writeText(summariesData[currentMode]).then(() => {
            copyBtn.classList.add('copied');
            const copyText = copyBtn.querySelector('.copy-text');
            const originalText = copyText.textContent;
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyText.textContent = originalText;
            }, 2000);
        }).catch(() => {
            showError('Unable to copy to clipboard.');
        });
    });

    // Reset and upload another PDF
    newUploadBtn.addEventListener('click', () => {
        resetFile();
        resultsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    });

    if (quizNewUploadBtn) {
        quizNewUploadBtn.addEventListener('click', () => {
            resetFile();
            resultsSection.classList.add('hidden');
            quizSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
        });
    }

    /* ----------------------------------------------------
       QUIZ MODE LOGIC & ANIMATIONS
    ---------------------------------------------------- */

    // Confetti animation helper (with canvas-confetti & fallback)
    function triggerConfetti(isGrandCelebration = false) {
        if (typeof confetti === 'function') {
            if (isGrandCelebration) {
                // Multi-burst celebration for high scores
                const duration = 2500;
                const end = Date.now() + duration;
                (function frame() {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 }
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            } else {
                // Single question correct answer burst
                confetti({
                    particleCount: 45,
                    spread: 60,
                    origin: { y: 0.75 },
                    colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
                });
            }
        }
    }

    // Trigger subtle shake animation on incorrect answer
    function triggerShake() {
        quizActiveCard.classList.remove('shake');
        // Force reflow
        void quizActiveCard.offsetWidth;
        quizActiveCard.classList.add('shake');
        setTimeout(() => {
            quizActiveCard.classList.remove('shake');
        }, 500);
    }

    // Helper: Format Difficulty Badge Display
    function formatDiffBadge(diff) {
        if (diff === 'easy') return '🌱 Easy';
        if (diff === 'hard') return '🔥 Hard';
        return '⚡ Medium';
    }

    // Helper: Update Dynamic Button Label in Customization Modal
    function updateStartQuizButtonLabel() {
        if (!startQuizBtnText) return;
        const num = selectedNumQuestions || 10;
        const diff = selectedDifficulty 
            ? (selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)) 
            : 'Medium';
        if (selectedNumQuestions || selectedDifficulty) {
            startQuizBtnText.textContent = `Start ${num}-Question Quiz (${diff})`;
        } else {
            startQuizBtnText.textContent = 'Start Quiz (10 Questions · Medium)';
        }
    }

    // Open Quiz Customization / Decision Modal
    function openQuizConfigModal() {
        if (!selectedFile) {
            showError('Please select or upload a PDF document first.');
            return;
        }
        hideError();
        if (quizTargetFileName) {
            quizTargetFileName.textContent = selectedFile.name;
        }

        // Sync pill buttons UI state without continuous glow or stuck focus
        quizPillBtns.forEach(btn => {
            const count = parseInt(btn.dataset.questions, 10);
            const isMatch = Boolean(selectedNumQuestions && count === selectedNumQuestions);
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
            btn.classList.remove('glow-pulse');
            btn.blur();
        });

        // Sync difficulty cards UI state without continuous glow or stuck focus
        diffCardBtns.forEach(btn => {
            const diff = btn.dataset.difficulty;
            const isMatch = Boolean(selectedDifficulty && diff === selectedDifficulty);
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
            btn.classList.remove('glow-pulse');
            btn.blur();
        });

        updateStartQuizButtonLabel();
        if (quizConfigModal) {
            quizConfigModal.classList.remove('hidden');
        }
    }

    // Close Quiz Customization Modal
    function closeQuizConfigModal() {
        if (quizConfigModal) {
            quizConfigModal.classList.add('hidden');
        }
    }

    // Generate & Start Quiz with selected count (10, 20, 30, 40, 50) and difficulty (easy, medium, hard)
    async function generateAndStartQuiz(numQuestions = 10, difficulty = 'medium') {
        if (!selectedFile) {
            showError('Please select or upload a PDF document first.');
            return;
        }

        const countToUse = numQuestions || selectedNumQuestions || 10;
        const diffToUse = difficulty || selectedDifficulty || 'medium';

        hideError();
        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        const capDiff = diffToUse.charAt(0).toUpperCase() + diffToUse.slice(1);
        startLoadingAnimation(`Crafting ${countToUse} ${capDiff} Questions...`, quizLoadingSteps);

        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('num_questions', countToUse);
        formData.append('difficulty', diffToUse);

        try {
            const response = await fetch('/quiz/generate', {
                method: 'POST',
                body: formData
            });

            const data = await safeParseJsonResponse(response, 'generating quiz questions');

            if (!Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error('No quiz questions were returned. Please try again.');
            }

            quizQuestions = data.questions;
            activeQuizDifficulty = difficulty;
            stopLoadingAnimation();
            loadingSection.classList.add('hidden');
            startQuizSession();

        } catch (err) {
            console.error(err);
            stopLoadingAnimation();
            loadingSection.classList.add('hidden');
            if (summariesData) {
                resultsSection.classList.remove('hidden');
            } else {
                uploadSection.classList.remove('hidden');
            }
            showError(err.message || 'An error occurred while generating the quiz.');
        }
    }

    // Start Quiz Flow (prompts customization modal)
    function startQuizFlow() {
        openQuizConfigModal();
    }

    // Initialize Quiz Session
    function startQuizSession() {
        quizScore = 0;
        currentQuestionIndex = 0;
        isQuestionAnswered = false;

        quizDocName.textContent = selectedFile ? selectedFile.name : 'document.pdf';
        if (quizDifficultyBadge) {
            quizDifficultyBadge.textContent = formatDiffBadge(activeQuizDifficulty);
            quizDifficultyBadge.className = `quiz-badge difficulty ${activeQuizDifficulty}`;
        }
        quizCompletedCard.classList.add('hidden');
        quizActiveCard.classList.remove('hidden');
        quizSection.classList.remove('hidden');

        renderCurrentQuestion();
    }

    // 30-Second Timer Implementation
    function startTimer(seconds = 30) {
        clearInterval(timerInterval);
        timerSeconds = seconds;
        updateTimerDisplay(timerSeconds);

        quizTimerWrapper.classList.remove('warning', 'danger');

        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay(timerSeconds);

            if (timerSeconds <= 10 && timerSeconds > 5) {
                quizTimerWrapper.classList.add('warning');
            } else if (timerSeconds <= 5) {
                quizTimerWrapper.classList.remove('warning');
                quizTimerWrapper.classList.add('danger');
            }

            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                handleTimeOut();
            }
        }, 1000);
    }

    function updateTimerDisplay(remaining) {
        timerText.textContent = remaining;
        // Stroke dasharray 100 max
        const offset = ((30 - remaining) / 30) * 100;
        timerCircle.setAttribute('stroke-dasharray', `${Math.max(0, 100 - offset)}, 100`);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Render Question
    function renderCurrentQuestion() {
        if (currentQuestionIndex >= quizQuestions.length) {
            finishQuiz();
            return;
        }

        const q = quizQuestions[currentQuestionIndex];
        isQuestionAnswered = false;

        // Update progress indicators
        const progressPct = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
        quizProgressBarFill.style.width = `${progressPct}%`;
        quizQuestionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
        quizScoreCounter.textContent = `Score: ${quizScore} / ${quizQuestions.length}`;
        qTag.textContent = `QUESTION ${currentQuestionIndex + 1}`;

        // Reset UI states
        quizQuestionText.textContent = q.question;
        quizExplanationBox.classList.add('hidden');
        quizExplanationBox.className = 'quiz-explanation-box hidden';
        nextQuestionBtn.classList.add('hidden');

        // Render 4 Options
        quizOptionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        const options = Array.isArray(q.options) ? q.options : [];

        options.forEach((optText, idx) => {
            const letter = letters[idx] || `${idx + 1}`;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-option-btn';
            btn.dataset.option = optText;

            btn.innerHTML = `
                <span class="quiz-option-letter">${letter}</span>
                <span class="quiz-option-text">${optText}</span>
                <span class="quiz-option-icon"></span>
            `;

            btn.addEventListener('click', () => {
                handleOptionClick(btn, optText, q);
            });

            quizOptionsContainer.appendChild(btn);
        });

        // Start 30-second timer for this question
        startTimer(30);

        // Render KaTeX math formulas in question text & options
        renderMath(quizActiveCard);
    }

    // Option Click Handler
    function handleOptionClick(selectedBtn, selectedText, q) {
        if (isQuestionAnswered) return;
        isQuestionAnswered = true;
        stopTimer();

        // Mark the chosen button as selected for highlighting glow
        selectedBtn.classList.add('selected');

        // Disable all option buttons
        const allOptionBtns = quizOptionsContainer.querySelectorAll('.quiz-option-btn');
        allOptionBtns.forEach(btn => btn.classList.add('disabled'));

        const cleanSelected = String(selectedText).trim().toLowerCase();
        const cleanCorrect = String(q.correct_answer).trim().toLowerCase();
        const isCorrect = cleanSelected === cleanCorrect;

        if (isCorrect) {
            quizScore++;
            quizScoreCounter.textContent = `Score: ${quizScore} / ${quizQuestions.length}`;
            selectedBtn.classList.add('correct');
            const icon = selectedBtn.querySelector('.quiz-option-icon');
            if (icon) icon.textContent = '✓';

            // Confetti animation
            triggerConfetti(false);

            // Explanation box (success)
            explanationIcon.textContent = '🎉';
            explanationTitle.textContent = 'Correct Answer!';
            quizExplanationText.textContent = q.explanation || 'Great job! You identified the correct concept directly from the document.';
            quizExplanationBox.className = 'quiz-explanation-box correct';
            quizExplanationBox.classList.remove('hidden');
            renderMath(quizExplanationBox);

        } else {
            // Wrong answer
            selectedBtn.classList.add('wrong');
            const icon = selectedBtn.querySelector('.quiz-option-icon');
            if (icon) icon.textContent = '✗';

            // Subtle shake animation
            triggerShake();

            // Highlight the correct answer option
            allOptionBtns.forEach(btn => {
                if (String(btn.dataset.option).trim().toLowerCase() === cleanCorrect) {
                    btn.classList.add('correct-revealed');
                    const cIcon = btn.querySelector('.quiz-option-icon');
                    if (cIcon) cIcon.textContent = '✓';
                }
            });

            // Explanation box (failure)
            explanationIcon.textContent = '💡';
            explanationTitle.textContent = 'Incorrect';
            quizExplanationText.innerHTML = `<strong>Correct answer:</strong> ${q.correct_answer}<br><br>${q.explanation || ''}`;
            quizExplanationBox.className = 'quiz-explanation-box wrong';
            quizExplanationBox.classList.remove('hidden');
            renderMath(quizExplanationBox);
        }

        // Show Next Button
        const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
        nextBtnText.textContent = isLastQuestion ? 'Finish & See Final Score 🏆' : 'Next Question';
        nextQuestionBtn.classList.remove('hidden');
    }

    // Time's Up Handler
    function handleTimeOut() {
        if (isQuestionAnswered) return;
        isQuestionAnswered = true;

        const q = quizQuestions[currentQuestionIndex];
        const allOptionBtns = quizOptionsContainer.querySelectorAll('.quiz-option-btn');
        allOptionBtns.forEach(btn => btn.classList.add('disabled'));

        triggerShake();

        // Highlight correct answer
        const cleanCorrect = String(q.correct_answer).trim().toLowerCase();
        allOptionBtns.forEach(btn => {
            if (String(btn.dataset.option).trim().toLowerCase() === cleanCorrect) {
                btn.classList.add('correct-revealed');
                const cIcon = btn.querySelector('.quiz-option-icon');
                if (cIcon) cIcon.textContent = '✓';
            }
        });

        explanationIcon.textContent = '⏰';
        explanationTitle.textContent = "Time's Up!";
        quizExplanationText.innerHTML = `You ran out of time for this question.<br><strong>Correct answer:</strong> ${q.correct_answer}<br><br>${q.explanation || ''}`;
        quizExplanationBox.className = 'quiz-explanation-box wrong';
        quizExplanationBox.classList.remove('hidden');
        renderMath(quizExplanationBox);

        const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
        nextBtnText.textContent = isLastQuestion ? 'Finish & See Final Score 🏆' : 'Next Question';
        nextQuestionBtn.classList.remove('hidden');
    }

    // Next Question Button Click
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        renderCurrentQuestion();
    });

    // Finish Quiz & Show Results
    function finishQuiz() {
        stopTimer();
        quizActiveCard.classList.add('hidden');
        quizCompletedCard.classList.remove('hidden');

        const totalQ = quizQuestions.length || 1;
        finalScoreVal.textContent = quizScore;
        if (finalTotalVal) finalTotalVal.textContent = totalQ;
        if (statTotalQuestions) statTotalQuestions.textContent = `${totalQ}`;
        if (statDifficulty) statDifficulty.textContent = activeQuizDifficulty.toUpperCase();

        const accuracyPct = Math.round((quizScore / totalQ) * 100);
        statAccuracy.textContent = `${accuracyPct}%`;
        statCorrect.textContent = `${quizScore}`;

        // Dynamic, fun performance messages based on percentage & difficulty
        let title = '';
        let message = '';
        const capDiff = activeQuizDifficulty.charAt(0).toUpperCase() + activeQuizDifficulty.slice(1);

        if (accuracyPct === 100) {
            title = '🏆 Absolute Perfection!';
            message = `Flawless score! You achieved ${quizScore}/${totalQ} on ${capDiff} mode! You have total mastery of this document's content down to every detail!`;
            triggerConfetti(true);
        } else if (accuracyPct >= 80) {
            title = '🌟 Outstanding Scholar!';
            message = `Phenomenal work! You scored ${quizScore}/${totalQ} on ${capDiff} mode. You grasp the core concepts, arguments, and takeaways with ease!`;
            triggerConfetti(true);
        } else if (accuracyPct >= 60) {
            title = '👏 Solid Understanding!';
            message = `Great effort! You scored ${quizScore}/${totalQ} on ${capDiff} mode. You've got the primary foundations down, with just a couple of nuanced areas to polish.`;
        } else if (accuracyPct >= 40) {
            title = '📚 Fair Effort!';
            message = `A decent try! You scored ${quizScore}/${totalQ} on ${capDiff} mode. A quick re-read of the Deep Mode summary will help lock in the trickier questions.`;
        } else {
            title = '🌱 Keep Going!';
            message = `Every quiz is a step forward! You scored ${quizScore}/${totalQ}. Review the summary and give it another shot — you've got this!`;
        }

        finalResultTitle.textContent = title;
        finalResultMsg.textContent = message;
        renderMath(quizCompletedCard);

        // Automatically persist quiz result to SQLite / JSON
        saveQuizResultToDatabase(quizScore, totalQ, accuracyPct, `${title} - ${message}`, activeQuizDifficulty);
    }

    // Save Quiz Result Endpoint
    async function saveQuizResultToDatabase(score, total, percentage, performanceMessage, difficulty = 'medium') {
        try {
            const res = await fetch('/quiz/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdf_name: selectedFile ? selectedFile.name : 'document.pdf',
                    score: score,
                    total: total,
                    percentage: percentage,
                    difficulty: difficulty,
                    performance_message: performanceMessage,
                    created_at: new Date().toLocaleString()
                })
            });
            await safeParseJsonResponse(res, 'saving quiz result');
        } catch (err) {
            console.warn('Failed to save quiz result to database:', err);
        }
    }

    // Retake Quiz (retries same set of questions)
    retakeQuizBtn.addEventListener('click', () => {
        startQuizSession();
    });

    // Exit Quiz / Back to Summaries
    function exitQuiz() {
        stopTimer();
        quizSection.classList.add('hidden');
        if (summariesData) {
            resultsSection.classList.remove('hidden');
        } else {
            uploadSection.classList.remove('hidden');
        }
    }

    exitQuizBtn.addEventListener('click', exitQuiz);
    backToSummariesBtn.addEventListener('click', exitQuiz);

    // ========================================================
    // QUIZ CONFIGURATION / DECISION MODAL EVENT LISTENERS
    // ========================================================
    if (closeQuizModalBtn) closeQuizModalBtn.addEventListener('click', closeQuizConfigModal);
    if (cancelQuizModalBtn) cancelQuizModalBtn.addEventListener('click', closeQuizConfigModal);

    if (quizConfigModal) {
        quizConfigModal.addEventListener('click', (e) => {
            if (e.target === quizConfigModal || e.target.id === 'quizModalBackdrop' || e.target.classList.contains('quiz-modal-backdrop') || e.target.classList.contains('quiz-modal-dialog')) {
                closeQuizConfigModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quizConfigModal && !quizConfigModal.classList.contains('hidden')) {
            closeQuizConfigModal();
        }
    });

    // Question Count Pills (10, 20, 30, 40, 50) - smoothly toggle active state & blur button
    quizPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.questions, 10);
            if (count) {
                selectedNumQuestions = count;
                quizPillBtns.forEach(b => {
                    b.classList.remove('active', 'glow-pulse');
                    b.setAttribute('aria-checked', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
                updateStartQuizButtonLabel();
                // Remove stuck hover/focus effect immediately after click
                btn.blur();
            }
        });
    });

    // Difficulty Option Cards (Easy, Medium, Hard) - smoothly toggle active state & blur button
    diffCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const diff = btn.dataset.difficulty;
            if (diff) {
                selectedDifficulty = diff;
                diffCardBtns.forEach(b => {
                    b.classList.remove('active', 'glow-pulse');
                    b.setAttribute('aria-checked', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
                updateStartQuizButtonLabel();
                // Remove stuck hover/focus effect immediately after click
                btn.blur();
            }
        });
    });

    // Start Custom Quiz button from modal
    if (startCustomQuizBtn) {
        startCustomQuizBtn.addEventListener('click', () => {
            const count = selectedNumQuestions || 10;
            const diff = selectedDifficulty || 'medium';
            closeQuizConfigModal();
            generateAndStartQuiz(count, diff);
        });
    }

    // Change Settings button on completed card
    if (changeQuizSettingsBtn) {
        changeQuizSettingsBtn.addEventListener('click', () => {
            openQuizConfigModal();
        });
    }

    // Event Listeners for Launching Quiz (opens Decision Modal)
    if (uploadQuizBtn) {
        uploadQuizBtn.addEventListener('click', () => {
            if (!selectedFile) {
                // Give instant glowing pulse to drop zone and open file picker
                dropZone.classList.remove('pulse-highlight');
                void dropZone.offsetWidth;
                dropZone.classList.add('pulse-highlight');
                setTimeout(() => dropZone.classList.remove('pulse-highlight'), 1200);
                pendingAction = 'quiz';
                fileInput.click();
                return;
            }
            openQuizConfigModal();
        });
    }
    if (resultsQuizBtn) resultsQuizBtn.addEventListener('click', openQuizConfigModal);
    if (summaryQuizCtaBtn) summaryQuizCtaBtn.addEventListener('click', openQuizConfigModal);

    // ========================================================
    // DYNAMIC SELECTION GLOW EFFECT FOR ALL BUTTONS & OPTIONS
    // ========================================================
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button, .quiz-option-btn, .mode-btn');
        if (targetBtn && !targetBtn.classList.contains('quiz-pill-btn') && !targetBtn.classList.contains('diff-card-btn')) {
            targetBtn.classList.remove('glow-pulse');
            void targetBtn.offsetWidth; // Force reflow to re-trigger glow pulse animation
            targetBtn.classList.add('glow-pulse');
            setTimeout(() => {
                targetBtn.classList.remove('glow-pulse');
            }, 600);
        }
    });

    // ========================================================
    // REACT BITS: DOTGRID INTERACTIVE CANVAS ENGINE
    // ========================================================
    function initDotGrid(canvas, wrapper, options = {}) {
        if (!canvas || !wrapper) return null;

        const config = {
            dotSize: options.dotSize ?? 10,
            gap: options.gap ?? 22,
            baseColor: options.baseColor ?? '#251642',
            activeColor: options.activeColor ?? '#c084fc',
            proximity: options.proximity ?? 130,
            speedTrigger: options.speedTrigger ?? 100,
            shockRadius: options.shockRadius ?? 250,
            shockStrength: options.shockStrength ?? 5,
            maxSpeed: options.maxSpeed ?? 5000,
            resistance: options.resistance ?? 750,
            returnDuration: options.returnDuration ?? 1.5,
            ...options
        };

        function hexToRgb(hex) {
            const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (!m) return { r: 82, g: 39, b: 255 };
            return {
                r: parseInt(m[1], 16),
                g: parseInt(m[2], 16),
                b: parseInt(m[3], 16)
            };
        }

        let baseRgb = hexToRgb(config.baseColor);
        let activeRgb = hexToRgb(config.activeColor);

        let circlePath = null;
        if (typeof window !== 'undefined' && window.Path2D) {
            circlePath = new Path2D();
            circlePath.arc(0, 0, config.dotSize / 2, 0, Math.PI * 2);
        }

        let dots = [];
        const pointer = {
            x: -9999,
            y: -9999,
            vx: 0,
            vy: 0,
            speed: 0,
            lastTime: 0,
            lastX: 0,
            lastY: 0
        };

        function buildGrid() {
            const width = wrapper.clientWidth || window.innerWidth;
            const height = wrapper.clientHeight || window.innerHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);

            const cell = config.dotSize + config.gap;
            const cols = Math.floor((width + config.gap) / cell);
            const rows = Math.floor((height + config.gap) / cell);

            const gridW = cell * cols - config.gap;
            const gridH = cell * rows - config.gap;

            const extraX = width - gridW;
            const extraY = height - gridH;

            const startX = extraX / 2 + config.dotSize / 2;
            const startY = extraY / 2 + config.dotSize / 2;

            dots = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const cx = startX + x * cell;
                    const cy = startY + y * cell;
                    dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
                }
            }
        }

        let rafId;
        const proxSq = config.proximity * config.proximity;

        function draw() {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const px = pointer.x;
            const py = pointer.y;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                const ox = dot.cx + dot.xOffset;
                const oy = dot.cy + dot.yOffset;
                const dx = dot.cx - px;
                const dy = dot.cy - py;
                const dsq = dx * dx + dy * dy;

                let fill = config.baseColor;
                if (dsq <= proxSq) {
                    const dist = Math.sqrt(dsq);
                    const t = 1 - dist / config.proximity;
                    const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
                    const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
                    const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
                    fill = `rgb(${r},${g},${b})`;
                }

                ctx.save();
                ctx.translate(ox, oy);
                ctx.fillStyle = fill;
                if (circlePath) {
                    ctx.fill(circlePath);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, config.dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            rafId = requestAnimationFrame(draw);
        }

        function applyMotion(dot, pushX, pushY) {
            dot._inertiaApplied = true;
            if (window.gsap) {
                gsap.killTweensOf(dot);
                gsap.to(dot, {
                    xOffset: pushX * 0.45,
                    yOffset: pushY * 0.45,
                    duration: 0.2,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.to(dot, {
                            xOffset: 0,
                            yOffset: 0,
                            duration: config.returnDuration,
                            ease: 'elastic.out(1, 0.75)',
                            onComplete: () => {
                                dot._inertiaApplied = false;
                            }
                        });
                    }
                });
            } else {
                dot._inertiaApplied = false;
            }
        }

        function onMouseMove(e) {
            const now = performance.now();
            const dt = pointer.lastTime ? now - pointer.lastTime : 16;
            const dx = e.clientX - pointer.lastX;
            const dy = e.clientY - pointer.lastY;
            let vx = (dx / dt) * 1000;
            let vy = (dy / dt) * 1000;
            let speed = Math.hypot(vx, vy);
            if (speed > config.maxSpeed) {
                const scale = config.maxSpeed / speed;
                vx *= scale;
                vy *= scale;
                speed = config.maxSpeed;
            }
            pointer.lastTime = now;
            pointer.lastX = e.clientX;
            pointer.lastY = e.clientY;
            pointer.vx = vx;
            pointer.vy = vy;
            pointer.speed = speed;

            const rect = canvas.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;

            if (speed > config.speedTrigger) {
                for (let i = 0; i < dots.length; i++) {
                    const dot = dots[i];
                    const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);
                    if (dist < config.proximity && !dot._inertiaApplied) {
                        const pushX = dot.cx - pointer.x + vx * 0.005;
                        const pushY = dot.cy - pointer.y + vy * 0.005;
                        applyMotion(dot, pushX, pushY);
                    }
                }
            }
        }

        function onClick(e) {
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
                if (dist < config.shockRadius && !dot._inertiaApplied) {
                    const falloff = Math.max(0, 1 - dist / config.shockRadius);
                    const pushX = (dot.cx - cx) * config.shockStrength * falloff;
                    const pushY = (dot.cy - cy) * config.shockStrength * falloff;
                    applyMotion(dot, pushX, pushY);
                }
            }
        }

        buildGrid();
        draw();

        let ro = null;
        if ('ResizeObserver' in window) {
            ro = new ResizeObserver(buildGrid);
            ro.observe(wrapper);
        } else {
            window.addEventListener('resize', buildGrid);
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('click', onClick);

        return {
            setColors(base, active) {
                config.baseColor = base;
                config.activeColor = active;
                baseRgb = hexToRgb(base);
                activeRgb = hexToRgb(active);
            },
            destroy() {
                cancelAnimationFrame(rafId);
                if (ro) ro.disconnect();
                window.removeEventListener('resize', buildGrid);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('click', onClick);
            }
        };
    }

    // Initialize React Bits DotGrid interactive background instance
    const dotGridWrapper = document.getElementById('dotGridBackground');
    const dotGridCanvas = document.getElementById('dotGridCanvas');
    let dotGridInstance = null;

    if (dotGridWrapper && dotGridCanvas) {
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        dotGridInstance = initDotGrid(dotGridCanvas, dotGridWrapper, {
            dotSize: 10,
            gap: 22,
            baseColor: initialTheme === 'dark' ? '#251642' : '#e0d5f5',
            activeColor: initialTheme === 'dark' ? '#c084fc' : '#7c3aed',
            proximity: 130,
            shockRadius: 240,
            shockStrength: 5,
            resistance: 750,
            returnDuration: 1.5
        });
    }

    // ========================================================
    // THEME SWITCHER (DARK / LIGHT MODE - UIVERSE GALAHHAD SWITCH)
    // ========================================================
    const themeSwitchCheckbox = document.getElementById('themeSwitchCheckbox');
    const themeSwitchLabel = document.getElementById('themeSwitchLabel');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleLabel = document.getElementById('themeToggleLabel');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('studysnap-theme', theme);
        
        // Sync Uiverse day/night checkbox (checked = dark/night mode, unchecked = light/day mode)
        if (themeSwitchCheckbox) {
            themeSwitchCheckbox.checked = (theme === 'dark');
        }
        if (themeSwitchLabel) {
            const nextMode = theme === 'dark' ? 'Light' : 'Dark';
            themeSwitchLabel.setAttribute('title', `Switch to ${nextMode} mode`);
            themeSwitchLabel.setAttribute('aria-label', `Switch to ${nextMode} mode`);
        }

        if (themeToggleLabel) {
            themeToggleLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        if (themeToggleBtn) {
            const nextMode = theme === 'dark' ? 'light' : 'dark';
            themeToggleBtn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
            themeToggleBtn.setAttribute('title', `Switch to ${nextMode} mode`);
        }
        if (dotGridInstance) {
            if (theme === 'dark') {
                dotGridInstance.setColors('#251642', '#c084fc');
            } else {
                dotGridInstance.setColors('#e0d5f5', '#7c3aed');
            }
        }
    }

    // Initialize theme from saved preference or default to dark
    const savedTheme = localStorage.getItem('studysnap-theme') || 'dark';
    applyTheme(savedTheme);

    // Event listener for Uiverse animated theme switch
    if (themeSwitchCheckbox) {
        themeSwitchCheckbox.addEventListener('change', () => {
            const newTheme = themeSwitchCheckbox.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            if (progressSection && !progressSection.classList.contains('hidden') && cachedQuizHistory.length > 0) {
                renderScoreTrendChart(cachedQuizHistory, currentChartType);
            }
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            if (progressSection && !progressSection.classList.contains('hidden') && cachedQuizHistory.length > 0) {
                renderScoreTrendChart(cachedQuizHistory, currentChartType);
            }
        });
    }

    // ========================================================
    // PHASE 3: PROGRESS DASHBOARD & GAMER STATS LOGIC
    // ========================================================

    // Format quiz date timestamp
    function formatQuizDate(dateStr) {
        if (!dateStr) return 'Recently';
        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            // fallback
        }
        return dateStr;
    }

    // Get score badge styling class based on percentage
    function getScoreBadgeClass(pct) {
        if (pct >= 80) return 'score-master';
        if (pct >= 60) return 'score-scholar';
        if (pct >= 40) return 'score-learner';
        return 'score-beginner';
    }

    // Helpers: swap an empty-state panel to an error message and back.
    // Original heading/body/icon are cached on first use so a later successful
    // load restores the default text instead of keeping a stale error.
    function setPanelMessage(panel, iconText, headingText, bodyText) {
        if (!panel) return;
        if (iconText === null && headingText === null && bodyText === null) return;
        const iconEl = panel.querySelector('.history-empty-icon, .empty-icon');
        const headEl = panel.querySelector('h4');
        const bodyEl = panel.querySelector('p');
        // Cache originals as text (never replace innerHTML: the history empty
        // state contains the Start Quiz button with a live event listener).
        if (iconEl) {
            if (panel.dataset.origIcon === undefined) panel.dataset.origIcon = iconEl.textContent;
            if (iconText) iconEl.textContent = iconText;
        }
        if (headEl) {
            if (panel.dataset.origHead === undefined) panel.dataset.origHead = headEl.textContent;
            if (headingText) headEl.textContent = headingText;
        }
        if (bodyEl) {
            if (panel.dataset.origBody === undefined) panel.dataset.origBody = bodyEl.textContent;
            if (bodyText) bodyEl.textContent = bodyText;
        }
    }

    function restorePanelMessage(panel) {
        if (!panel) return;
        const iconEl = panel.querySelector('.history-empty-icon, .empty-icon');
        const headEl = panel.querySelector('h4');
        const bodyEl = panel.querySelector('p');
        if (iconEl && panel.dataset.origIcon !== undefined) iconEl.textContent = panel.dataset.origIcon;
        if (headEl && panel.dataset.origHead !== undefined) headEl.textContent = panel.dataset.origHead;
        if (bodyEl && panel.dataset.origBody !== undefined) bodyEl.textContent = panel.dataset.origBody;
        delete panel.dataset.origIcon;
        delete panel.dataset.origHead;
        delete panel.dataset.origBody;
    }

    // Render Quiz History Table (Newest first). loadError, when provided, is
    // shown in the empty state instead of silently displaying "no quizzes".
    function renderQuizHistoryTable(historyItems, loadError = null) {
        if (!quizHistoryTableBody) return;
        quizHistoryTableBody.innerHTML = '';

        if (!historyItems || historyItems.length === 0) {
            if (historyEmptyState) {
                setPanelMessage(
                    historyEmptyState,
                    loadError ? '⚠️' : null,
                    loadError ? "Couldn't Load History" : null,
                    loadError ? `History failed to load (${loadError}). Reopen My Progress to retry — your saved quizzes are not lost.` : null
                );
                historyEmptyState.classList.remove('hidden');
            }
            if (quizHistoryTable) quizHistoryTable.classList.add('hidden');
            if (historyCountBadge) historyCountBadge.textContent = loadError ? 'load failed' : '0 attempts';
            return;
        }

        if (historyEmptyState) {
            restorePanelMessage(historyEmptyState);
            historyEmptyState.classList.add('hidden');
        }
        if (quizHistoryTable) quizHistoryTable.classList.remove('hidden');
        if (historyCountBadge) historyCountBadge.textContent = `${historyItems.length} attempt${historyItems.length === 1 ? '' : 's'}`;

        historyItems.forEach(item => {
            if (!item) return;
            const tr = document.createElement('tr');
            const diff = String(item.difficulty || 'medium').toLowerCase();
            const diffIcon = diff === 'easy' ? '🌱' : diff === 'hard' ? '🔥' : '⚡';
            const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
            const scorePct = Math.round(parseFloat(item.percentage) || 0);
            const scoreClass = getScoreBadgeClass(scorePct);
            const formattedDate = formatQuizDate(item.created_at);

            tr.innerHTML = `
                <td class="td-date history-date">${formattedDate}</td>
                <td class="td-doc">
                    <div class="history-doc-wrap" title="${item.pdf_name || 'document.pdf'}">
                        <span class="history-doc-icon">📄</span>
                        <span class="history-doc-text">${item.pdf_name || 'document.pdf'}</span>
                    </div>
                </td>
                <td class="td-questions">
                    <span class="history-pill-questions">${item.total || 10} Qs</span>
                </td>
                <td class="td-difficulty">
                    <span class="badge-diff ${diff}">${diffIcon} ${diffLabel}</span>
                </td>
                <td class="td-score">
                    <span class="badge-score ${scoreClass}">
                        <span class="score-fraction">${item.score}/${item.total}</span>
                        <small class="score-pct-small">(${scorePct}%)</small>
                    </span>
                </td>
            `;
            quizHistoryTableBody.appendChild(tr);
        });
    }

    // Update Gamer Rank Banner & Animated Progress Bar to next level
    function updateRankBanner(stats) {
        if (!gamerRankBanner) return;

        const avg = typeof stats.average_score === 'number' ? stats.average_score : (parseFloat(stats.average_score) || 0);

        // Clamped average score between 0% and 100% for the progress meter
        const fillPercentage = Math.min(100, Math.max(0, avg));

        // Level badge system:
        // Beginner (<40%), Learner (40-60%), Scholar (60-80%), Master (80%+)
        let levelTitle = 'Beginner';
        let levelEmoji = '🌱';
        let tierPillText = 'TIER 1';
        let tierDesc = 'Starting your knowledge journey and building core foundational concepts.';
        let nextRankMsg = '';

        if (avg < 40) {
            levelTitle = 'Beginner';
            levelEmoji = '🌱';
            tierPillText = 'TIER 1';
            tierDesc = 'Starting your knowledge journey and building core foundational concepts.';
            nextRankMsg = `${(40 - avg).toFixed(1)}% to unlock Learner ⚡`;
        } else if (avg < 60) {
            levelTitle = 'Learner';
            levelEmoji = '⚡';
            tierPillText = 'TIER 2';
            tierDesc = 'Building strong conceptual understanding and practical comprehension.';
            nextRankMsg = `${(60 - avg).toFixed(1)}% to unlock Scholar 🔮`;
        } else if (avg < 80) {
            levelTitle = 'Scholar';
            levelEmoji = '🔮';
            tierPillText = 'TIER 3';
            tierDesc = 'Mastering complex technical nuances and analytical reasoning.';
            nextRankMsg = `${(80 - avg).toFixed(1)}% to unlock Master 👑`;
        } else if (avg < 100) {
            levelTitle = 'Master';
            levelEmoji = '👑';
            tierPillText = 'TIER 4';
            tierDesc = 'Apex Grandmaster! Exceptional retention and complete document mastery.';
            nextRankMsg = `${(100 - avg).toFixed(1)}% to unlock Impossible ♾️`;
        } else {
            levelTitle = 'Impossible';
            levelEmoji = '♾️';
            tierPillText = 'TIER 5';
            tierDesc = 'Transcendental Perfection! Flawless 100% accuracy — truly impossible mastery achieved!';
            nextRankMsg = 'MAX RANK UNLOCKED · Flawless Impossible Godlike! ♾️';
        }

        if (rankBadgeEmoji) rankBadgeEmoji.textContent = levelEmoji;
        if (rankTitle) rankTitle.textContent = levelTitle;
        if (rankTierPill) rankTierPill.textContent = tierPillText;
        if (rankDesc) rankDesc.textContent = tierDesc;
        if (rankAvgScoreDisplay) rankAvgScoreDisplay.textContent = `${avg.toFixed(1)}%`;
        if (nextRankLabel) nextRankLabel.textContent = nextRankMsg;

        if (rankProgressBar) {
            rankProgressBar.setAttribute('aria-valuenow', Math.round(fillPercentage));
        }
        if (rankProgressFill) {
            // Directly bind fill width to average score with smooth transition
            rankProgressFill.style.width = `${fillPercentage.toFixed(1)}%`;
        }

        // Highlight passed ticks on the 0-100 numeric scale
        const scaleTicks = gamerRankBanner.querySelectorAll('.scale-tick');
        scaleTicks.forEach(tick => {
            const val = parseFloat(tick.dataset.val);
            if (!isNaN(val)) {
                if (val <= fillPercentage) {
                    tick.classList.add('passed');
                } else {
                    tick.classList.remove('passed');
                }
            }
        });

        // Update active milestone step in the tier zones legend
        const tiers = ['beginner', 'learner', 'scholar', 'master', 'impossible'];
        const currentTierIndex = tiers.indexOf(levelTitle.toLowerCase());
        const stepEls = [tierStepBeginner, tierStepLearner, tierStepScholar, tierStepMaster, tierStepImpossible];

        stepEls.forEach((el, idx) => {
            if (!el) return;
            el.classList.remove('active-tier', 'completed-tier');
            if (idx === currentTierIndex) {
                el.classList.add('active-tier');
            } else if (idx < currentTierIndex) {
                el.classList.add('completed-tier');
            }
        });
    }

    // Update 5 Stats Overview Cards
    function updateStatsCards(stats, historyItems) {
        const totalQuizzes = stats.total_quizzes !== undefined ? stats.total_quizzes : historyItems.length;
        const avgScore = typeof stats.average_score === 'number' ? stats.average_score : (parseFloat(stats.average_score) || 0);
        const bestScore = stats.best_score || '0%';
        const totalQuestions = stats.total_questions !== undefined ? stats.total_questions : 0;
        const totalCorrect = stats.total_correct !== undefined ? stats.total_correct : 0;
        const overallAccuracy = typeof stats.overall_accuracy === 'number' ? stats.overall_accuracy : (parseFloat(stats.overall_accuracy) || 0);

        if (statCardTotalQuizzes) statCardTotalQuizzes.textContent = totalQuizzes;
        if (statCardAverageScore) statCardAverageScore.textContent = `${avgScore.toFixed(1)}%`;
        if (statCardBestScore) statCardBestScore.textContent = bestScore;
        if (statCardTotalQuestions) statCardTotalQuestions.textContent = totalQuestions;
        if (statCardCorrectRatio) statCardCorrectRatio.textContent = `${totalCorrect} correct answers`;
        if (statCardOverallAccuracy) statCardOverallAccuracy.textContent = `${overallAccuracy.toFixed(1)}%`;
    }

    // Render Score Trend Chart using Chart.js. loadError, when provided, is
    // shown in the chart panel instead of leaving it silently blank.
    function renderScoreTrendChart(historyItems, chartType = 'line', loadError = null) {
        if (!scoreTrendChartCanvas) return;
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library is not available.');
            if (chartEmptyState) {
                setPanelMessage(
                    chartEmptyState,
                    '⚠️',
                    null,
                    'Chart library failed to load (check connection or ad-blocker). Your stats and history below are unaffected — reload to retry.'
                );
                chartEmptyState.classList.remove('hidden');
            }
            scoreTrendChartCanvas.classList.add('hidden');
            return;
        }

        if (progressChartInstance) {
            progressChartInstance.destroy();
            progressChartInstance = null;
        }

        if (!historyItems || historyItems.length === 0) {
            if (chartEmptyState) {
                if (loadError) {
                    setPanelMessage(
                        chartEmptyState,
                        '⚠️',
                        null,
                        `Trend data failed to load (${loadError}). Reopen My Progress to retry — your saved quizzes are not lost.`
                    );
                } else {
                    restorePanelMessage(chartEmptyState);
                }
                chartEmptyState.classList.remove('hidden');
            }
            scoreTrendChartCanvas.classList.add('hidden');
            return;
        }

        if (chartEmptyState) {
            restorePanelMessage(chartEmptyState);
            chartEmptyState.classList.add('hidden');
        }
        scoreTrendChartCanvas.classList.remove('hidden');

        // Chronological order: oldest first for score progression over time
        const chronological = [...historyItems].reverse();

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const textColor = isDark ? '#c4b5fd' : '#4c1d95';
        const gridColor = isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(124, 58, 237, 0.1)';
        const tooltipBg = isDark ? 'rgba(20, 13, 38, 0.95)' : 'rgba(255, 255, 255, 0.98)';
        const tooltipText = isDark ? '#f8f6fe' : '#1e1b4b';

        const labels = chronological.map((item, idx) => {
            if (item && item.created_at) {
                const parts = String(item.created_at).split(/[\s,]+/);
                return parts[0] || `Quiz ${idx + 1}`;
            }
            return `Quiz ${idx + 1}`;
        });

        const dataPoints = chronological.map(item => parseFloat(item && item.percentage) || 0);

        const ctx = scoreTrendChartCanvas.getContext('2d');
        let gradientFill = null;
        let gradientStroke = null;

        try {
            const h = Math.max(scoreTrendChartCanvas.clientHeight || 280, 200);
            const w = Math.max(scoreTrendChartCanvas.clientWidth || 400, 300);
            gradientFill = ctx.createLinearGradient(0, 0, 0, h);
            gradientFill.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
            gradientFill.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)');
            gradientFill.addColorStop(1, 'rgba(12, 8, 23, 0.0)');

            gradientStroke = ctx.createLinearGradient(0, 0, w, 0);
            gradientStroke.addColorStop(0, '#a855f7');
            gradientStroke.addColorStop(1, '#06b6d4');
        } catch (e) {
            gradientFill = 'rgba(168, 85, 247, 0.25)';
            gradientStroke = '#a855f7';
        }

        progressChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quiz Score (%)',
                    data: dataPoints,
                    borderColor: gradientStroke || '#a855f7',
                    backgroundColor: chartType === 'line' ? gradientFill : 'rgba(168, 85, 247, 0.65)',
                    borderWidth: 2.5,
                    fill: chartType === 'line',
                    tension: 0.35,
                    pointBackgroundColor: '#22d3ee',
                    pointBorderColor: isDark ? '#0c0817' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: chronological.length > 25 ? 3 : 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#06b6d4',
                    borderRadius: chartType === 'bar' ? 6 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 700,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: tooltipBg,
                        titleColor: tooltipText,
                        bodyColor: textColor,
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                const idx = tooltipItems[0].dataIndex;
                                const item = chronological[idx];
                                return item ? (item.pdf_name || `Quiz Attempt #${idx + 1}`) : 'Quiz Attempt';
                            },
                            label: function(context) {
                                const idx = context.dataIndex;
                                const item = chronological[idx];
                                const diff = item && item.difficulty ? ` · ${String(item.difficulty).toUpperCase()}` : '';
                                return `Score: ${item.score}/${item.total} (${item.percentage}%)${diff}`;
                            },
                            afterLabel: function(context) {
                                const idx = context.dataIndex;
                                const item = chronological[idx];
                                return item && item.created_at ? `Date: ${item.created_at}` : '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                            maxRotation: 45
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                            stepSize: 20,
                            callback: function(val) {
                                return val + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Load and Render Progress Data from SQLite & Backend.
    // Uses the unified /quiz/progress endpoint so stats AND history arrive in ONE atomic response.
    // Falls back gracefully if needed, ensuring stats and history can never get out of sync.
    async function loadAndRenderProgressData() {
        let historyItems = Array.isArray(cachedQuizHistory) ? cachedQuizHistory : [];
        let stats = null;
        let progressErr = null;

        try {
            // Primary: Unified endpoint providing BOTH stats and history in a single atomic DB query
            const res = await fetchJsonWithRetry('/quiz/progress', 'loading quiz progress', 1);
            if (res && res.success) {
                if (res.stats) stats = res.stats;
                if (Array.isArray(res.history)) {
                    historyItems = res.history;
                    cachedQuizHistory = historyItems;
                }
            } else {
                throw new Error((res && res.error) || 'Unsuccessful progress response');
            }
        } catch (err) {
            console.warn('Unified progress fetch failed, trying fallbacks:', err);
            progressErr = (err && err.message) || 'unknown network error';

            // Fallback 1: Try /quiz/stats
            try {
                const statsRes = await fetchJsonWithRetry('/quiz/stats', 'loading quiz statistics', 1);
                if (statsRes && statsRes.success) {
                    if (statsRes.stats) stats = statsRes.stats;
                    if (Array.isArray(statsRes.history)) {
                        historyItems = statsRes.history;
                        cachedQuizHistory = historyItems;
                    }
                }
            } catch (sErr) {
                console.error('Fallback /quiz/stats failed:', sErr);
            }

            // Fallback 2: Try /quiz/history if history not yet obtained
            if (!historyItems || historyItems.length === 0) {
                try {
                    const histRes = await fetchJsonWithRetry('/quiz/history', 'loading quiz history', 1);
                    if (histRes && histRes.success && Array.isArray(histRes.history)) {
                        historyItems = histRes.history;
                        cachedQuizHistory = historyItems;
                    }
                } catch (hErr) {
                    console.error('Fallback /quiz/history failed:', hErr);
                }
            }
        }

        if (!stats) {
            // Client-side fallback calculation if /quiz/stats is unavailable
            const count = historyItems.length;
            const totalQ = historyItems.reduce((acc, r) => acc + (parseInt(r.total, 10) || 10), 0);
            const totalC = historyItems.reduce((acc, r) => acc + (parseInt(r.score, 10) || 0), 0);
            const avg = count > 0 ? (historyItems.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / count) : 0;
            const bestRow = count > 0 ? historyItems.reduce((best, r) => (parseFloat(r.percentage) > parseFloat(best.percentage) ? r : best), historyItems[0]) : null;
            stats = {
                total_quizzes: count,
                average_score: avg,
                best_score: bestRow ? `${bestRow.percentage}% (${bestRow.score}/${bestRow.total})` : '0%',
                total_questions: totalQ,
                total_correct: totalC,
                overall_accuracy: totalQ > 0 ? (totalC / totalQ) * 100 : 0
            };
            if (progressErr && count === 0) {
                console.warn('Showing zeroed stats because both stats and history failed to load.');
            }
        }

        try {
            updateRankBanner(stats);
        } catch (err) {
            console.error('Failed to render rank banner:', err);
        }
        try {
            updateStatsCards(stats, historyItems);
        } catch (err) {
            console.error('Failed to render stats cards:', err);
        }
        try {
            renderScoreTrendChart(historyItems, currentChartType, progressErr);
        } catch (err) {
            console.error('Failed to render score trend chart:', err);
            if (chartEmptyState) {
                setPanelMessage(chartEmptyState, '⚠️', null, 'Chart failed to render. Reopen My Progress to retry.');
                chartEmptyState.classList.remove('hidden');
            }
            if (scoreTrendChartCanvas) scoreTrendChartCanvas.classList.add('hidden');
        }
        try {
            renderQuizHistoryTable(historyItems, progressErr);
        } catch (err) {
            console.error('Failed to render quiz history table:', err);
        }

        // Render any LaTeX math notation present in the history or stats
        try {
            renderMath(progressSection);
        } catch (err) {
            console.error('Failed to render math in progress section:', err);
        }
    }

    // Open Progress Dashboard View
    function openProgressDashboard() {
        if (!quizSection.classList.contains('hidden')) {
            previousViewBeforeProgress = 'quiz';
        } else if (!resultsSection.classList.contains('hidden')) {
            previousViewBeforeProgress = 'results';
        } else {
            previousViewBeforeProgress = 'upload';
        }

        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        progressSection.classList.remove('hidden');

        document.body.classList.add('progress-page-active');
        if (myProgressBtn) myProgressBtn.classList.add('active');

        loadAndRenderProgressData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close Progress Dashboard View & Return to Previous Screen
    function closeProgressDashboard() {
        progressSection.classList.add('hidden');
        document.body.classList.remove('progress-page-active');
        if (myProgressBtn) myProgressBtn.classList.remove('active');

        if (previousViewBeforeProgress === 'results' && summariesData) {
            resultsSection.classList.remove('hidden');
        } else if (previousViewBeforeProgress === 'quiz' && quizQuestions.length > 0) {
            quizSection.classList.remove('hidden');
        } else {
            uploadSection.classList.remove('hidden');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event Listeners for Progress Dashboard
    if (myProgressBtn) {
        myProgressBtn.addEventListener('click', openProgressDashboard);
    }
    if (quizViewProgressBtn) {
        quizViewProgressBtn.addEventListener('click', openProgressDashboard);
    }
    if (backFromProgressBtn) {
        backFromProgressBtn.addEventListener('click', closeProgressDashboard);
    }
    if (progressQuickQuizBtn) {
        progressQuickQuizBtn.addEventListener('click', () => {
            closeProgressDashboard();
            if (selectedFile) {
                openQuizConfigModal();
            } else {
                // Focus drop zone to pick a file
                dropZone.classList.remove('pulse-highlight');
                void dropZone.offsetWidth;
                dropZone.classList.add('pulse-highlight');
                setTimeout(() => dropZone.classList.remove('pulse-highlight'), 1200);
            }
        });
    }
    if (historyStartQuizBtn) {
        historyStartQuizBtn.addEventListener('click', () => {
            closeProgressDashboard();
            if (selectedFile) {
                openQuizConfigModal();
            } else {
                dropZone.classList.remove('pulse-highlight');
                void dropZone.offsetWidth;
                dropZone.classList.add('pulse-highlight');
                setTimeout(() => dropZone.classList.remove('pulse-highlight'), 1200);
            }
        });
    }

    // Chart Type Toggles (Line vs Bar)
    if (chartTypeLineBtn) {
        chartTypeLineBtn.addEventListener('click', () => {
            currentChartType = 'line';
            chartTypeLineBtn.classList.add('active');
            if (chartTypeBarBtn) chartTypeBarBtn.classList.remove('active');
            renderScoreTrendChart(cachedQuizHistory, 'line');
        });
    }
    if (chartTypeBarBtn) {
        chartTypeBarBtn.addEventListener('click', () => {
            currentChartType = 'bar';
            chartTypeBarBtn.classList.add('active');
            if (chartTypeLineBtn) chartTypeLineBtn.classList.remove('active');
            renderScoreTrendChart(cachedQuizHistory, 'bar');
        });
    }

    // ========================================================
    // RESTART PROGRESS DATA & MODAL HANDLERS
    // ========================================================
    function openRestartModal() {
        if (restartConfirmModal) {
            restartConfirmModal.classList.remove('hidden');
        }
    }

    function closeRestartModal() {
        if (restartConfirmModal) {
            restartConfirmModal.classList.add('hidden');
        }
    }

    function showResetSuccessBanner(msg) {
        if (!progressResetAlert) return;
        const msgEl = progressResetAlert.querySelector('.alert-msg');
        if (msgEl && msg) {
            msgEl.textContent = msg;
        }
        progressResetAlert.classList.remove('hidden');
        if (resetAlertTimeout) {
            clearTimeout(resetAlertTimeout);
        }
        resetAlertTimeout = setTimeout(() => {
            progressResetAlert.classList.add('hidden');
        }, 6000);
    }

    async function handleRestartProgress() {
        if (!confirmRestartBtn) return;
        const origContent = confirmRestartBtn.innerHTML;
        try {
            confirmRestartBtn.disabled = true;
            confirmRestartBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Restarting...</span>';

            const res = await fetch('/quiz/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await safeParseJsonResponse(res, 'restarting progress');
            closeRestartModal();
            showResetSuccessBanner(data.message || 'Progress data has been restarted! You can now record fresh quiz attempts from starting.');
            // Instantly re-fetch and render empty stats & clean dashboard
            await loadAndRenderProgressData();
        } catch (err) {
            console.error('Error resetting quiz progress:', err);
            alert(err.message || 'A network error occurred while restarting progress. Please try again.');
        } finally {
            confirmRestartBtn.disabled = false;
            confirmRestartBtn.innerHTML = origContent;
        }
    }

    if (restartProgressBtn) {
        restartProgressBtn.addEventListener('click', openRestartModal);
    }
    if (closeRestartModalBtn) {
        closeRestartModalBtn.addEventListener('click', closeRestartModal);
    }
    if (cancelRestartModalBtn) {
        cancelRestartModalBtn.addEventListener('click', closeRestartModal);
    }
    if (restartModalBackdrop) {
        restartModalBackdrop.addEventListener('click', closeRestartModal);
    }
    if (confirmRestartBtn) {
        confirmRestartBtn.addEventListener('click', handleRestartProgress);
    }
    if (dismissResetAlertBtn && progressResetAlert) {
        dismissResetAlertBtn.addEventListener('click', () => {
            progressResetAlert.classList.add('hidden');
        });
    }

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (wordHelpModal && !wordHelpModal.classList.contains('hidden')) {
                closeWordHelpModal();
            } else if (restartConfirmModal && !restartConfirmModal.classList.contains('hidden')) {
                closeRestartModal();
            } else if (quizConfigModal && !quizConfigModal.classList.contains('hidden')) {
                closeQuizConfigModal();
            }
        }
    });

    // ========================================================
    // PHASE 4: WORD HELP QUICK TERM EXPLAINER LOGIC
    // ========================================================

    function showWordHelpAlert(msg, isDanger = false) {
        if (!wordHelpAlert || !wordHelpAlertMsg) return;
        wordHelpAlertMsg.textContent = msg;
        if (isDanger) {
            wordHelpAlert.classList.add('danger');
        } else {
            wordHelpAlert.classList.remove('danger');
        }
        wordHelpAlert.classList.remove('hidden');
    }

    function hideWordHelpAlert() {
        if (!wordHelpAlert) return;
        wordHelpAlert.classList.add('hidden');
    }

    function displayWordHelpResult(term, explanation, isNotFound) {
        if (!wordHelpResult || !wordHelpAnswerBody || !wordHelpResultTerm) return;
        wordHelpResultTerm.textContent = term;

        if (isNotFound) {
            wordHelpResult.classList.add('not-found');
        } else {
            wordHelpResult.classList.remove('not-found');
        }

        // Format markdown if marked is loaded, otherwise sanitize and format
        let formattedHtml = '';
        if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
            formattedHtml = marked.parse(explanation);
        } else {
            const escaped = explanation
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            formattedHtml = `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
        }

        wordHelpAnswerBody.innerHTML = formattedHtml;

        // Run KaTeX auto-render on the answer card
        renderMath(wordHelpAnswerBody);

        wordHelpResult.classList.remove('hidden');
        wordHelpResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async function handleWordHelp(e) {
        if (e) e.preventDefault();
        const term = wordHelpInput ? wordHelpInput.value.trim() : '';

        // If no PDF is uploaded yet, show 'Please upload a PDF first'
        if (!selectedFile) {
            showWordHelpAlert('Please upload a PDF first');
            return;
        }

        if (!term) {
            showWordHelpAlert('Please enter a word or concept from your PDF to explain');
            if (wordHelpInput) wordHelpInput.focus();
            return;
        }

        hideWordHelpAlert();
        if (wordHelpResult) wordHelpResult.classList.add('hidden');
        if (wordHelpLoading) wordHelpLoading.classList.remove('hidden');

        if (wordHelpSubmitBtn) wordHelpSubmitBtn.disabled = true;
        if (wordHelpInput) wordHelpInput.disabled = true;

        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('term', term);

        try {
            const response = await fetch('/word-help', {
                method: 'POST',
                body: formData
            });

            const data = await safeParseJsonResponse(response, 'explaining term');

            displayWordHelpResult(data.term, data.explanation, data.not_found);

        } catch (err) {
            console.error('Word Help error:', err);
            showWordHelpAlert(err.message || 'An error occurred while fetching explanation.', true);
        } finally {
            if (wordHelpLoading) wordHelpLoading.classList.add('hidden');
            if (wordHelpSubmitBtn) wordHelpSubmitBtn.disabled = false;
            if (wordHelpInput) {
                wordHelpInput.disabled = false;
                wordHelpInput.focus();
            }
        }
    }

    if (wordHelpInput) {
        wordHelpInput.addEventListener('input', () => {
            hideWordHelpAlert();
            if (wordHelpClearBtn) {
                if (wordHelpInput.value.trim().length > 0) {
                    wordHelpClearBtn.classList.remove('hidden');
                } else {
                    wordHelpClearBtn.classList.add('hidden');
                }
            }
        });

        wordHelpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleWordHelp(e);
            }
        });
    }

    if (wordHelpClearBtn && wordHelpInput) {
        wordHelpClearBtn.addEventListener('click', () => {
            wordHelpInput.value = '';
            wordHelpClearBtn.classList.add('hidden');
            hideWordHelpAlert();
            wordHelpInput.focus();
        });
    }

    if (wordHelpForm) {
        wordHelpForm.addEventListener('submit', handleWordHelp);
    }

    if (wordHelpSubmitBtn) {
        wordHelpSubmitBtn.addEventListener('click', handleWordHelp);
    }

    if (closeWordHelpResultBtn && wordHelpResult) {
        closeWordHelpResultBtn.addEventListener('click', () => {
            wordHelpResult.classList.add('hidden');
        });
    }

    // Modal open/close handlers
    function openWordHelpModal() {
        if (wordHelpTargetFileName) {
            wordHelpTargetFileName.textContent = selectedFile ? selectedFile.name : 'No PDF selected yet';
        }
        if (!selectedFile) {
            showWordHelpAlert('Please upload a PDF first');
        } else {
            hideWordHelpAlert();
        }
        if (wordHelpModal) {
            wordHelpModal.classList.remove('hidden');
        }
        if (wordHelpInput) {
            setTimeout(() => {
                wordHelpInput.focus();
            }, 120);
        }
    }

    function closeWordHelpModal() {
        if (wordHelpModal) {
            wordHelpModal.classList.add('hidden');
        }
    }

    if (wordHelpTriggerBtn) {
        wordHelpTriggerBtn.addEventListener('click', openWordHelpModal);
    }
    if (resultsWordHelpBtn) {
        resultsWordHelpBtn.addEventListener('click', openWordHelpModal);
    }
    if (closeWordHelpModalBtn) {
        closeWordHelpModalBtn.addEventListener('click', closeWordHelpModal);
    }
    if (cancelWordHelpModalBtn) {
        cancelWordHelpModalBtn.addEventListener('click', closeWordHelpModal);
    }
    if (wordHelpModalBackdrop) {
        wordHelpModalBackdrop.addEventListener('click', closeWordHelpModal);
    }

    // ========================================================
    // SMALL CIRCULAR FLEXIBLE BLACK CURSOR (UNIFORM & STABLE)
    // ========================================================
    function initBouncyCursor() {
        const bouncyCursor = document.getElementById('bouncyCursor');
        const cursorBall = document.getElementById('cursorBall');

        if (!bouncyCursor || !cursorBall) return;

        // Only activate on devices with fine pointer (mouse / trackpad)
        if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
            return;
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ballX = mouseX;
        let ballY = mouseY;
        let vx = 0;
        let vy = 0;
        let currentAngle = 0;
        let currentStretch = 0;
        let isClicking = false;
        let hasInitialized = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!hasInitialized) {
                // First mouse move: snap ball immediately without initial fly-in
                ballX = mouseX;
                ballY = mouseY;
                hasInitialized = true;
                bouncyCursor.classList.add('visible');
            } else {
                bouncyCursor.classList.add('visible');
            }
        });

        // Click effect: subtle tactile response without altering circle identity
        document.addEventListener('mousedown', () => {
            isClicking = true;
        });

        document.addEventListener('mouseup', () => {
            isClicking = false;
        });

        // Window leave / enter
        document.addEventListener('mouseleave', () => {
            bouncyCursor.classList.remove('visible');
        });

        document.addEventListener('mouseenter', () => {
            bouncyCursor.classList.add('visible');
        });

        // Ultra-Flexible Elastic Spring & Fluid Velocity Animation Loop
        // Circle remains the same uniform circle at all times (no changes on hover or selection)
        function animateCursor() {
            if (hasInitialized) {
                // Organic spring physics: elastic trailing with bounce
                const dx = mouseX - ballX;
                const dy = mouseY - ballY;

                vx += dx * 0.22;
                vy += dy * 0.22;
                vx *= 0.72; // friction creates fluid bounce and flexible trailing
                vy *= 0.72;

                ballX += vx;
                ballY += vy;

                // Speed calculation
                const speed = Math.hypot(vx, vy);

                // Very flexible stretch: dynamically elongates smoothly along velocity vector
                const maxStretch = 1.35;
                const targetStretch = Math.min(speed * 0.065, maxStretch);

                // Elastic stretch smoothing creates realistic rubber trailing/recoil
                currentStretch += (targetStretch - currentStretch) * 0.28;

                // Smooth fluid bending around curves and turns
                if (speed > 0.4) {
                    const targetAngle = Math.atan2(vy, vx);
                    let diff = targetAngle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    currentAngle += diff * 0.28;
                }

                // Volume-preserving flexible deformation
                let scaleX = 1 + currentStretch;
                let scaleY = 1 / Math.sqrt(1 + currentStretch * 1.15);

                // Circle ball stays identical at all times (no changes on click or selection)
                cursorBall.style.transform = `translate3d(${ballX.toFixed(2)}px, ${ballY.toFixed(2)}px, 0) rotate(${currentAngle.toFixed(4)}rad) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
            }

            requestAnimationFrame(animateCursor);
        }

        requestAnimationFrame(animateCursor);
    }

    // Initialize custom cursor
    initBouncyCursor();

    // Proactively verify environment and API key health on startup
    async function checkHealthStatus() {
        try {
            const res = await fetch('/health');
            if (res.ok) {
                const data = await res.json();
                if (data && data.api_key_configured === false) {
                    showError(
                        `⚠️ Notice: GEMINI_API_KEY is not detected. Please add GEMINI_API_KEY in your ${data.platform === 'vercel' ? 'Vercel' : 'Render'} dashboard under Environment variables and rebuild.`
                    );
                }
            }
        } catch (e) {
            // Non-blocking background health check
        }
    }
    checkHealthStatus();
});
