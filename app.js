/*!
 * QR Code Generator Application
 * Main application logic for offline QR code generation
 */

(function() {
    'use strict';

    // Application state
    let currentQRCode = null;
    let currentContent = '';
    let currentSize = 256;

    // DOM elements
    const elements = {
        urlInput: null,
        generateBtn: null,
        errorMessage: null,
        resultSection: null,
        qrCodeContainer: null,
        qrContentDisplay: null,
        sizeSelect: null,
        downloadBtn: null,
        newQrBtn: null,
        btnText: null,
        btnLoader: null
    };

    // Error messages
    const errorMessages = {
        empty: '请输入要转换的内容',
        tooLong: '内容太长，请使用较短的文本',
        generation: '生成二维码时出错，请重试'
    };

    // Initialize application
    function init() {
        // Cache DOM elements
        cacheElements();
        
        // Bind events
        bindEvents();
        
        // Focus on input
        elements.urlInput.focus();
        
        console.log('QR Code Generator initialized');
    }

    // Cache DOM elements for better performance
    function cacheElements() {
        elements.urlInput = document.getElementById('url-input');
        elements.generateBtn = document.getElementById('generate-btn');
        elements.errorMessage = document.getElementById('error-message');
        elements.resultSection = document.getElementById('result-section');
        elements.qrCodeContainer = document.getElementById('qr-code');
        elements.qrContentDisplay = document.getElementById('qr-content');
        elements.sizeSelect = document.getElementById('size-select');
        elements.downloadBtn = document.getElementById('download-btn');
        elements.newQrBtn = document.getElementById('new-qr-btn');
        elements.btnText = elements.generateBtn.querySelector('.btn-text');
        elements.btnLoader = elements.generateBtn.querySelector('.btn-loader');
    }

    // Bind event listeners
    function bindEvents() {
        // Generate button click
        elements.generateBtn.addEventListener('click', handleGenerate);
        
        // Enter key in input field
        elements.urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleGenerate();
            }
        });
        
        // Input field changes (for real-time validation feedback)
        elements.urlInput.addEventListener('input', handleInputChange);
        
        // Size selection change
        elements.sizeSelect.addEventListener('change', handleSizeChange);
        
        // Download button click
        elements.downloadBtn.addEventListener('click', handleDownload);
        
        // New QR button click
        elements.newQrBtn.addEventListener('click', handleNewQR);
        
        // Clear error when user starts typing
        elements.urlInput.addEventListener('focus', clearError);
    }

    // Handle input field changes
    function handleInputChange() {
        const value = elements.urlInput.value.trim();
        
        // Clear error when user starts typing
        if (value.length > 0) {
            clearError();
        }
        
        // Update button state
        elements.generateBtn.disabled = value.length === 0;
    }

    // Handle generate button click
    function handleGenerate() {
        const content = elements.urlInput.value.trim();

        // Validate input
        const validation = validateContent(content);
        if (!validation.isValid) {
            showError(validation.message);
            return;
        }

        // Show loading state
        showLoading(true);

        // Generate QR code with slight delay for better UX
        setTimeout(() => {
            try {
                generateQRCode(content);
                showResult(content);
                showLoading(false);
            } catch (error) {
                console.error('QR Code generation failed:', error);
                showError(errorMessages.generation);
                showLoading(false);
            }
        }, 300);
    }

    // Validate text input
    function validateContent(text) {
        // Check if empty
        if (!text) {
            return { isValid: false, message: errorMessages.empty };
        }

        // Check length (QR codes have data limits)
        if (text.length > 2000) {
            return { isValid: false, message: errorMessages.tooLong };
        }

        return { isValid: true };
    }

    // Generate QR code
    function generateQRCode(content) {
        // Clear previous QR code
        elements.qrCodeContainer.innerHTML = '';

        // Create new QR code
        currentQRCode = new QRCode(elements.qrCodeContainer, {
            text: content,
            width: currentSize,
            height: currentSize,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        currentContent = content;
    }

    // Show result section
    function showResult(content) {
        // Update content display
        elements.qrContentDisplay.textContent = content;

        // Show result section with animation
        elements.resultSection.style.display = 'block';
        
        // Scroll to result
        setTimeout(() => {
            elements.resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    // Handle size change
    function handleSizeChange() {
        const newSize = parseInt(elements.sizeSelect.value);
        
        if (newSize !== currentSize && currentContent) {
            currentSize = newSize;

            // Regenerate QR code with new size
            generateQRCode(currentContent);
        }
    }

    // Handle download
    function handleDownload() {
        if (!currentQRCode) {
            console.error('No QR code to download');
            return;
        }
        
        try {
            const canvas = elements.qrCodeContainer.querySelector('canvas');
            if (!canvas) {
                console.error('No canvas found');
                return;
            }
            
            // Create download link
            const link = document.createElement('a');
            link.download = generateFileName();
            link.href = canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('QR code downloaded successfully');
            
        } catch (error) {
            console.error('Download failed:', error);
            showError('下载失败，请重试');
        }
    }

    // Generate filename for download
    function generateFileName() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const label = createFilenameLabel(currentContent);
        return `qrcode-${label}-${timestamp}.png`;
    }

    function createFilenameLabel(text) {
        if (!text) {
            return 'content';
        }

        let base = text;
        if (typeof base.normalize === 'function') {
            base = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        }

        const sanitized = base
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '')
            .toLowerCase()
            .slice(0, 24);

        if (sanitized) {
            return sanitized;
        }

        const encoded = encodeURIComponent(text)
            .replace(/%/g, '')
            .slice(0, 24);

        return encoded || 'content';
    }

    // Handle new QR generation
    function handleNewQR() {
        // Clear input
        elements.urlInput.value = '';
        
        // Hide result section
        elements.resultSection.style.display = 'none';
        
        // Clear error
        clearError();
        
        // Reset state
        currentQRCode = null;
        currentContent = '';
        
        // Focus on input
        elements.urlInput.focus();
        
        // Update button state
        elements.generateBtn.disabled = true;
    }

    // Show loading state
    function showLoading(isLoading) {
        if (isLoading) {
            elements.generateBtn.disabled = true;
            elements.btnText.style.display = 'none';
            elements.btnLoader.style.display = 'inline';
        } else {
            elements.generateBtn.disabled = false;
            elements.btnText.style.display = 'inline';
            elements.btnLoader.style.display = 'none';
        }
    }

    // Show error message
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'flex';
        
        // Focus back to input
        elements.urlInput.focus();
        
        // Auto-hide error after 5 seconds
        setTimeout(clearError, 5000);
    }

    // Clear error message
    function clearError() {
        elements.errorMessage.style.display = 'none';
        elements.errorMessage.textContent = '';
    }

    // Utility functions for accessibility
    function announceToScreenReader(message) {
        // Create temporary element for screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (elements.urlInput.value.trim()) {
                    handleGenerate();
                }
            }
            
            // Escape to clear/new
            if (e.key === 'Escape') {
                if (elements.resultSection.style.display === 'block') {
                    handleNewQR();
                } else {
                    elements.urlInput.value = '';
                    clearError();
                }
            }
            
            // Ctrl/Cmd + D to download (when QR is visible)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && currentQRCode) {
                e.preventDefault();
                handleDownload();
            }
        });
    }

    // Initialize application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            setupKeyboardShortcuts();
        });
    } else {
        init();
        setupKeyboardShortcuts();
    }

    // Expose some functions for testing (development only)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        window.QRApp = {
            validateContent: validateContent,
            generateFileName: generateFileName
        };
    }

})();
