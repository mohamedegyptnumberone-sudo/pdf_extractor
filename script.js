// ===== DOM ELEMENTS =====
const elements = {
    fileInput: document.getElementById('fileInput'),
    chunkText: document.getElementById('chunkText'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    copyBtn: document.getElementById('copyBtn'),
    showAllBtn: document.getElementById('showAllBtn'),
    allTextContainer: document.getElementById('allTextContainer'),
    allTextArea: document.getElementById('allTextArea'),
    closeAllTextBtn: document.getElementById('closeAllTextBtn'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),
    downloadTextBtn: document.getElementById('downloadTextBtn'),
    linksList: document.getElementById('linksList'),
    fullPdfPreview: document.getElementById('fullPdfPreview'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    downloadPageBtn: document.getElementById('downloadPageBtn'),
    showMetadataBtn: document.getElementById('showMetadataBtn'),
    pageCounter: document.getElementById('pageCounter'),
    pdfMetadataPre: document.getElementById('pdfMetadata'),
    chunkCounter: document.getElementById('chunkCounter'),
    linksCount: document.getElementById('linksCount'),
    imagesCount: document.getElementById('imagesCount'),
    gotoChunkInput: document.getElementById('gotoChunkInput'),
    gotoChunkBtn: document.getElementById('gotoChunkBtn'),
    gotoPageInput: document.getElementById('gotoPageInput'),
    gotoPageBtn: document.getElementById('gotoPageBtn'),
    copyAllLinksBtn: document.getElementById('copyAllLinksBtn'),
    exportLinksBtn: document.getElementById('exportLinksBtn'),
    extractImagesBtn: document.getElementById('extractImagesBtn'),
    downloadAllImagesBtn: document.getElementById('downloadAllImagesBtn'),
    imagesList: document.getElementById('imagesList'),
    uploadArea: document.querySelector('.file-upload-area'),
    loadingOverlay: document.querySelector('.upload-loading-overlay'),
    sectionNavLinks: document.querySelectorAll('.section-nav-link')
};

// ===== STATE =====
let state = {
    chunks: [],
    currentChunk: 0,
    allLinks: [],
    allImages: [],
    fullText: '',
    pdfDoc: null,
    currentPage: 1,
    totalPages: 0,
    isUploading: false,
    fileName: '',
    fileSize: 0,
    fileType: ''
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Setup file upload
    setupFileUpload();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize animations
    initAnimations();
    
    // Setup section navigation
    setupSectionNavigation();
    
    // Setup button event listeners
    setupButtonListeners();
    
    // Setup scrollable containers
    setupScrollableContainers(); // <-- NEW: Setup scrollable containers
});

// ===== SCROLLABLE CONTAINERS SETUP =====
function setupScrollableContainers() {
    // Make all scrollable containers properly scrollable
    const scrollableContainers = document.querySelectorAll('.scrollable, .links-container, .text-area, #fullPdfPreview, .image-container');
    
    scrollableContainers.forEach(container => {
        // Ensure proper scrolling
        container.style.overflowY = 'auto';
        container.style.WebkitOverflowScrolling = 'touch';
        
        // Add touch events for better mobile scrolling
        container.addEventListener('touchstart', function(e) {
            this.style.scrollBehavior = 'smooth';
        });
        
        container.addEventListener('touchmove', function(e) {
            // Allow native scrolling
            if (this.scrollHeight > this.clientHeight) {
                e.stopPropagation();
            }
        });
    });
    
    // Auto-expand text areas
    const textAreas = document.querySelectorAll('.text-area');
    textAreas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 400) + 'px';
        });
        
        // Initialize height
        setTimeout(() => {
            textarea.style.height = '200px';
        }, 100);
    });
}

// ===== SECTION NAVIGATION =====
function setupSectionNavigation() {
    // Add click event to section navigation links
    elements.sectionNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Remove active class from all links
                elements.sectionNavLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
                
                // Smooth scroll to target
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight active section on scroll
    window.addEventListener('scroll', debounce(() => {
        const sections = ['#text-extraction', '#link-extraction', '#pdf-preview', '#image-extraction'];
        let currentSection = '';
        
        sections.forEach(section => {
            const element = document.querySelector(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentSection = section;
                }
            }
        });
        
        // Update active link
        elements.sectionNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// ===== ANIMATION HELPERS =====
function initAnimations() {
    // Add animation to upload icon on hover
    const uploadIcon = document.querySelector('.upload-icon');
    if (uploadIcon) {
        uploadIcon.addEventListener('mouseenter', () => {
            uploadIcon.classList.add('upload-float');
        });
        
        uploadIcon.addEventListener('mouseleave', () => {
            uploadIcon.classList.remove('upload-float');
        });
    }
}

// ===== BUTTON SETUP =====
function setupButtonListeners() {
    // Show All Text button
    if (elements.showAllBtn) {
        elements.showAllBtn.addEventListener('click', showAllText);
    }
    
    // Close All Text button
    if (elements.closeAllTextBtn) {
        elements.closeAllTextBtn.addEventListener('click', () => {
            elements.allTextContainer.style.display = 'none';
        });
    }
    
    // Copy All Text button
    if (elements.copyAllBtn) {
        elements.copyAllBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(state.fullText);
                showNotification('All text copied to clipboard!', 'success');
            } catch {
                showNotification('Failed to copy all text', 'error');
            }
        });
    }
    
    // Download All Text button
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.addEventListener('click', downloadAllText);
    }
    
    // Download Current Text button
    if (elements.downloadTextBtn) {
        elements.downloadTextBtn.addEventListener('click', downloadCurrentText);
    }
    
    // Copy All Links button
    if (elements.copyAllLinksBtn) {
        elements.copyAllLinksBtn.addEventListener('click', copyAllLinks);
    }
    
    // Export Links button
    if (elements.exportLinksBtn) {
        elements.exportLinksBtn.addEventListener('click', exportLinks);
    }
    
    // Extract Images button
    if (elements.extractImagesBtn) {
        elements.extractImagesBtn.addEventListener('click', extractImages);
    }
    
    // Download All Images button
    if (elements.downloadAllImagesBtn) {
        elements.downloadAllImagesBtn.addEventListener('click', downloadAllImages);
    }
}

// ===== FILE UPLOAD =====
function setupFileUpload() {
    // Click handler for upload button
    document.querySelector('.upload-trigger-btn')?.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // File input change handler
    elements.fileInput.addEventListener('change', handleFileUpload);
    
    // Drag and drop
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('upload-animation');
            elements.uploadArea.style.borderColor = '#4361ee';
            elements.uploadArea.style.background = '#eef2ff';
        });

        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('upload-animation');
            elements.uploadArea.style.borderColor = '';
            elements.uploadArea.style.background = '';
        });

        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('upload-animation');
            elements.uploadArea.style.borderColor = '';
            elements.uploadArea.style.background = '';
            
            if (e.dataTransfer.files.length) {
                elements.fileInput.files = e.dataTransfer.files;
                handleFileUpload({ target: elements.fileInput });
            }
        });
    }
    
    // Floating button
    document.querySelector('.floating-upload-btn .upload-btn')?.addEventListener('click', () => {
        elements.fileInput.click();
    });
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Reset UI first
    resetUI();
    
    // Store file info
    state.fileName = file.name;
    state.fileSize = file.size;
    state.fileType = file.type;
    state.isUploading = true;

    // Show upload animation
    showUploadAnimation(file);
    
    // Simulate progress for better UX
    simulateUploadProgress();

    try {
        if (file.type === "application/pdf") {
            await processPDF(file);
        } else {
            await processTextFile(file);
        }

        // Complete upload
        completeUpload();
        
        // Extract and process text
        extractAndProcessText(state.fullText);
        
        // Enable all buttons
        enableAllButtons();
        
        // Show success notification
        showNotification('Document processed successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        resetUploadArea();
    } finally {
        state.isUploading = false;
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
    }
}

// ===== UPLOAD ANIMATION =====
function showUploadAnimation(file) {
    // Show loading overlay
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = 'flex';
        // Update loading text
        const loadingText = elements.loadingOverlay.querySelector('.upload-loading-text');
        const loadingSubtext = elements.loadingOverlay.querySelector('.upload-loading-subtext');
        const fileType = elements.loadingOverlay.querySelector('.upload-file-type');
        const fileSize = elements.loadingOverlay.querySelector('.upload-file-size');
        
        if (loadingText) loadingText.textContent = `Processing ${file.name}`;
        if (loadingSubtext) loadingSubtext.textContent = 'Please wait while we extract content...';
        if (fileType) fileType.textContent = file.type === 'application/pdf' ? 'PDF' : 'Text';
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
    }
    
    // Update upload area
    if (elements.uploadArea) {
        elements.uploadArea.classList.add('uploading');
        elements.uploadArea.innerHTML = `
            <div class="upload-icon upload-spin">
                <i class="fas fa-spinner"></i>
            </div>
            <h3>Uploading ${file.name}</h3>
            <p>Please wait while we process your file...</p>
            <div class="upload-progress-container">
                <div class="upload-progress">
                    <div class="upload-progress-bar"></div>
                </div>
                <div class="upload-progress-info">
                    <div class="upload-progress-text">
                        <i class="fas fa-file-upload"></i>
                        <span>Uploading...</span>
                    </div>
                    <span class="upload-progress-percentage">0%</span>
                </div>
            </div>
        `;
        
        // Show progress container
        const progressContainer = elements.uploadArea.querySelector('.upload-progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }
}

function simulateUploadProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        if (!state.isUploading) {
            clearInterval(interval);
            return;
        }
        
        progress += Math.random() * 15;
        if (progress > 90) progress = 90; // Cap at 90% until processing completes
        
        updateProgress(progress);
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 200);
}

function updateProgress(percentage) {
    if (elements.uploadArea) {
        const progressBar = elements.uploadArea.querySelector('.upload-progress-bar');
        const progressPercent = elements.uploadArea.querySelector('.upload-progress-percentage');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${Math.round(percentage)}%`;
        }
    }
    
    // Also update loading overlay progress
    if (elements.loadingOverlay) {
        const progressEl = elements.loadingOverlay.querySelector('.upload-progress');
        if (progressEl) {
            progressEl.textContent = `${Math.round(percentage)}%`;
        }
    }
}

function completeUpload() {
    // Update progress to 100%
    updateProgress(100);
    
    // Reset upload area after delay
    setTimeout(() => {
        if (elements.uploadArea) {
            elements.uploadArea.classList.remove('uploading');
            resetUploadArea();
        }
    }, 500);
}

function resetUploadArea() {
    if (elements.uploadArea) {
        elements.uploadArea.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Upload Your Document</h3>
            <p>Drag & drop or click to upload PDF or TXT files</p>
            <div class="upload-formats">
                <span class="format-badge"><i class="fas fa-file-pdf"></i> PDF</span>
                <span class="format-badge"><i class="fas fa-file-alt"></i> TXT</span>
            </div>
            <p class="privacy-note">
                <i class="fas fa-user-shield"></i>
                <strong>Privacy Guaranteed:</strong> All processing happens in your browser.
            </p>
            <button class="btn btn-primary upload-trigger-btn">
                <i class="fas fa-folder-open"></i>
                Choose File
            </button>
        `;
        
        // Re-attach event listener
        elements.uploadArea.querySelector('.upload-trigger-btn').addEventListener('click', () => {
            elements.fileInput.click();
        });
    }
}

// ===== PDF PROCESSING =====
async function processPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    state.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    state.totalPages = state.pdfDoc.numPages;

    // Update progress during text extraction
    updateProgress(92);
    
    // Extract text
    state.fullText = '';
    for (let i = 1; i <= state.totalPages; i++) {
        const page = await state.pdfDoc.getPage(i);
        const content = await page.getTextContent();
        state.fullText += content.items.map(item => item.str).join(' ') + '\n\n';
        
        // Update progress gradually
        if (i % Math.ceil(state.totalPages / 8) === 0) {
            updateProgress(92 + (i / state.totalPages * 6));
        }
    }

    // Update progress for rendering
    updateProgress(98);
    
    // Render preview
    await renderPDFPreview();
    
    // Enable image extraction button for PDF files
    if (elements.extractImagesBtn) {
        elements.extractImagesBtn.disabled = false;
    }
    
    // Final progress update
    updateProgress(100);
}

async function processTextFile(file) {
    state.fullText = await file.text();
}

// ===== TEXT PROCESSING =====
function extractAndProcessText(text) {
    // Extract links
    state.allLinks = extractLinks(text);
    displayLinks(state.allLinks);

    // Split into chunks
    state.chunks = splitIntoChunks(text);
    state.currentChunk = 0;

    updateChunkUI();
    
    // Update all text area with all chunks
    if (elements.allTextArea) {
        elements.allTextArea.value = state.chunks.join('\n\n--- Chunk Separator ---\n\n');
    }
}

function splitIntoChunks(text) {
    // Split by sentences for better readability
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';
    let wordCount = 0;
    const MAX_WORDS = 400;
    
    for (const sentence of sentences) {
        const sentenceWords = sentence.trim().split(/\s+/).length;
        
        if (wordCount + sentenceWords > MAX_WORDS && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
            wordCount = sentenceWords;
        } else {
            currentChunk += ' ' + sentence;
            wordCount += sentenceWords;
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

function updateChunkUI() {
    if (state.chunks.length === 0) {
        elements.chunkText.value = 'No text extracted.';
        return;
    }

    elements.chunkText.value = state.chunks[state.currentChunk];
    elements.prevBtn.disabled = state.currentChunk === 0;
    elements.nextBtn.disabled = state.currentChunk === state.chunks.length - 1;
    elements.copyBtn.disabled = false;
    elements.chunkCounter.textContent = `${state.currentChunk + 1}/${state.chunks.length}`;
    elements.gotoChunkBtn.disabled = false;
    elements.showAllBtn.disabled = false;
    elements.downloadTextBtn.disabled = false;
    
    // Auto-adjust text area height
    setTimeout(() => {
        if (elements.chunkText) {
            elements.chunkText.style.height = 'auto';
            elements.chunkText.style.height = Math.min(elements.chunkText.scrollHeight, 400) + 'px';
        }
    }, 100);
}

// ===== SHOW ALL TEXT FUNCTIONALITY =====
function showAllText() {
    if (state.chunks.length === 0) {
        showNotification('No text to show', 'info');
        return;
    }
    
    // Show the all text container
    elements.allTextContainer.style.display = 'block';
    
    // Populate with all chunks
    const allText = state.chunks.map((chunk, index) => {
        return `=== Chunk ${index + 1} of ${state.chunks.length} ===\n\n${chunk}\n\n`;
    }).join('');
    
    elements.allTextArea.value = allText;
    
    // Auto-adjust height
    setTimeout(() => {
        if (elements.allTextArea) {
            elements.allTextArea.style.height = 'auto';
            elements.allTextArea.style.height = Math.min(elements.allTextArea.scrollHeight, 500) + 'px';
        }
    }, 100);
    
    // Scroll to the all text container
    elements.allTextContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== TEXT DOWNLOAD FUNCTIONS =====
function downloadCurrentText() {
    if (state.chunks.length === 0) return;
    
    const text = state.chunks[state.currentChunk];
    const filename = `${state.fileName.replace(/\.[^/.]+$/, "")}_chunk_${state.currentChunk + 1}.txt`;
    downloadText(text, filename);
}

function downloadAllText() {
    if (state.chunks.length === 0) return;
    
    const allText = state.chunks.map((chunk, index) => {
        return `=== Chunk ${index + 1} of ${state.chunks.length} ===\n\n${chunk}\n\n`;
    }).join('');
    
    const filename = `${state.fileName.replace(/\.[^/.]+$/, "")}_all_chunks.txt`;
    downloadText(allText, filename);
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Text downloaded successfully!', 'success');
}

// ===== PDF RENDERING =====
async function renderPDFPreview() {
    elements.fullPdfPreview.innerHTML = '';
    
    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'empty-state';
    loadingDiv.innerHTML = `
        <div class="loading" style="width: 40px; height: 40px;"></div>
        <p>Rendering PDF preview...</p>
    `;
    elements.fullPdfPreview.appendChild(loadingDiv);

    // Render all pages
    for (let i = 1; i <= state.pdfDoc.numPages; i++) {
        const page = await state.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.marginBottom = '20px';
        canvas.id = `pdf-page-${i}`;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        elements.fullPdfPreview.appendChild(canvas);
    }

    // Remove loading
    loadingDiv.remove();
    updatePageCounter();
    
    // Ensure PDF preview is scrollable
    elements.fullPdfPreview.style.overflowY = 'auto';
}

function updatePageCounter() {
    if (state.pdfDoc) {
        elements.pageCounter.textContent = `${state.currentPage}/${state.pdfDoc.numPages}`;
    }
}

// ===== IMAGE EXTRACTION =====
async function extractImages() {
    if (!state.pdfDoc) {
        showNotification('No PDF loaded', 'error');
        return;
    }
    
    showNotification('Extracting images from PDF...', 'info');
    
    state.allImages = [];
    elements.imagesList.innerHTML = '<div class="loading" style="width: 40px; height: 40px; margin: 0 auto;"></div><p>Extracting images...</p>';
    
    try {
        // For demo purposes, create placeholder images
        // In a real implementation, you would extract actual images from PDF
        for (let i = 1; i <= Math.min(state.totalPages, 5); i++) {
            state.allImages.push({
                page: i,
                id: `img-${i}`,
                name: `Image from page ${i}`
            });
        }
        
        displayImages();
        
    } catch (error) {
        console.error('Error extracting images:', error);
        showNotification('Error extracting images', 'error');
        elements.imagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image empty-icon"></i>
                <h3>Image Extraction Failed</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayImages() {
    if (state.allImages.length === 0) {
        elements.imagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image empty-icon"></i>
                <h3>No Images Found</h3>
                <p>This PDF doesn't contain extractable images</p>
            </div>
        `;
        elements.imagesCount.textContent = '0 found';
        elements.downloadAllImagesBtn.disabled = true;
        return;
    }
    
    elements.imagesCount.textContent = `${state.allImages.length} found`;
    elements.downloadAllImagesBtn.disabled = false;
    
    // Show placeholder images for demo
    let imagesHTML = '<div class="image-grid">';
    
    state.allImages.forEach((img, index) => {
        imagesHTML += `
            <div class="image-item">
                <img src="https://via.placeholder.com/200x150/4361ee/ffffff?text=Image+${index + 1}" 
                     alt="Extracted Image ${index + 1}" 
                     class="image-preview">
                <div class="image-info">
                    <h4>Image ${index + 1}</h4>
                    <p>Page ${img.page}</p>
                    <button class="btn btn-sm btn-secondary" onclick="downloadSingleImage(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    imagesHTML += '</div>';
    elements.imagesList.innerHTML = imagesHTML;
    
    showNotification(`Extracted ${state.allImages.length} images`, 'success');
}

function downloadAllImages() {
    showNotification('In a real implementation, this would download all images as a ZIP file', 'info');
}

function downloadSingleImage(index) {
    showNotification(`Downloading image ${index + 1}...`, 'info');
}

// ===== LINK EXTRACTION =====
function extractLinks(text) {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    return [...new Set(text.match(urlRegex) || [])];
}

function displayLinks(links) {
    elements.linksCount.textContent = `${links.length} found`;
    
    if (links.length === 0) {
        elements.linksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-link empty-icon"></i>
                <h3>No Links Found</h3>
            </div>
        `;
        elements.copyAllLinksBtn.disabled = true;
        elements.exportLinksBtn.disabled = true;
        return;
    }

    elements.linksList.innerHTML = '';
    links.forEach(link => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `
            <a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>
            <button class="copy-icon" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        div.querySelector('.copy-icon').addEventListener('click', () => {
            navigator.clipboard.writeText(link);
            showNotification('Link copied!', 'success');
        });
        
        elements.linksList.appendChild(div);
    });
    
    elements.copyAllLinksBtn.disabled = false;
    elements.exportLinksBtn.disabled = false;
}

function copyAllLinks() {
    if (state.allLinks.length === 0) return;
    
    const linksText = state.allLinks.join('\n');
    navigator.clipboard.writeText(linksText)
        .then(() => showNotification('All links copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy links', 'error'));
}

function exportLinks() {
    if (state.allLinks.length === 0) return;
    
    const linksText = state.allLinks.join('\n');
    const blob = new Blob([linksText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.fileName.replace(/\.[^/.]+$/, "")}_links.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Links exported successfully!', 'success');
}

// ===== UI CONTROLS =====
elements.prevBtn.addEventListener('click', () => {
    if (state.currentChunk > 0) {
        state.currentChunk--;
        updateChunkUI();
    }
});

elements.nextBtn.addEventListener('click', () => {
    if (state.currentChunk < state.chunks.length - 1) {
        state.currentChunk++;
        updateChunkUI();
    }
});

elements.copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(state.chunks[state.currentChunk]);
        showNotification('Text copied to clipboard!', 'success');
    } catch {
        showNotification('Failed to copy text', 'error');
    }
});

elements.gotoChunkBtn.addEventListener('click', () => {
    const val = parseInt(elements.gotoChunkInput.value);
    if (val >= 1 && val <= state.chunks.length) {
        state.currentChunk = val - 1;
        updateChunkUI();
        elements.gotoChunkInput.value = '';
    }
});

// PDF Controls
elements.prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        scrollToPage(state.currentPage);
    }
});

elements.nextPageBtn.addEventListener('click', () => {
    if (state.pdfDoc && state.currentPage < state.pdfDoc.numPages) {
        state.currentPage++;
        scrollToPage(state.currentPage);
    }
});

elements.gotoPageBtn.addEventListener('click', () => {
    const val = parseInt(elements.gotoPageInput.value);
    if (val >= 1 && val <= state.pdfDoc.numPages) {
        state.currentPage = val;
        scrollToPage(state.currentPage);
        elements.gotoPageInput.value = '';
    }
});

elements.downloadPageBtn.addEventListener('click', () => {
    if (!state.pdfDoc) return;
    
    const canvas = document.getElementById(`pdf-page-${state.currentPage}`);
    if (canvas) {
        const link = document.createElement('a');
        link.download = `${state.fileName.replace(/\.[^/.]+$/, "")}_page_${state.currentPage}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showNotification(`Page ${state.currentPage} downloaded!`, 'success');
    }
});

elements.showMetadataBtn.addEventListener('click', async () => {
    if (!state.pdfDoc) return;
    
    try {
        const metadata = await state.pdfDoc.getMetadata();
        elements.pdfMetadataPre.style.display = 'block';
        elements.pdfMetadataPre.textContent = JSON.stringify(metadata, null, 2);
        
        // Auto-adjust metadata display height
        setTimeout(() => {
            if (elements.pdfMetadataPre) {
                elements.pdfMetadataPre.style.maxHeight = '300px';
                elements.pdfMetadataPre.style.overflowY = 'auto';
            }
        }, 100);
    } catch (e) {
        showNotification('Failed to get metadata', 'error');
    }
});

function scrollToPage(page) {
    const canvas = document.getElementById(`pdf-page-${page}`);
    if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth' });
        state.currentPage = page;
        updatePageCounter();
    }
}

// ===== UTILITIES =====
function resetUI() {
    state = {
        chunks: [],
        currentChunk: 0,
        allLinks: [],
        allImages: [],
        fullText: '',
        pdfDoc: null,
        currentPage: 1,
        totalPages: 0,
        isUploading: false,
        fileName: '',
        fileSize: 0,
        fileType: ''
    };

    // Reset displays
    elements.chunkText.value = '';
    elements.allTextContainer.style.display = 'none';
    elements.allTextArea.value = '';
    elements.linksList.innerHTML = '';
    elements.fullPdfPreview.innerHTML = '';
    elements.pdfMetadataPre.style.display = 'none';
    elements.imagesList.innerHTML = '';
    
    // Reset counters
    elements.chunkCounter.textContent = '--/--';
    elements.linksCount.textContent = '0 found';
    elements.pageCounter.textContent = '--/--';
    elements.imagesCount.textContent = '0 found';
    
    // Disable all buttons
    disableAllButtons();
}

function disableAllButtons() {
    const buttons = [
        elements.prevBtn, elements.nextBtn, elements.copyBtn, 
        elements.showAllBtn, elements.downloadTextBtn,
        elements.prevPageBtn, elements.nextPageBtn,
        elements.downloadPageBtn, elements.showMetadataBtn,
        elements.gotoChunkBtn, elements.gotoPageBtn,
        elements.copyAllLinksBtn, elements.exportLinksBtn,
        elements.extractImagesBtn, elements.downloadAllImagesBtn,
        elements.copyAllBtn, elements.downloadAllBtn,
        elements.closeAllTextBtn
    ];
    
    buttons.forEach(btn => {
        if (btn) btn.disabled = true;
    });
}

function enableAllButtons() {
    const buttons = [
        elements.prevBtn, elements.nextBtn, elements.copyBtn, 
        elements.showAllBtn, elements.downloadTextBtn,
        elements.gotoChunkBtn, elements.copyAllBtn,
        elements.downloadAllBtn, elements.closeAllTextBtn
    ];
    
    buttons.forEach(btn => {
        if (btn) btn.disabled = false;
    });
    
    // Enable PDF controls if PDF is loaded
    if (state.pdfDoc) {
        const pdfControls = [
            elements.prevPageBtn, elements.nextPageBtn,
            elements.downloadPageBtn, elements.showMetadataBtn,
            elements.gotoPageBtn, elements.extractImagesBtn
        ];
        
        pdfControls.forEach(btn => {
            if (btn) btn.disabled = false;
        });
    }
    
    // Enable link controls if links are found
    if (state.allLinks.length > 0) {
        if (elements.copyAllLinksBtn) elements.copyAllLinksBtn.disabled = false;
        if (elements.exportLinksBtn) elements.exportLinksBtn.disabled = false;
    }
}

// ===== FORMATTING FUNCTIONS =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Remove existing
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create new
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== SMOOTH SCROLLING =====
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + O to open file dialog
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            elements.fileInput.click();
        }
        
        // Arrow keys for navigation
        if (!e.target.matches('textarea, input')) {
            if (e.key === 'ArrowLeft') {
                if (state.currentChunk > 0) {
                    state.currentChunk--;
                    updateChunkUI();
                }
            } else if (e.key === 'ArrowRight') {
                if (state.currentChunk < state.chunks.length - 1) {
                    state.currentChunk++;
                    updateChunkUI();
                }
            }
        }
    });
}

// ===== DEBOUNCE HELPER =====
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Make some functions globally available for HTML onclick events
window.downloadSingleImage = downloadSingleImage;