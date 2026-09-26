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

    // Application State
    let selectedFile = null;
    let summariesData = null;
    let currentMode = 'easy';
    let statusInterval = null;
    let pendingAction = null;

    // Quiz State & Decision Options
    let selectedNumQuestions = 10;
    let selectedDifficulty = 'medium';
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

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.error || 'Failed to summarize the document.';
                if (response.status === 503 || errorMsg.includes('503') || errorMsg.toLowerCase().includes('busy')) {
                    throw new Error('The service is busy right now, please try again in a minute.');
                }
                throw new Error(errorMsg);
            }

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
        if (startQuizBtnText) {
            const capDiff = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
            startQuizBtnText.textContent = `Start ${selectedNumQuestions}-Question Quiz (${capDiff})`;
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

        // Sync pill buttons UI state
        quizPillBtns.forEach(btn => {
            const count = parseInt(btn.dataset.questions, 10);
            const isMatch = count === selectedNumQuestions;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        // Sync difficulty cards UI state
        diffCardBtns.forEach(btn => {
            const diff = btn.dataset.difficulty;
            const isMatch = diff === selectedDifficulty;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
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

        hideError();
        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        const capDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        startLoadingAnimation(`Crafting ${numQuestions} ${capDiff} Questions...`, quizLoadingSteps);

        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('num_questions', numQuestions);
        formData.append('difficulty', difficulty);

        try {
            const response = await fetch('/quiz/generate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.error || 'Failed to generate quiz questions.';
                if (response.status === 503 || errorMsg.includes('503') || errorMsg.toLowerCase().includes('busy')) {
                    throw new Error('The service is busy right now, please try again in a minute.');
                }
                throw new Error(errorMsg);
            }

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

        // Automatically persist quiz result to SQLite / JSON
        saveQuizResultToDatabase(quizScore, totalQ, accuracyPct, `${title} - ${message}`, activeQuizDifficulty);
    }

    // Save Quiz Result Endpoint
    async function saveQuizResultToDatabase(score, total, percentage, performanceMessage, difficulty = 'medium') {
        try {
            await fetch('/quiz/save', {
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
            if (e.target === quizConfigModal) closeQuizConfigModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quizConfigModal && !quizConfigModal.classList.contains('hidden')) {
            closeQuizConfigModal();
        }
    });

    // Question Count Pills (10, 20, 30, 40, 50)
    quizPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.questions, 10);
            if (count) {
                selectedNumQuestions = count;
                quizPillBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-checked', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
                updateStartQuizButtonLabel();
            }
        });
    });

    // Difficulty Option Cards (Easy, Medium, Hard)
    diffCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const diff = btn.dataset.difficulty;
            if (diff) {
                selectedDifficulty = diff;
                diffCardBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-checked', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
                updateStartQuizButtonLabel();
            }
        });
    });

    // Start Custom Quiz button from modal
    if (startCustomQuizBtn) {
        startCustomQuizBtn.addEventListener('click', () => {
            closeQuizConfigModal();
            generateAndStartQuiz(selectedNumQuestions, selectedDifficulty);
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
        const targetBtn = e.target.closest('button, .quiz-option-btn, .diff-card-btn, .quiz-pill-btn, .mode-btn');
        if (targetBtn) {
            targetBtn.classList.remove('glow-pulse');
            void targetBtn.offsetWidth; // Force reflow to re-trigger glow pulse animation
            targetBtn.classList.add('glow-pulse');
            setTimeout(() => {
                targetBtn.classList.remove('glow-pulse');
            }, 600);
        }
    });

    // ========================================================
    // THEME SWITCHER (DARK / LIGHT MODE)
    // ========================================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleLabel = document.getElementById('themeToggleLabel');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('studysnap-theme', theme);
        if (themeToggleLabel) {
            themeToggleLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        if (themeToggleBtn) {
            const nextMode = theme === 'dark' ? 'light' : 'dark';
            themeToggleBtn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
            themeToggleBtn.setAttribute('title', `Switch to ${nextMode} mode`);
        }
    }

    // Initialize theme from saved preference or default to dark
    const savedTheme = localStorage.getItem('studysnap-theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
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
});
