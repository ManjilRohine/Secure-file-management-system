// Mock database for users and files
const db = {
    users: [
        {
            id: 1,
            username: 'johndoe',
            password: 'password123',
            email: 'john.doe@example.com'
        }
    ],
    files: [
        {
            id: 1,
            name: 'Project Proposal.pdf',
            type: 'application/pdf',
            size: 2500000,
            userId: 1,
            encrypted: false,
            shared: false,
            createdAt: new Date('2023-03-15T10:30:00'),
            updatedAt: new Date('2023-03-15T10:30:00'),
            icon: 'fa-file-pdf',
            color: '#ef4444'
        },
        {
            id: 2,
            name: 'Company Logo.png',
            type: 'image/png',
            size: 1200000,
            userId: 1,
            encrypted: false,
            shared: true,
            createdAt: new Date('2023-03-10T14:20:00'),
            updatedAt: new Date('2023-03-12T09:15:00'),
            icon: 'fa-file-image',
            color: '#3b82f6'
        },
        {
            id: 3,
            name: 'Financial Report.xlsx',
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: 4300000,
            userId: 1,
            encrypted: true,
            shared: false,
            createdAt: new Date('2023-03-08T11:45:00'),
            updatedAt: new Date('2023-03-08T16:30:00'),
            icon: 'fa-file-excel',
            color: '#10b981'
        },
        {
            id: 4,
            name: 'Meeting Notes.txt',
            type: 'text/plain',
            size: 15000,
            userId: 1,
            encrypted: false,
            shared: false,
            createdAt: new Date('2023-03-05T15:00:00'),
            updatedAt: new Date('2023-03-05T15:00:00'),
            icon: 'fa-file-alt',
            color: '#6b7280'
        },
        {
            id: 5,
            name: 'Presentation.pptx',
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            size: 8200000,
            userId: 1,
            encrypted: true,
            shared: true,
            createdAt: new Date('2023-02-28T09:00:00'),
            updatedAt: new Date('2023-03-01T10:15:00'),
            icon: 'fa-file-powerpoint',
            color: '#f97316'
        },
        {
            id: 6,
            name: 'Vacation Photo.jpg',
            type: 'image/jpeg',
            size: 3500000,
            userId: 1,
            encrypted: false,
            shared: false,
            createdAt: new Date('2023-02-20T18:30:00'),
            updatedAt: new Date('2023-02-20T18:30:00'),
            icon: 'fa-file-image',
            color: '#3b82f6'
        }
    ],
    sharedUsers: [
        {
            id: 1,
            fileId: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            access: 'view'
        },
        {
            id: 2,
            fileId: 5,
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            access: 'edit'
        }
    ]
};

// Current user state
let currentUser = null;
let isDarkMode = false;

// DOM Elements
const pages = {
    auth: document.getElementById('auth-page'),
    dashboard: document.getElementById('dashboard-page'),
    files: document.getElementById('files-page')
};

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showPage(pageId) {
    // Hide all pages
    Object.values(pages).forEach(page => {
        if (page) page.classList.add('hidden');
    });
    
    // Show the requested page
    const page = document.getElementById(pageId);
    if (page) page.classList.remove('hidden');
    
    // If showing dashboard or files page, update UI based on current user
    if (pageId === 'dashboard-page' || pageId === 'files-page') {
        updateUserUI();
        if (pageId === 'dashboard-page') {
            loadDashboard();
        } else if (pageId === 'files-page') {
            loadFiles();
        }
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.fa-moon').forEach(icon => {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        });
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.fa-sun').forEach(icon => {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        });
    }
}

function updateUserUI() {
    if (!currentUser) return;
    
    // Update dashboard username
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(el => {
        if (el) el.textContent = currentUser.username;
    });
    
    // Update avatar
    const avatars = document.querySelectorAll('.avatar span');
    avatars.forEach(avatar => {
        avatar.textContent = currentUser.username.charAt(0).toUpperCase();
    });
    
    // Update username in header
    const headerUsernames = document.querySelectorAll('.user-menu .username');
    headerUsernames.forEach(el => {
        el.textContent = currentUser.username;
    });
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to the document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Auth Functions
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Reset errors
    document.getElementById('login-username-error').textContent = '';
    document.getElementById('login-password-error').textContent = '';
    
    // Validate
    let hasError = false;
    
    if (!username) {
        document.getElementById('login-username-error').textContent = 'Username is required';
        hasError = true;
    }
    
    if (!password) {
        document.getElementById('login-password-error').textContent = 'Password is required';
        hasError = true;
    }
    
    if (hasError) return;
    
    // Check credentials
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        showPage('dashboard-page');
    } else {
        document.getElementById('login-password-error').textContent = 'Invalid username or password';
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Reset errors
    document.getElementById('register-username-error').textContent = '';
    document.getElementById('register-password-error').textContent = '';
    document.getElementById('register-confirm-password-error').textContent = '';
    
    // Validate
    let hasError = false;
    
    if (!username) {
        document.getElementById('register-username-error').textContent = 'Username is required';
        hasError = true;
    } else if (db.users.some(u => u.username === username)) {
        document.getElementById('register-username-error').textContent = 'Username already exists';
        hasError = true;
    }
    
    if (!password) {
        document.getElementById('register-password-error').textContent = 'Password is required';
        hasError = true;
    } else if (password.length < 8) {
        document.getElementById('register-password-error').textContent = 'Password must be at least 8 characters';
        hasError = true;
    }
    
    if (password !== confirmPassword) {
        document.getElementById('register-confirm-password-error').textContent = 'Passwords do not match';
        hasError = true;
    }
    
    if (hasError) return;
    
    // Create new user
    const newUser = {
        id: db.users.length + 1,
        username,
        password,
        email: `${username}@example.com`
    };
    
    db.users.push(newUser);
    currentUser = newUser;
    
    showPage('dashboard-page');
    showNotification('Account created successfully!');
}

function handleLogout() {
    currentUser = null;
    showPage('auth-page');
}

// Dashboard Functions
function loadDashboard() {
    if (!currentUser) return;
    
    // Update stats
    const userFiles = db.files.filter(file => file.userId === currentUser.id);
    const totalFiles = userFiles.length;
    const sharedFiles = userFiles.filter(file => file.shared).length;
    const recentFiles = userFiles.filter(file => {
        const fileDate = new Date(file.updatedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return fileDate > sevenDaysAgo;
    }).length;
    const encryptedFiles = userFiles.filter(file => file.encrypted).length;
    
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalFiles;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = sharedFiles;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = recentFiles;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = encryptedFiles;
    
    // Load recent files
    const recentFilesList = userFiles
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    
    const recentFilesContainer = document.getElementById('recent-files-list');
    recentFilesContainer.innerHTML = '';
    
    recentFilesList.forEach(file => {
        const fileRow = document.createElement('div');
        fileRow.className = 'file-row';
        
        fileRow.innerHTML = `
            <div class="file-cell file-name">
                <div class="file-icon" style="color: ${file.color}">
                    <i class="fas ${file.icon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-title">${file.name}</div>
                    <div class="file-meta">
                        ${formatFileSize(file.size)}
                        ${file.encrypted ? '<span class="file-label label-encrypted"><i class="fas fa-lock"></i> Encrypted</span>' : ''}
                        ${file.shared ? '<span class="file-label label-shared"><i class="fas fa-users"></i> Shared</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="file-cell">${formatDate(file.updatedAt)}</div>
            <div class="file-cell">${formatFileSize(file.size)}</div>
            <div class="file-cell file-actions">
                <button class="file-action-btn" data-action="preview" data-file-id="${file.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="file-action-btn" data-action="share" data-file-id="${file.id}">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="file-action-btn" data-action="download" data-file-id="${file.id}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="file-action-btn" data-action="delete" data-file-id="${file.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        recentFilesContainer.appendChild(fileRow);
    });
    
    // Add event listeners to file actions
    document.querySelectorAll('.file-action-btn').forEach(btn => {
        btn.addEventListener('click', handleFileAction);
    });
}

// Files Page Functions
function loadFiles() {
    if (!currentUser) return;
    
    const userFiles = db.files.filter(file => file.userId === currentUser.id);
    renderFiles(userFiles);
    
    // Set up search and filters
    document.getElementById('files-search-filter').addEventListener('input', filterFiles);
    document.getElementById('file-type-filter').addEventListener('change', filterFiles);
    document.getElementById('sort-order').addEventListener('change', filterFiles);
}

function renderFiles(files) {
    const filesGrid = document.getElementById('files-grid');
    const filesList = document.getElementById('files-list-body');
    const emptyFiles = document.getElementById('empty-files');
    
    // Clear containers
    filesGrid.innerHTML = '';
    filesList.innerHTML = '';
    
    if (files.length === 0) {
        emptyFiles.classList.remove('hidden');
        document.getElementById('files-grid').classList.add('hidden');
        document.getElementById('files-list').classList.add('hidden');
        return;
    }
    
    emptyFiles.classList.add('hidden');
    
    // Render grid view
    files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        fileCard.innerHTML = `
            <div class="file-card-preview">
                <div class="file-card-icon" style="color: ${file.color}">
                    <i class="fas ${file.icon}"></i>
                </div>
            </div>
            <div class="file-card-content">
                <div class="file-card-title" title="${file.name}">${file.name}</div>
                <div class="file-card-meta">
                    <span>${formatFileSize(file.size)}</span>
                    <span>${formatDate(file.updatedAt)}</span>
                </div>
                <div class="file-card-labels">
                    ${file.encrypted ? '<span class="file-label label-encrypted"><i class="fas fa-lock"></i> Encrypted</span>' : ''}
                    ${file.shared ? '<span class="file-label label-shared"><i class="fas fa-users"></i> Shared</span>' : ''}
                </div>
                <div class="file-card-actions">
                    <button class="file-action-btn" data-action="preview" data-file-id="${file.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-action-btn" data-action="share" data-file-id="${file.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="file-action-btn" data-action="download" data-file-id="${file.id}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn" data-action="delete" data-file-id="${file.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        filesGrid.appendChild(fileCard);
    });
    
    // Render list view
    files.forEach(file => {
        const listRow = document.createElement('div');
        listRow.className = 'list-row';
        
        listRow.innerHTML = `
            <div class="list-cell file-name">
                <div class="file-icon" style="color: ${file.color}">
                    <i class="fas ${file.icon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-title">${file.name}</div>
                    <div class="file-meta">
                        ${formatFileSize(file.size)}
                        ${file.encrypted ? '<span class="file-label label-encrypted"><i class="fas fa-lock"></i> Encrypted</span>' : ''}
                        ${file.shared ? '<span class="file-label label-shared"><i class="fas fa-users"></i> Shared</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="list-cell">${formatDate(file.updatedAt)}</div>
            <div class="list-cell">${formatFileSize(file.size)}</div>
            <div class="list-cell file-actions">
                <button class="file-action-btn" data-action="preview" data-file-id="${file.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="file-action-btn" data-action="share" data-file-id="${file.id}">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="file-action-btn" data-action="download" data-file-id="${file.id}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="file-action-btn" data-action="delete" data-file-id="${file.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        filesList.appendChild(listRow);
    });
    
    // Add event listeners to file actions
    document.querySelectorAll('.file-action-btn').forEach(btn => {
        btn.addEventListener('click', handleFileAction);
    });
    
    // Show the appropriate view
    const gridView = document.getElementById('grid-view-btn').classList.contains('active');
    document.getElementById('files-grid').classList.toggle('hidden', !gridView);
    document.getElementById('files-list').classList.toggle('hidden', gridView);
}

function filterFiles() {
    if (!currentUser) return;
    
    const searchTerm = document.getElementById('files-search-filter').value.toLowerCase();
    const filterType = document.getElementById('file-type-filter').value;
    const sortOrder = document.getElementById('sort-order').value;
    
    let userFiles = db.files.filter(file => file.userId === currentUser.id);
    
    // Apply search filter
    if (searchTerm) {
        userFiles = userFiles.filter(file => file.name.toLowerCase().includes(searchTerm));
    }
    
    // Apply type filter
    if (filterType) {
        if (filterType === 'documents') {
            const docTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
            userFiles = userFiles.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return docTypes.includes(ext);
            });
        } else if (filterType === 'images') {
            const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
            userFiles = userFiles.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return imageTypes.includes(ext);
            });
        } else if (filterType === 'encrypted') {
            userFiles = userFiles.filter(file => file.encrypted);
        } else if (filterType === 'shared') {
            userFiles = userFiles.filter(file => file.shared);
        }
    }
    
    // Apply sort
    userFiles.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else if (sortOrder === 'oldest') {
            return new Date(a.updatedAt) - new Date(b.updatedAt);
        } else if (sortOrder === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (sortOrder === 'name-desc') {
            return b.name.localeCompare(a.name);
        } else if (sortOrder === 'size-asc') {
            return a.size - b.size;
        } else if (sortOrder === 'size-desc') {
            return b.size - a.size;
        }
        return 0;
    });
    
    renderFiles(userFiles);
    
    // Update empty files message
    if (userFiles.length === 0) {
        const emptyMessage = searchTerm ? 'No files match your search criteria' : 'No files found in this category';
        document.getElementById('empty-files-message').textContent = emptyMessage;
    }
}

// File Actions
function handleFileAction(e) {
    const button = e.currentTarget;
    const action = button.getAttribute('data-action');
    const fileId = parseInt(button.getAttribute('data-file-id'));
    const file = db.files.find(f => f.id === fileId);
    
    if (!file) return;
    
    switch (action) {
        case 'preview':
            showFilePreview(file);
            break;
        case 'share':
            showShareModal(file);
            break;
        case 'download':
            downloadFile(file);
            break;
        case 'delete':
            deleteFile(file);
            break;
    }
}

function showFilePreview(file) {
    const modal = document.getElementById('file-preview-modal');
    const fileName = document.getElementById('preview-file-name');
    const fileContent = document.getElementById('file-preview-content');
    const fileType = document.getElementById('file-type');
    const fileSize = document.getElementById('file-size');
    const fileCreated = document.getElementById('file-created');
    const fileModified = document.getElementById('file-modified');
    const encryptedBadge = document.getElementById('file-encrypted-badge');
    
    // Set file info
    fileName.textContent = file.name;
    
    // Set preview content based on file type
    const extension = file.name.split('.').pop().toLowerCase();
    let previewHTML = '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        // Image preview
        previewHTML = `<img src="https://via.placeholder.com/800x500?text=${encodeURIComponent(file.name)}" alt="${file.name}" class="preview-image">`;
    } else if (['txt', 'md', 'js', 'html', 'css'].includes(extension)) {
        // Text preview
        previewHTML = `<div class="preview-text">This is a text file: ${file.name}</div>`;
    } else if (extension === 'pdf') {
        // PDF preview (placeholder)
        previewHTML = `<iframe src="about:blank" width="100%" height="500" class="preview-pdf">PDF preview not available in this demo</iframe>`;
    } else {
        // Unsupported file type
        previewHTML = `
            <div class="preview-unsupported">
                <i class="fas ${file.icon}" style="color: ${file.color}"></i>
                <h3>Preview not available</h3>
                <p>This file type cannot be previewed. Please download the file to view its contents.</p>
            </div>
        `;
    }
    
    fileContent.innerHTML = previewHTML;
    
    // Set file details
    fileType.textContent = getFileTypeName(extension);
    fileSize.textContent = formatFileSize(file.size);
    fileCreated.textContent = formatDate(file.createdAt);
    fileModified.textContent = formatDate(file.updatedAt);
    
    // Show/hide encrypted badge
    if (file.encrypted) {
        encryptedBadge.classList.remove('hidden');
    } else {
        encryptedBadge.classList.add('hidden');
    }
    
    // Set event listeners for download and share buttons
    document.getElementById('download-file-btn').setAttribute('data-file-id', file.id);
    document.getElementById('share-file-btn').setAttribute('data-file-id', file.id);
    
    document.getElementById('download-file-btn').addEventListener('click', () => {
        downloadFile(file);
    });
    
    document.getElementById('share-file-btn').addEventListener('click', () => {
        closeModal('file-preview-modal');
        showShareModal(file);
    });
    
    // Show modal
    showModal('file-preview-modal');
}

function showShareModal(file) {
    const modal = document.getElementById('share-modal');
    const fileName = document.getElementById('share-file-name');
    const encryptionSection = document.getElementById('encryption-section');
    const accessType = document.getElementById('access-level');
    const shareLink = document.getElementById('share-link-section');
    
    // Set file name
    fileName.textContent = file.name;
    
    // Show/hide encryption section
    if (file.encrypted) {
        encryptionSection.classList.remove('hidden');
    } else {
        encryptionSection.classList.add('hidden');
    }
    
    // Update shared users list
    const sharedUsers = db.sharedUsers.filter(u => u.fileId === file.id);
    const sharedUsersContainer = document.querySelector('.share-users');
    
    // Keep the owner element
    const ownerElement = sharedUsersContainer.querySelector('.share-user');
    sharedUsersContainer.innerHTML = '';
    sharedUsersContainer.appendChild(ownerElement);
    
    // Add shared users
    sharedUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'share-user';
        
        userElement.innerHTML = `
            <div class="user-avatar">
                <span>${user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div class="user-details">
                <p class="user-name">${user.name}</p>
                <p class="user-email">${user.email}</p>
            </div>
            <span class="user-access">${user.access} access</span>
        `;
        
        sharedUsersContainer.appendChild(userElement);
    });
    
    // Handle access level change
    accessType.value = file.shared ? 'link' : 'restricted';
    updateAccessInfo();
    
    accessType.addEventListener('change', updateAccessInfo);
    
    function updateAccessInfo() {
        const type = accessType.value;
        const accessTypeText = document.getElementById('access-type');
        const accessDescription = document.getElementById('access-description');
        
        switch (type) {
            case 'restricted':
                accessTypeText.textContent = 'Restricted';
                accessDescription.textContent = 'Only people with access can open';
                shareLink.classList.add('hidden');
                break;
            case 'link':
                accessTypeText.textContent = 'Anyone with link';
                accessDescription.textContent = 'Anyone with the link can access';
                shareLink.classList.remove('hidden');
                break;
            case 'public':
                accessTypeText.textContent = 'Public';
                accessDescription.textContent = 'Anyone can find and access';
                shareLink.classList.remove('hidden');
                break;
        }
    }
    
    // Handle share button click
    document.getElementById('share-btn').addEventListener('click', () => {
        const email = document.getElementById('share-email').value;
        const permission = document.getElementById('share-permission').value;
        
        if (!email) {
            showNotification('Please enter an email address.', 'error');
            return;
        }
        
        // Create new shared user
        const newUser = {
            id: db.sharedUsers.length + 1,
            fileId: file.id,
            name: email.split('@')[0],
            email: email,
            access: permission
        };
        
        db.sharedUsers.push(newUser);
        
        // Update file shared status
        const fileIndex = db.files.findIndex(f => f.id === file.id);
        db.files[fileIndex].shared = true;
        
        // Add user to the list
        const userElement = document.createElement('div');
        userElement.className = 'share-user';
        
        userElement.innerHTML = `
            <div class="user-avatar">
                <span>${newUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div class="user-details">
                <p class="user-name">${newUser.name}</p>
                <p class="user-email">${newUser.email}</p>
            </div>
            <span class="user-access">${newUser.access} access</span>
        `;
        
        sharedUsersContainer.appendChild(userElement);
        
        // Clear input
        document.getElementById('share-email').value = '';
        
        showNotification(`File shared with ${email} successfully!`);
    });
    
    // Handle copy link button
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const link = document.getElementById('share-link-input').value;
        
        // Copy to clipboard
        navigator.clipboard.writeText(link).then(() => {
            showNotification('Link copied to clipboard!');
        });
    });
    
    // Show modal
    showModal('share-modal');
}

function downloadFile(file) {
    showNotification(`Downloading ${file.name}...`);
    
    // In a real app, this would download the actual file
    setTimeout(() => {
        showNotification(`${file.name} downloaded successfully!`);
    }, 1500);
}

function deleteFile(file) {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
        // Remove file from database
        const fileIndex = db.files.findIndex(f => f.id === file.id);
        db.files.splice(fileIndex, 1);
        
        // Remove shared users for this file
        db.sharedUsers = db.sharedUsers.filter(u => u.fileId !== file.id);
        
        // Reload files
        if (document.getElementById('dashboard-page').classList.contains('hidden')) {
            loadFiles();
        } else {
            loadDashboard();
        }
        
        showNotification(`${file.name} deleted successfully!`);
    }
}

// Upload Functions
function handleFileUpload() {
    const modal = document.getElementById('upload-modal');
    const fileList = document.getElementById('file-list');
    const selectedFiles = document.getElementById('selected-files');
    const fileCount = document.getElementById('file-count');
    
    // Clear previous files
    fileList.innerHTML = '';
    selectedFiles.classList.add('hidden');
    
    // Show modal
    showModal('upload-modal');
}

function processUploadedFiles(files) {
    const fileList = document.getElementById('file-list');
    const selectedFiles = document.getElementById('selected-files');
    const fileCount = document.getElementById('file-count');
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Update file count
    fileCount.textContent = fileArray.length;
    
    // Show selected files section
    selectedFiles.classList.remove('hidden');
    
    // Clear and populate file list
    fileList.innerHTML = '';
    
    fileArray.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Determine file icon
        const extension = file.name.split('.').pop().toLowerCase();
        const { icon, color } = getFileIconAndColor(extension);
        
        fileItem.innerHTML = `
            <div class="file-item-info">
                <div class="file-item-icon" style="color: ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="file-item-details">
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="file-item-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            fileList.removeChild(fileList.children[index]);
            
            // Update file count
            fileCount.textContent = fileList.children.length;
            
            // Hide selected files section if empty
            if (fileList.children.length === 0) {
                selectedFiles.classList.add('hidden');
            }
        });
    });
}

function uploadFiles() {
    const fileItems = document.querySelectorAll('.file-item');
    const encrypt = document.getElementById('encrypt-files').checked;
    
    if (fileItems.length === 0) {
        showNotification('Please select at least one file to upload.', 'error');
        return;
    }
    
    showNotification(`Uploading ${fileItems.length} files...`);
    
    // In a real app, this would upload the actual files
    // For now, we'll simulate the upload with a timeout
    
    // Add progress bars
    fileItems.forEach(item => {
        const removeButton = item.querySelector('.file-item-remove');
        const progressDiv = document.createElement('div');
        progressDiv.className = 'file-item-progress';
        progressDiv.innerHTML = '<div class="progress-bar" style="width: 0%"></div>';
        
        item.replaceChild(progressDiv, removeButton);
    });
    
    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = `${progress}%`;
        });
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Add files to database
            fileItems.forEach((item, index) => {
                const fileName = item.querySelector('.file-item-name').textContent;
                const fileSize = parseFileSizeString(item.querySelector('.file-item-size').textContent);
                const extension = fileName.split('.').pop().toLowerCase();
                const { icon, color } = getFileIconAndColor(extension);
                
                const newFile = {
                    id: db.files.length + 1 + index,
                    name: fileName,
                    type: getMimeType(extension),
                    size: fileSize,
                    userId: currentUser.id,
                    encrypted: encrypt,
                    shared: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    icon,
                    color
                };
                
                db.files.push(newFile);
            });
            
            // Close modal and reload files
            setTimeout(() => {
                closeModal('upload-modal');
                showNotification(`${fileItems.length} files uploaded successfully!`);
                
                // Reload files view
                if (document.getElementById('dashboard-page').classList.contains('hidden')) {
                    loadFiles();
                } else {
                    loadDashboard();
                }
            }, 500);
        }
    }, 300);
}

// Helper Functions
function getFileTypeName(extension) {
    const types = {
        pdf: 'PDF Document',
        doc: 'Word Document',
        docx: 'Word Document',
        xls: 'Excel Spreadsheet',
        xlsx: 'Excel Spreadsheet',
        ppt: 'PowerPoint Presentation',
        pptx: 'PowerPoint Presentation',
        txt: 'Text Document',
        rtf: 'Rich Text Document',
        jpg: 'JPEG Image',
        jpeg: 'JPEG Image',
        png: 'PNG Image',
        gif: 'GIF Image',
        svg: 'SVG Image',
        mp3: 'MP3 Audio',
        mp4: 'MP4 Video',
        zip: 'ZIP Archive',
        rar: 'RAR Archive'
    };
    
    return types[extension] || 'Unknown Type';
}

function getFileIconAndColor(extension) {
    const types = {
        pdf: { icon: 'fa-file-pdf', color: '#ef4444' },
        doc: { icon: 'fa-file-word', color: '#3b82f6' },
        docx: { icon: 'fa-file-word', color: '#3b82f6' },
        xls: { icon: 'fa-file-excel', color: '#10b981' },
        xlsx: { icon: 'fa-file-excel', color: '#10b981' },
        ppt: { icon: 'fa-file-powerpoint', color: '#f97316' },
        pptx: { icon: 'fa-file-powerpoint', color: '#f97316' },
        txt: { icon: 'fa-file-alt', color: '#6b7280' },
        rtf: { icon: 'fa-file-alt', color: '#6b7280' },
        jpg: { icon: 'fa-file-image', color: '#3b82f6' },
        jpeg: { icon: 'fa-file-image', color: '#3b82f6' },
        png: { icon: 'fa-file-image', color: '#3b82f6' },
        gif: { icon: 'fa-file-image', color: '#3b82f6' },
        svg: { icon: 'fa-file-image', color: '#3b82f6' },
        mp3: { icon: 'fa-file-audio', color: '#8b5cf6' },
        mp4: { icon: 'fa-file-video', color: '#ec4899' },
        zip: { icon: 'fa-file-archive', color: '#f59e0b' },
        rar: { icon: 'fa-file-archive', color: '#f59e0b' }
    };
    
    return types[extension] || { icon: 'fa-file', color: '#6b7280' };
}

function getMimeType(extension) {
    const types = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        rtf: 'application/rtf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed'
    };
    
    return types[extension] || 'application/octet-stream';
}

function parseFileSizeString(sizeStr) {
    const value = parseFloat(sizeStr.split(' ')[0]);
    const unit = sizeStr.split(' ')[1];
    
    const multipliers = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024
    };
    
    return value * multipliers[unit];
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    
    // Close modal when clicking the overlay
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        closeModal(modalId);
    });
    
    // Close modal when clicking the close button
    modal.querySelectorAll('.modal-close, .modal-cancel, .modal-done').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(modalId);
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Auth page
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show form based on selected tab
            const tabValue = tab.getAttribute('data-tab');
            document.getElementById('login-form').classList.toggle('active', tabValue === 'login');
            document.getElementById('register-form').classList.toggle('active', tabValue === 'register');
        });
    });
    
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page') + '-page';
            showPage(pageId);
            
            // Close mobile sidebar if open
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Sidebar toggle (mobile)
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    document.getElementById('files-mobile-menu-toggle').addEventListener('click', () => {
        document.getElementById('files-sidebar').classList.toggle('open');
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('files-theme-toggle').addEventListener('click', toggleDarkMode);
    
    // User menu
    document.querySelectorAll('.user-menu-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.currentTarget.nextElementSibling.classList.toggle('hidden');
        });
    });
    
    // Click outside to close dropdown
    document.addEventListener('click', e => {
        if (!e.target.closest('.user-menu')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', e => {
        e.preventDefault();
        handleLogout();
    });
    
    document.getElementById('files-logout-btn').addEventListener('click', e => {
        e.preventDefault();
        handleLogout();
    });
    
    // Close security alert
    document.getElementById('close-alert').addEventListener('click', () => {
        document.getElementById('security-alert').classList.add('hidden');
    });
    
    // Files view toggle
    document.getElementById('grid-view-btn').addEventListener('click', () => {
        document.getElementById('grid-view-btn').classList.add('active');
        document.getElementById('list-view-btn').classList.remove('active');
        document.getElementById('files-grid').classList.remove('hidden');
        document.getElementById('files-list').classList.add('hidden');
    });
    
    document.getElementById('list-view-btn').addEventListener('click', () => {
        document.getElementById('list-view-btn').classList.add('active');
        document.getElementById('grid-view-btn').classList.remove('active');
        document.getElementById('files-list').classList.remove('hidden');
        document.getElementById('files-grid').classList.add('hidden');
    });
    
    // File Upload
    document.getElementById('upload-btn').addEventListener('click', handleFileUpload);
    document.getElementById('files-upload-btn').addEventListener('click', handleFileUpload);
    document.getElementById('upload-area').addEventListener('click', handleFileUpload);
    
    const uploadDropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input');
    
    uploadDropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', e => {
        if (e.target.files.length > 0) {
            processUploadedFiles(e.target.files);
        }
    });
    
    // Drag and drop
    uploadDropzone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadDropzone.classList.add('dragging');
    });
    
    uploadDropzone.addEventListener('dragleave', () => {
        uploadDropzone.classList.remove('dragging');
    });
    
    uploadDropzone.addEventListener('drop', e => {
        e.preventDefault();
        uploadDropzone.classList.remove('dragging');
        
        if (e.dataTransfer.files.length > 0) {
            processUploadedFiles(e.dataTransfer.files);
        }
    });
    
    // Upload files button
    document.getElementById('upload-files-btn').addEventListener('click', uploadFiles);
    
    // Show auth page on load
    showPage('auth-page');
});