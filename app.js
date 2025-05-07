// DevNotes - A Notepad App for IT Professionals
// Main Application JavaScript

// Constants 
const AVAILABLE_COLORS = ['green', 'blue', 'purple', 'orange', 'red', 'teal', 'gray'];
const AVAILABLE_ICONS = [
  'ri-terminal-box-line',
  'ri-layout-2-line',
  'ri-database-2-line',
  'ri-server-line',
  'ri-code-box-line',
  'ri-shield-keyhole-line',
  'ri-cloud-line',
  'ri-settings-4-line',
  'ri-file-list-line',
  'ri-folder-line'
];

const FORMATTING_OPTIONS = [
  { id: 'bold', icon: 'ri-bold', title: 'Bold', command: 'bold', type: 'style' },
  { id: 'italic', icon: 'ri-italic', title: 'Italic', command: 'italic', type: 'style' },
  { id: 'underline', icon: 'ri-underline', title: 'Underline', command: 'underline', type: 'style' },
  { id: 'highlight', icon: 'ri-mark-pen-line', title: 'Highlight', command: 'hiliteColor', type: 'style' },
  { id: 'alignLeft', icon: 'ri-align-left', title: 'Align Left', command: 'justifyLeft', type: 'block' },
  { id: 'alignCenter', icon: 'ri-align-center', title: 'Align Center', command: 'justifyCenter', type: 'block' },
  { id: 'alignRight', icon: 'ri-align-right', title: 'Align Right', command: 'justifyRight', type: 'block' },
  { id: 'bulletList', icon: 'ri-list-unordered', title: 'Bullet List', command: 'insertUnorderedList', type: 'list' },
  { id: 'numberedList', icon: 'ri-list-ordered', title: 'Numbered List', command: 'insertOrderedList', type: 'list' },
  { id: 'codeBlock', icon: 'ri-code-line', title: 'Code Block', command: 'formatBlock', type: 'block' }
];

// App State
const appState = {
  categories: [],
  notes: [],
  activeView: 'categories',
  activeCategory: null,
  activeNote: null,
  searchQuery: '',
  theme: 'system',
  editingCategoryId: null,
  editingNoteId: null,
  deleteInfo: null,
  textZoomLevel: 2, // Default zoom level (1-5)
  editorHistory: {
    stack: [],
    currentIndex: -1,
    maxSize: 50 // Maximum size for undo history
  }
};

// DOM Elements
let dom = {};

// Initialize the application
function initApp() {
  // Initialize DOM elements
  initializeDOMElements();
  
  // Load data from localStorage
  loadDataFromStorage();
  
  // Generate initial data if storage is empty
  if (appState.categories.length === 0) {
    generateInitialData();
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize UI components
  initializeUIComponents();
  
  // Render initial UI
  renderUI();
  
  // Set theme
  setTheme(appState.theme);
}

// Initialize DOM Elements
function initializeDOMElements() {
  dom = {
    // Views
    categoriesView: document.getElementById('categories-view'),
    notesView: document.getElementById('notes-view'),
    
    // Grids
    categoriesGrid: document.getElementById('categories-grid'),
    notesGrid: document.getElementById('notes-grid'),
    categoriesList: document.getElementById('categories-list'),
    
    // Modals
    categoryModal: document.getElementById('category-modal'),
    noteModal: document.getElementById('note-modal'),
    viewNoteModal: document.getElementById('view-note-modal'),
    deleteModal: document.getElementById('delete-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    
    // Forms
    categoryForm: document.getElementById('category-form'),
    noteForm: document.getElementById('note-form'),
    
    // Form Elements
    categoryNameInput: document.getElementById('category-name'),
    noteTitle: document.getElementById('note-title'),
    noteEditor: document.getElementById('note-editor'),
    pinNote: document.getElementById('pin-note'),
    iconSelector: document.getElementById('icon-selector'),
    colorSelector: document.getElementById('color-selector'),
    formattingToolbar: document.getElementById('formatting-toolbar'),
    
    // Buttons
    saveCategoryBtn: document.getElementById('save-category-btn'),
    saveNoteBtn: document.getElementById('save-note-btn'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    togglePinBtn: document.getElementById('toggle-pin-btn'),
    toggleFavoriteBtn: document.getElementById('toggle-favorite-btn'),
    editNoteBtn: document.getElementById('edit-note-btn'),
    backToCategoriesBtn: document.getElementById('back-to-categories'),
    addCategoryBtn: document.getElementById('add-category-btn'),
    fab: document.getElementById('fab'),
    themeToggleBtn: document.getElementById('theme-toggle'),
    toggleSidebarBtn: document.getElementById('toggle-sidebar-btn'),
    sidebar: document.getElementById('sidebar'),
    textZoomInBtn: document.getElementById('text-zoom-in-btn'),
    textZoomOutBtn: document.getElementById('text-zoom-out-btn'),
    
    // Modal Content
    categoryModalTitle: document.getElementById('category-modal-title'),
    noteModalTitle: document.getElementById('note-modal-title'),
    viewNoteTitle: document.getElementById('view-note-title'),
    noteContentView: document.getElementById('note-content-view'),
    deleteMessage: document.getElementById('delete-message'),
    noteTimestamp: document.getElementById('note-timestamp'),
    
    // Search
    searchCategories: document.getElementById('search-categories'),
    searchNotes: document.getElementById('search-notes'),
    
    // Current Category
    currentCategory: document.getElementById('current-category'),
    
    // Character count
    charCount: document.getElementById('char-count')
  };
}

// Setup Event Listeners
function setupEventListeners() {
  // Category Form
  dom.categoryForm.addEventListener('submit', handleCategorySubmit);
  
  // Note Form
  dom.noteForm.addEventListener('submit', handleNoteSubmit);
  
  // Note Editor Change
  dom.noteEditor.addEventListener('input', updateCharCount);
  
  // FAB Button
  dom.fab.addEventListener('click', handleFabClick);
  
  // Back Button
  dom.backToCategoriesBtn.addEventListener('click', () => setActiveView('categories'));
  
  // Search Inputs
  dom.searchCategories.addEventListener('input', handleSearchCategories);
  dom.searchNotes.addEventListener('input', handleSearchNotes);
  
  // Delete Confirmation
  dom.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  
  // View Note Actions
  dom.togglePinBtn.addEventListener('click', handleTogglePin);
  dom.toggleFavoriteBtn.addEventListener('click', handleToggleFavorite);
  dom.editNoteBtn.addEventListener('click', handleEditNote);
  
  // Add Category Button
  dom.addCategoryBtn.addEventListener('click', () => openCategoryModal());
  
  // Theme Toggle
  dom.themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Toggle Sidebar on Mobile
  if (dom.toggleSidebarBtn) {
    console.log('Toggle sidebar button found, adding event listener');
    dom.toggleSidebarBtn.addEventListener('click', toggleSidebar);
  } else {
    console.error('Toggle sidebar button not found in DOM');
    // Create a direct event listener as a fallback
    const sidebarToggleBtn = document.getElementById('toggle-sidebar-btn');
    if (sidebarToggleBtn) {
      console.log('Found sidebar toggle button via direct query');
      sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
  }
  
  // Text Zoom Controls
  dom.textZoomInBtn.addEventListener('click', handleTextZoomIn);
  dom.textZoomOutBtn.addEventListener('click', handleTextZoomOut);
  
  // Close Modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-modal');
      closeModal(modalId);
    });
  });
  
  // Navigation Items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.getAttribute('data-view');
      
      if (view === 'categories') {
        setActiveView('categories');
      } else if (view === 'favorites') {
        setActiveView('favorites');
      } else if (view === 'settings') {
        setActiveView('settings');
      }
      
      // Close mobile sidebar if open
      if (window.innerWidth < 768) {
        toggleSidebar();
      }
    });
  });
}

// Initialize UI Components
function initializeUIComponents() {
  // Initialize Icon Selector
  initializeIconSelector();
  
  // Initialize Color Selector
  initializeColorSelector();
  
  // Initialize Formatting Toolbar
  initializeFormattingToolbar();
}

// Initialize Icon Selector
function initializeIconSelector() {
  dom.iconSelector.innerHTML = '';
  
  AVAILABLE_ICONS.forEach(icon => {
    const iconOption = document.createElement('button');
    iconOption.type = 'button';
    iconOption.className = 'icon-option';
    iconOption.setAttribute('data-icon', icon);
    iconOption.innerHTML = `<i class="${icon}"></i>`;
    
    iconOption.addEventListener('click', () => {
      document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
      iconOption.classList.add('selected');
    });
    
    dom.iconSelector.appendChild(iconOption);
  });
}

// Initialize Color Selector
function initializeColorSelector() {
  dom.colorSelector.innerHTML = '';
  
  AVAILABLE_COLORS.forEach(color => {
    const colorOption = document.createElement('button');
    colorOption.type = 'button';
    colorOption.className = `color-option color-${color}`;
    colorOption.setAttribute('data-color', color);
    
    colorOption.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
      colorOption.classList.add('selected');
    });
    
    dom.colorSelector.appendChild(colorOption);
  });
}

// Initialize Formatting Toolbar
function initializeFormattingToolbar() {
  // Don't recreate the toolbar since it's already in the HTML
  // Instead, attach event listeners to the existing buttons
  
  document.querySelectorAll('#formatting-toolbar .formatting-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const command = e.currentTarget.getAttribute('data-command');
      
      // Special handling for undo/redo
      if (command === 'undo') {
        handleUndo();
      }
      else if (command === 'redo') {
        handleRedo();
      }
      // Special handling for highlight
      else if (command === 'hiliteColor') {
        document.execCommand(command, false, '#ffff00'); // Yellow highlight
        saveToHistory();
      } 
      // Special handling for code block
      else if (command === 'formatBlock') {
        document.execCommand(command, false, 'pre');
        saveToHistory();
      }
      // Handle normal commands
      else {
        document.execCommand(command, false, null);
        saveToHistory();
      }
      
      // Focus back on the editor
      dom.noteEditor.focus();
      
      // Update character count
      updateCharCount();
    });
  });
  
  // Add history stack for undo/redo
  dom.noteEditor.addEventListener('input', () => {
    // Store content in the history stack after a short delay to avoid excessive history entries
    clearTimeout(appState.editorHistoryTimeout);
    appState.editorHistoryTimeout = setTimeout(() => {
      saveToHistory();
    }, 500); // Half-second delay
  });
}

// Editor History Functions
// Save current content to history stack
function saveToHistory() {
  const content = dom.noteEditor.innerHTML;
  
  // Don't save if content is the same as the current position in history
  if (appState.editorHistory.currentIndex >= 0 && 
      appState.editorHistory.stack[appState.editorHistory.currentIndex] === content) {
    return;
  }
  
  // If we're not at the end of the stack, remove everything after current position
  if (appState.editorHistory.currentIndex < appState.editorHistory.stack.length - 1) {
    appState.editorHistory.stack = appState.editorHistory.stack.slice(0, appState.editorHistory.currentIndex + 1);
  }
  
  // Add current content to stack
  appState.editorHistory.stack.push(content);
  
  // Trim stack if it exceeds max size
  if (appState.editorHistory.stack.length > appState.editorHistory.maxSize) {
    appState.editorHistory.stack.shift();
  } else {
    appState.editorHistory.currentIndex++;
  }
}

// Handle undo action
function handleUndo() {
  if (appState.editorHistory.currentIndex <= 0) {
    return; // Nothing to undo
  }
  
  appState.editorHistory.currentIndex--;
  dom.noteEditor.innerHTML = appState.editorHistory.stack[appState.editorHistory.currentIndex];
  updateCharCount();
}

// Handle redo action
function handleRedo() {
  if (appState.editorHistory.currentIndex >= appState.editorHistory.stack.length - 1) {
    return; // Nothing to redo
  }
  
  appState.editorHistory.currentIndex++;
  dom.noteEditor.innerHTML = appState.editorHistory.stack[appState.editorHistory.currentIndex];
  updateCharCount();
}

// Clear editor history stack when opening a new note or starting fresh
function resetEditorHistory() {
  appState.editorHistory.stack = [];
  appState.editorHistory.currentIndex = -1;
}

// Update Character Count
function updateCharCount() {
  const text = dom.noteEditor.innerText || '';
  dom.charCount.textContent = `${text.length} characters`;
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Get initials from name
function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Load Data from localStorage
function loadDataFromStorage() {
  // Load categories
  const categoriesData = localStorage.getItem('mohsinnotes_categories');
  if (categoriesData) {
    appState.categories = JSON.parse(categoriesData);
  }
  
  // Load notes
  const notesData = localStorage.getItem('mohsinnotes_notes');
  if (notesData) {
    appState.notes = JSON.parse(notesData);
  }
  
  // Load theme preference
  const themeData = localStorage.getItem('mohsinnotes_theme');
  if (themeData) {
    appState.theme = themeData;
  }
  
  // Load text zoom level
  const textZoomLevelData = localStorage.getItem('mohsinnotes_text_zoom_level');
  if (textZoomLevelData) {
    appState.textZoomLevel = parseInt(textZoomLevelData, 10);
  }
}

// Generate Initial Data
function generateInitialData() {
  // Create sample categories if no categories exist
  if (appState.categories.length === 0) {
    const sampleCategories = [
      {
        id: generateId(),
        name: 'Frontend Development',
        icon: 'ri-layout-2-line',
        color: 'blue',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Backend APIs',
        icon: 'ri-server-line',
        color: 'green',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Database',
        icon: 'ri-database-2-line',
        color: 'purple',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
    
    appState.categories = sampleCategories;
    saveCategories();
    
    // Create sample notes for each category
    const sampleNotes = [
      {
        id: generateId(),
        categoryId: sampleCategories[0].id,
        title: 'CSS Grid Layout',
        content: '<p>CSS Grid is a powerful layout system available in CSS. It is a 2-dimensional system, meaning it can handle both columns and rows.</p><p>Example:</p><pre>display: grid;<br>grid-template-columns: repeat(3, 1fr);<br>gap: 10px;</pre>',
        isPinned: true,
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        categoryId: sampleCategories[1].id,
        title: 'REST API Best Practices',
        content: '<p>RESTful API design best practices:</p><ul><li>Use nouns instead of verbs in endpoint paths</li><li>Use logical nesting on endpoints</li><li>Handle errors gracefully and return appropriate status codes</li><li>Allow filtering, sorting, and pagination</li><li>Maintain good documentation</li></ul>',
        isPinned: false,
        isFavorite: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        categoryId: sampleCategories[2].id,
        title: 'SQL Joins Cheatsheet',
        content: '<p>Common SQL joins:</p><ul><li><strong>INNER JOIN</strong>: Returns records with matching values in both tables</li><li><strong>LEFT JOIN</strong>: Returns all records from the left table, and matched records from the right table</li><li><strong>RIGHT JOIN</strong>: Returns all records from the right table, and matched records from the left table</li><li><strong>FULL JOIN</strong>: Returns all records when there is a match in either left or right table</li></ul>',
        isPinned: false,
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
    
    appState.notes = sampleNotes;
    saveNotes();
  }
}

// Save Functions
function saveCategories() {
  localStorage.setItem('mohsinnotes_categories', JSON.stringify(appState.categories));
}

function saveNotes() {
  localStorage.setItem('mohsinnotes_notes', JSON.stringify(appState.notes));
}

// Save Text Zoom Level
function saveTextZoomLevel() {
  localStorage.setItem('mohsinnotes_text_zoom_level', appState.textZoomLevel.toString());
}

// Theme Management
function setTheme(theme) {
  appState.theme = theme;
  localStorage.setItem('mohsinnotes_theme', theme);
  
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Sidebar Toggle for Mobile
function toggleSidebar() {
  console.log('Toggle sidebar called');
  
  // Ensure DOM element exists
  if (!dom.sidebar) {
    console.error('Sidebar element not found');
    return;
  }
  
  // Toggle the mobile-open class
  console.log('Toggling sidebar class');
  dom.sidebar.classList.toggle('sidebar-mobile-open');
  
  if (dom.sidebar.classList.contains('sidebar-mobile-open')) {
    // Add close button for mobile
    if (!document.querySelector('.sidebar-mobile-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'sidebar-mobile-close-btn';
      closeBtn.innerHTML = '<i class="ri-close-line"></i>';
      closeBtn.addEventListener('click', toggleSidebar);
      
      const sidebarContent = dom.sidebar.querySelector('.sidebar-content');
      if (sidebarContent) {
        sidebarContent.prepend(closeBtn);
      }
    }
    
    // Add overlay to allow clicking outside to close
    if (!document.getElementById('sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(overlay);
    }
  } else {
    // Remove overlay when closing sidebar
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    dom.modalBackdrop.style.display = 'block';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    dom.modalBackdrop.style.display = 'none';
  }
}

// Open Category Modal (for Add/Edit)
function openCategoryModal(category = null) {
  // Reset form
  dom.categoryForm.reset();
  
  // Clear selected state from icon and color options
  document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
  
  if (category) {
    // Editing existing category
    appState.editingCategoryId = category.id;
    dom.categoryModalTitle.textContent = 'Edit Category';
    dom.saveCategoryBtn.textContent = 'Update Category';
    
    // Set form values
    dom.categoryNameInput.value = category.name;
    
    // Select the right icon
    const iconOption = document.querySelector(`.icon-option[data-icon="${category.icon}"]`);
    if (iconOption) iconOption.classList.add('selected');
    
    // Select the right color
    const colorOption = document.querySelector(`.color-option[data-color="${category.color}"]`);
    if (colorOption) colorOption.classList.add('selected');
  } else {
    // Adding new category
    appState.editingCategoryId = null;
    dom.categoryModalTitle.textContent = 'Add New Category';
    dom.saveCategoryBtn.textContent = 'Create Category';
    
    // Default selections
    const defaultIcon = document.querySelector('.icon-option:first-child');
    if (defaultIcon) defaultIcon.classList.add('selected');
    
    const defaultColor = document.querySelector('.color-option:first-child');
    if (defaultColor) defaultColor.classList.add('selected');
  }
  
  openModal('category-modal');
}

// Open Note Modal (for Add/Edit)
function openNoteModal(note = null) {
  // Reset form
  dom.noteForm.reset();
  dom.noteEditor.innerHTML = '';
  updateCharCount();
  
  // Reset editor history
  resetEditorHistory();
  
  if (note) {
    // Editing existing note
    appState.editingNoteId = note.id;
    dom.noteModalTitle.textContent = 'Edit Note';
    dom.saveNoteBtn.textContent = 'Update Note';
    
    // Set form values
    dom.noteTitle.value = note.title;
    dom.noteEditor.innerHTML = note.content;
    dom.pinNote.checked = note.isPinned;
    
    // Save the initial content to history stack
    saveToHistory();
    
    updateCharCount();
  } else {
    // Adding new note
    appState.editingNoteId = null;
    dom.noteModalTitle.textContent = 'Add New Note';
    dom.saveNoteBtn.textContent = 'Save Note';
    dom.pinNote.checked = false;
  }
  
  openModal('note-modal');
}

// Open View Note Modal
function openViewNoteModal(note) {
  if (!note) return;
  
  appState.activeNote = note;
  
  // Set modal content
  dom.viewNoteTitle.textContent = note.title;
  dom.noteContentView.innerHTML = note.content;
  dom.noteTimestamp.textContent = `Last updated: ${formatDate(note.updatedAt)}`;
  
  // Set pin and favorite button states
  dom.togglePinBtn.innerHTML = note.isPinned ? 
    '<i class="ri-pushpin-fill"></i>' : 
    '<i class="ri-pushpin-line"></i>';
  
  dom.togglePinBtn.classList.toggle('active', note.isPinned);
  
  dom.toggleFavoriteBtn.innerHTML = note.isFavorite ? 
    '<i class="ri-star-fill"></i>' : 
    '<i class="ri-star-line"></i>';
  
  dom.toggleFavoriteBtn.classList.toggle('active', note.isFavorite);
  
  // Apply text zoom
  applyTextZoom();
  
  openModal('view-note-modal');
}

// Open Delete Confirmation Modal
function openDeleteConfirmation(type, id) {
  appState.deleteInfo = { type, id };
  
  // Set message based on type
  if (type === 'category') {
    dom.deleteMessage.textContent = 'Are you sure you want to delete this category? All notes in this category will also be deleted. This action cannot be undone.';
  } else {
    dom.deleteMessage.textContent = 'Are you sure you want to delete this note? This action cannot be undone.';
  }
  
  openModal('delete-modal');
}

// Handle Category Form Submit
function handleCategorySubmit(e) {
  e.preventDefault();
  
  const name = dom.categoryNameInput.value.trim();
  if (!name) return;
  
  const selectedIconEl = document.querySelector('.icon-option.selected');
  const selectedColorEl = document.querySelector('.color-option.selected');
  
  if (!selectedIconEl || !selectedColorEl) return;
  
  const icon = selectedIconEl.getAttribute('data-icon');
  const color = selectedColorEl.getAttribute('data-color');
  
  if (appState.editingCategoryId) {
    // Update existing category
    updateCategory({
      id: appState.editingCategoryId,
      name,
      icon,
      color
    });
  } else {
    // Add new category
    addCategory({
      name,
      icon,
      color
    });
  }
  
  closeModal('category-modal');
}

// Handle Note Form Submit
function handleNoteSubmit(e) {
  e.preventDefault();
  
  const title = dom.noteTitle.value.trim();
  if (!title) return;
  
  const content = dom.noteEditor.innerHTML;
  const isPinned = dom.pinNote.checked;
  
  if (appState.editingNoteId) {
    // Update existing note
    const existingNote = appState.notes.find(n => n.id === appState.editingNoteId);
    if (existingNote) {
      updateNote({
        id: appState.editingNoteId,
        title,
        content,
        isPinned,
        categoryId: existingNote.categoryId,
        isFavorite: existingNote.isFavorite
      });
    }
  } else if (appState.activeCategory) {
    // Add new note
    addNote({
      title,
      content,
      isPinned,
      isFavorite: false,
      categoryId: appState.activeCategory.id
    });
  }
  
  closeModal('note-modal');
}

// Handle Confirm Delete
function handleConfirmDelete() {
  if (!appState.deleteInfo) return;
  
  const { type, id } = appState.deleteInfo;
  
  if (type === 'category') {
    deleteCategory(id);
  } else {
    deleteNote(id);
  }
  
  appState.deleteInfo = null;
  closeModal('delete-modal');
}

// Handle FAB Click
function handleFabClick() {
  if (appState.activeView === 'categories') {
    openCategoryModal();
  } else if (appState.activeView === 'notes' && appState.activeCategory) {
    openNoteModal();
  }
}

// Handle Search
function handleSearchCategories(e) {
  appState.searchQuery = e.target.value.toLowerCase();
  renderCategoriesGrid();
}

function handleSearchNotes(e) {
  appState.searchQuery = e.target.value.toLowerCase();
  renderNotesGrid();
}

// Handle Toggle Pin
function handleTogglePin() {
  if (appState.activeNote) {
    togglePinNote(appState.activeNote.id);
    
    // Update UI
    dom.togglePinBtn.innerHTML = appState.activeNote.isPinned ? 
      '<i class="ri-pushpin-fill"></i>' : 
      '<i class="ri-pushpin-line"></i>';
    
    dom.togglePinBtn.classList.toggle('active', appState.activeNote.isPinned);
  }
}

// Handle Toggle Favorite
function handleToggleFavorite() {
  if (appState.activeNote) {
    toggleFavoriteNote(appState.activeNote.id);
    
    // Update UI
    dom.toggleFavoriteBtn.innerHTML = appState.activeNote.isFavorite ? 
      '<i class="ri-star-fill"></i>' : 
      '<i class="ri-star-line"></i>';
    
    dom.toggleFavoriteBtn.classList.toggle('active', appState.activeNote.isFavorite);
  }
}

// Handle Edit Note
function handleEditNote() {
  if (appState.activeNote) {
    closeModal('view-note-modal');
    openNoteModal(appState.activeNote);
  }
}

// Handle Text Zoom In
function handleTextZoomIn() {
  if (appState.textZoomLevel < 5) {
    appState.textZoomLevel++;
    applyTextZoom();
    saveTextZoomLevel();
    showToast(`Text zoom: ${appState.textZoomLevel} of 5`);
  }
}

// Handle Text Zoom Out
function handleTextZoomOut() {
  if (appState.textZoomLevel > 1) {
    appState.textZoomLevel--;
    applyTextZoom();
    saveTextZoomLevel();
    showToast(`Text zoom: ${appState.textZoomLevel} of 5`);
  }
}

// Apply Text Zoom Style
function applyTextZoom() {
  const noteContent = dom.noteContentView;
  
  // Remove existing zoom classes
  noteContent.classList.remove('zoom-level-1', 'zoom-level-2', 'zoom-level-3', 'zoom-level-4', 'zoom-level-5');
  
  // Add the current zoom class
  noteContent.classList.add(`zoom-level-${appState.textZoomLevel}`);
}

// CRUD Operations for Categories
function addCategory(categoryData) {
  const timestamp = Date.now();
  const newCategory = {
    id: generateId(),
    name: categoryData.name,
    icon: categoryData.icon,
    color: categoryData.color,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  appState.categories.push(newCategory);
  saveCategories();
  
  // Show toast or notification
  showToast('Category created successfully');
  
  // Refresh UI
  renderUI();
  
  return newCategory;
}

function updateCategory(categoryData) {
  const index = appState.categories.findIndex(c => c.id === categoryData.id);
  if (index === -1) return;
  
  appState.categories[index] = {
    ...appState.categories[index],
    name: categoryData.name,
    icon: categoryData.icon,
    color: categoryData.color,
    updatedAt: Date.now()
  };
  
  saveCategories();
  
  // If this is the active category, update it
  if (appState.activeCategory && appState.activeCategory.id === categoryData.id) {
    appState.activeCategory = appState.categories[index];
  }
  
  // Show toast or notification
  showToast('Category updated successfully');
  
  // Refresh UI
  renderUI();
}

function deleteCategory(categoryId) {
  // Remove category
  appState.categories = appState.categories.filter(c => c.id !== categoryId);
  saveCategories();
  
  // Remove all notes in this category
  appState.notes = appState.notes.filter(n => n.categoryId !== categoryId);
  saveNotes();
  
  // Update active category if needed
  if (appState.activeCategory && appState.activeCategory.id === categoryId) {
    appState.activeCategory = null;
    setActiveView('categories');
  }
  
  // Show toast or notification
  showToast('Category deleted successfully');
  
  // Refresh UI
  renderUI();
}

// CRUD Operations for Notes
function addNote(noteData) {
  const timestamp = Date.now();
  const newNote = {
    id: generateId(),
    title: noteData.title,
    content: noteData.content,
    isPinned: noteData.isPinned,
    isFavorite: noteData.isFavorite,
    categoryId: noteData.categoryId,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  appState.notes.push(newNote);
  saveNotes();
  
  // Show toast or notification
  showToast('Note saved successfully');
  
  // Refresh UI
  renderNotesGrid();
  
  return newNote;
}

function updateNote(noteData) {
  const index = appState.notes.findIndex(n => n.id === noteData.id);
  if (index === -1) return;
  
  appState.notes[index] = {
    ...appState.notes[index],
    title: noteData.title,
    content: noteData.content,
    isPinned: noteData.isPinned,
    isFavorite: noteData.isFavorite,
    updatedAt: Date.now()
  };
  
  saveNotes();
  
  // If this is the active note, update it
  if (appState.activeNote && appState.activeNote.id === noteData.id) {
    appState.activeNote = appState.notes[index];
  }
  
  // Show toast or notification
  showToast('Note updated successfully');
  
  // Refresh UI
  renderNotesGrid();
}

function deleteNote(noteId) {
  // Remove note
  appState.notes = appState.notes.filter(n => n.id !== noteId);
  saveNotes();
  
  // If this is the active note, clear it
  if (appState.activeNote && appState.activeNote.id === noteId) {
    appState.activeNote = null;
  }
  
  // Show toast or notification
  showToast('Note deleted successfully');
  
  // Refresh UI
  renderNotesGrid();
}

// Toggle Note Pin Status
function togglePinNote(noteId) {
  const index = appState.notes.findIndex(n => n.id === noteId);
  if (index === -1) return;
  
  appState.notes[index].isPinned = !appState.notes[index].isPinned;
  appState.notes[index].updatedAt = Date.now();
  saveNotes();
  
  // If this is the active note, update it
  if (appState.activeNote && appState.activeNote.id === noteId) {
    appState.activeNote = appState.notes[index];
  }
  
  // Refresh UI
  renderNotesGrid();
}

// Toggle Note Favorite Status
function toggleFavoriteNote(noteId) {
  const index = appState.notes.findIndex(n => n.id === noteId);
  if (index === -1) return;
  
  // Toggle favorite status
  const wasFavorite = appState.notes[index].isFavorite;
  appState.notes[index].isFavorite = !wasFavorite;
  appState.notes[index].updatedAt = Date.now();
  saveNotes();
  
  // If this is the active note, update it
  if (appState.activeNote && appState.activeNote.id === noteId) {
    appState.activeNote = appState.notes[index];
  }
  
  // Show toast notification
  if (appState.notes[index].isFavorite) {
    showToast('Note added to favorites');
    
    // Navigate to favorites section when a note is favorited
    if (appState.activeView !== 'favorites') {
      // Close any open modals
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
      document.getElementById('modal-backdrop').classList.remove('active');
      
      // Navigate to favorites view
      setTimeout(() => {
        setActiveView('favorites');
      }, 300); // Small delay to allow toast to show first
    }
  } else {
    showToast('Note removed from favorites');
    
    // If we're in favorites view and removing a favorite, refresh the grid
    if (appState.activeCategory.id === 'favorites') {
      // Refresh the favorites view - need to rerender since the note will disappear
      setTimeout(() => {
        renderNotesGrid();
      }, 100); // Small delay to allow the UI to update first
    }
  }
  
  // Regular refresh for all other cases
  if (!(appState.activeCategory.id === 'favorites' && !appState.notes[index].isFavorite)) {
    renderNotesGrid();
  }
}

// Navigation
function setActiveView(view, category = null) {
  appState.activeView = view;
  
  if (view === 'categories') {
    dom.categoriesView.classList.remove('hidden');
    dom.notesView.classList.add('hidden');
    appState.activeCategory = null;
    appState.searchQuery = '';
    dom.searchCategories.value = '';
  } else if (view === 'notes') {
    dom.categoriesView.classList.add('hidden');
    dom.notesView.classList.remove('hidden');
    
    if (category) {
      appState.activeCategory = category;
    }
    
    appState.searchQuery = '';
    dom.searchNotes.value = '';
    
    // Render current category
    renderCurrentCategory();
  } else if (view === 'favorites') {
    // Show the notes view but with favorite notes only
    dom.categoriesView.classList.add('hidden');
    dom.notesView.classList.remove('hidden');
    
    // Create a special category for favorites
    appState.activeCategory = {
      id: 'favorites',
      name: 'Favorite Notes',
      icon: 'ri-star-fill',
      color: 'orange'
    };
    
    appState.searchQuery = '';
    dom.searchNotes.value = '';
    
    // Render favorites header
    renderCurrentCategory();
  } else if (view === 'settings') {
    // Create settings view if it doesn't exist
    if (!dom.settingsView) {
      createSettingsView();
    }
    
    // Show settings view
    dom.categoriesView.classList.add('hidden');
    dom.notesView.classList.add('hidden');
    dom.settingsView.classList.remove('hidden');
  }
  
  // Update active state in navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    const itemView = item.getAttribute('data-view');
    if (itemView === view) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Render the appropriate grid
  renderUI();
}

// Show Toast Notification
function showToast(message) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById('toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
    
    // Add styles to document if not already present
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary-600);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          z-index: 100;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s, transform 0.3s;
        }
        .toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .toast.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(1rem);
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Set message and show toast
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}

// Render Functions
function renderUI() {
  renderCategoriesList();
  
  if (appState.activeView === 'categories') {
    renderCategoriesGrid();
  } else if ((appState.activeView === 'notes' || appState.activeView === 'favorites') && appState.activeCategory) {
    renderNotesGrid();
  } else if (appState.activeView === 'settings') {
    renderSettingsView();
  }
}

// Create and render settings view
function createSettingsView() {
  // Create settings view if it doesn't exist yet
  if (!dom.settingsView) {
    dom.settingsView = document.createElement('div');
    dom.settingsView.id = 'settings-view';
    dom.settingsView.className = 'view hidden';
    dom.contentArea.appendChild(dom.settingsView);
  }
}

// Render settings content
function renderSettingsView() {
  if (!dom.settingsView) {
    createSettingsView();
  }
  
  dom.settingsView.innerHTML = `
    <h1 class="settings-title">Settings</h1>
    
    <div class="settings-section">
      <h2 class="settings-section-title">Appearance</h2>
      <div class="setting-row">
        <div class="setting-info">
          <h3 class="setting-title">Dark Mode</h3>
          <p class="setting-description">Toggle between light and dark theme</p>
        </div>
        <div class="setting-control">
          <button id="theme-toggle" class="toggle-btn ${appState.theme === 'dark' ? 'active' : ''}">
            <span class="toggle-slider"></span>
          </button>
        </div>
      </div>
      
      <div class="setting-row">
        <div class="setting-info">
          <h3 class="setting-title">Text Size</h3>
          <p class="setting-description">Adjust text zoom level for notes</p>
        </div>
        <div class="setting-control text-zoom-controls">
          <button id="text-zoom-out-btn" class="icon-btn" aria-label="Decrease text size">
            <i class="ri-subtract-line"></i>
          </button>
          <span id="text-zoom-level">${appState.textZoomLevel} of 5</span>
          <button id="text-zoom-in-btn" class="icon-btn" aria-label="Increase text size">
            <i class="ri-add-line"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2 class="settings-section-title">Data</h2>
      <div class="setting-row">
        <div class="setting-info">
          <h3 class="setting-title">Export Data</h3>
          <p class="setting-description">Export all your notes and categories as JSON</p>
        </div>
        <div class="setting-control">
          <button id="export-data-btn" class="btn">Export</button>
        </div>
      </div>
      
      <div class="setting-row">
        <div class="setting-info">
          <h3 class="setting-title">Clear Data</h3>
          <p class="setting-description">Delete all notes and categories (cannot be undone)</p>
        </div>
        <div class="setting-control">
          <button id="clear-data-btn" class="btn btn-danger">Clear All Data</button>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2 class="settings-section-title">About</h2>
      <div class="about-app">
        <p>Mohsin Notes v1.0</p>
        <p>A simple and powerful note-taking app for IT professionals.</p>
      </div>
    </div>
  `;
  
  // Add event listeners to the setting controls
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    toggleTheme();
    themeToggle.classList.toggle('active', appState.theme === 'dark');
  });
  
  const textZoomOutBtn = document.getElementById('text-zoom-out-btn');
  textZoomOutBtn.addEventListener('click', handleTextZoomOut);
  
  const textZoomInBtn = document.getElementById('text-zoom-in-btn');
  textZoomInBtn.addEventListener('click', handleTextZoomIn);
  
  const exportDataBtn = document.getElementById('export-data-btn');
  exportDataBtn.addEventListener('click', exportAppData);
  
  const clearDataBtn = document.getElementById('clear-data-btn');
  clearDataBtn.addEventListener('click', confirmClearData);
}

// Export app data as JSON file
function exportAppData() {
  const data = {
    categories: appState.categories,
    notes: appState.notes
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'mohsin-notes-export.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showToast('Data exported successfully');
}

// Confirm data clearing
function confirmClearData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    // Clear all data
    appState.categories = [];
    appState.notes = [];
    
    // Save empty data to localStorage
    saveCategories();
    saveNotes();
    
    // Generate initial sample data
    generateInitialData();
    
    // Show toast notification
    showToast('All data cleared and reset to default');
    
    // Navigate back to categories view
    setActiveView('categories');
  }
}

// Render Categories List (Sidebar)
function renderCategoriesList() {
  dom.categoriesList.innerHTML = '';
  
  appState.categories.forEach(category => {
    const categoryItem = document.createElement('a');
    categoryItem.href = '#';
    categoryItem.className = `category-item ${appState.activeCategory && appState.activeCategory.id === category.id ? 'active' : ''}`;
    categoryItem.setAttribute('data-category-id', category.id);
    
    const notesCount = getNotesCountByCategory(category.id);
    
    categoryItem.innerHTML = `
      <div class="category-left">
        <i class="${category.icon} color-${category.color}"></i>
        <span>${category.name}</span>
      </div>
      <span class="category-count">${notesCount}</span>
    `;
    
    categoryItem.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryObj = appState.categories.find(c => c.id === category.id);
      if (categoryObj) {
        setActiveView('notes', categoryObj);
        
        // Close sidebar on mobile if open
        if (dom.sidebar.classList.contains('sidebar-mobile-open')) {
          toggleSidebar();
        }
      }
    });
    
    dom.categoriesList.appendChild(categoryItem);
  });
}

// Render Categories Grid
function renderCategoriesGrid() {
  dom.categoriesGrid.innerHTML = '';
  
  // Filter categories based on search query
  const filteredCategories = appState.searchQuery ? 
    appState.categories.filter(cat => cat.name.toLowerCase().includes(appState.searchQuery)) : 
    appState.categories;
  
  if (filteredCategories.length > 0) {
    filteredCategories.forEach(category => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card animate-in';
      
      const notesCount = getNotesCountByCategory(category.id);
      
      categoryCard.innerHTML = `
        <div class="category-card-content">
          <div class="category-header">
            <div class="category-title-row" data-category-id="${category.id}">
              <div class="category-icon color-${category.color}">
                <i class="${category.icon}"></i>
              </div>
              <h2 class="category-title">${category.name}</h2>
            </div>
            <div class="category-actions">
              <button class="category-action-btn edit-btn" data-category-id="${category.id}" aria-label="Edit ${category.name}">
                <i class="ri-edit-line"></i>
              </button>
              <button class="category-action-btn delete-btn" data-category-id="${category.id}" aria-label="Delete ${category.name}">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
          <div class="category-footer">
            <div class="notes-count">${notesCount} notes</div>
            <a href="#" class="view-link" data-category-id="${category.id}">
              <span>View</span>
              <i class="ri-arrow-right-s-line"></i>
            </a>
          </div>
        </div>
      `;
      
      dom.categoriesGrid.appendChild(categoryCard);
      
      // Add event listeners
      // View category (title or view link)
      categoryCard.querySelector('.category-title-row').addEventListener('click', () => {
        const categoryObj = appState.categories.find(c => c.id === category.id);
        if (categoryObj) {
          setActiveView('notes', categoryObj);
        }
      });
      
      categoryCard.querySelector('.view-link').addEventListener('click', (e) => {
        e.preventDefault();
        const categoryObj = appState.categories.find(c => c.id === category.id);
        if (categoryObj) {
          setActiveView('notes', categoryObj);
        }
      });
      
      // Edit category
      categoryCard.querySelector('.edit-btn').addEventListener('click', () => {
        const categoryObj = appState.categories.find(c => c.id === category.id);
        if (categoryObj) {
          openCategoryModal(categoryObj);
        }
      });
      
      // Delete category
      categoryCard.querySelector('.delete-btn').addEventListener('click', () => {
        openDeleteConfirmation('category', category.id);
      });
    });
  } else {
    // No categories found
    renderEmptyState(
      dom.categoriesGrid, 
      'ri-folder-add-line',
      'No categories found',
      appState.searchQuery ? 
        `No categories match "${appState.searchQuery}". Try a different search term.` : 
        'Create your first category to get started organizing your notes.'
    );
  }
}

// Render Notes Grid
function renderNotesGrid() {
  dom.notesGrid.innerHTML = '';
  
  if (!appState.activeCategory) return;
  
  // Get notes based on active view
  let categoryNotes;
  
  if (appState.activeCategory.id === 'favorites') {
    // For favorites view, show all favorite notes from any category
    categoryNotes = appState.notes.filter(note => 
      note.isFavorite &&
      (appState.searchQuery ? 
        note.title.toLowerCase().includes(appState.searchQuery) || 
        note.content.toLowerCase().includes(appState.searchQuery) :
        true)
    );
  } else {
    // Get notes for current category and filter by search query
    categoryNotes = appState.notes.filter(note => 
      note.categoryId === appState.activeCategory.id &&
      (appState.searchQuery ? 
        note.title.toLowerCase().includes(appState.searchQuery) || 
        note.content.toLowerCase().includes(appState.searchQuery) :
        true)
    );
  }
  
  // Sort notes: pinned first, then by updated date
  const sortedNotes = categoryNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
  
  if (sortedNotes.length > 0) {
    sortedNotes.forEach(note => {
      const noteCard = document.createElement('div');
      noteCard.className = `note-card ${note.isPinned ? 'pinned' : ''} animate-in`;
      
      // Remove HTML tags for the preview
      const textContent = note.content.replace(/<[^>]*>/g, '');
      
      // Create note card
      noteCard.innerHTML = `
        ${note.isPinned ? '<div class="pin-indicator"><i class="ri-pushpin-fill text-xs"></i></div>' : ''}
        <div class="note-card-content" data-note-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <div class="note-actions">
              <button class="note-action-btn delete-btn" data-note-id="${note.id}" aria-label="Delete note">
                <i class="ri-delete-bin-line"></i>
              </button>
              <button class="note-action-btn pin-btn ${note.isPinned ? 'active' : ''}" data-note-id="${note.id}" aria-label="${note.isPinned ? 'Unpin note' : 'Pin note'}">
                <i class="${note.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}"></i>
              </button>
              <button class="note-action-btn favorite-btn ${note.isFavorite ? 'active' : ''}" data-note-id="${note.id}" aria-label="${note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="${note.isFavorite ? 'ri-star-fill' : 'ri-star-line'}"></i>
              </button>
            </div>
          </div>
          <p class="note-text">${textContent}</p>
          <div class="note-footer">
            <span>${formatDate(note.updatedAt)}</span>
          </div>
        </div>
      `;
      
      dom.notesGrid.appendChild(noteCard);
      
      // Add event listeners
      // View note
      noteCard.querySelector('.note-card-content').addEventListener('click', (e) => {
        if (!e.target.closest('.note-actions')) {
          const noteObj = appState.notes.find(n => n.id === note.id);
          if (noteObj) {
            openViewNoteModal(noteObj);
          }
        }
      });
      
      // Delete note
      noteCard.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteConfirmation('note', note.id);
      });
      
      // Pin/Unpin note
      noteCard.querySelector('.pin-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        togglePinNote(note.id);
      });
      
      // Favorite/Unfavorite note
      noteCard.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavoriteNote(note.id);
      });
    });
  } else {
    // No notes found
    renderEmptyState(
      dom.notesGrid, 
      'ri-file-add-line',
      'No notes found',
      appState.searchQuery ? 
        `No notes match "${appState.searchQuery}". Try a different search term.` : 
        'Create your first note by clicking the + button.'
    );
  }
}

// Render Current Category
function renderCurrentCategory() {
  if (!appState.activeCategory) return;
  
  dom.currentCategory.innerHTML = `
    <div class="current-category-icon color-${appState.activeCategory.color}">
      <i class="${appState.activeCategory.icon}"></i>
    </div>
    <h1 class="current-category-name">${appState.activeCategory.name}</h1>
  `;
}

// Render Empty State
function renderEmptyState(container, icon, title, message) {
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  
  emptyState.innerHTML = `
    <div class="empty-icon">
      <i class="${icon}"></i>
    </div>
    <h3 class="empty-title">${title}</h3>
    <p class="empty-message">${message}</p>
  `;
  
  container.appendChild(emptyState);
}

// Get notes count by category
function getNotesCountByCategory(categoryId) {
  return appState.notes.filter(note => note.categoryId === categoryId).length;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);