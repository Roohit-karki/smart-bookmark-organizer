// Popup UI handler for Smart Bookmark Organizer
// Developed by Rohit Karki

document.addEventListener('DOMContentLoaded', async () => {
  const organizeButton = document.getElementById('organize');
  const organizeMethod = document.getElementById('organizeMethod');
  const categoriesDiv = document.getElementById('categories');
  const statusDiv = document.getElementById('status');
  const themeToggle = document.getElementById('themeToggle');

  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = savedTheme;

  // Theme toggle handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = `Switch to ${currentTheme === 'light' ? 'Light' : 'Dark'} Mode`;
  });

  // Set initial theme toggle button text
  themeToggle.textContent = `Switch to ${savedTheme === 'light' ? 'Dark' : 'Light'} Mode`;
  // Utility function to update UI
  function updateStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#d32f2f' : '#666';
  }

  // Display categorized bookmarks
  function displayCategories(categories) {
    categoriesDiv.innerHTML = '';
    
    Object.entries(categories).forEach(([category, data]) => {
      const div = document.createElement('div');
      div.className = 'category';
      div.innerHTML = `
        ${category}
        <span class="bookmark-count">${data.bookmarks.length} bookmarks</span>
      `;
      categoriesDiv.appendChild(div);
    });
  }

  // Load and display existing categories
  async function loadExistingCategories() {
    try {
      const mainFolder = (await chrome.bookmarks.search({title: 'Smart Organized Bookmarks'}))[0];
      if (!mainFolder) {
        updateStatus('No organized bookmarks found. Click Organize to start!');
        return;
      }

      const categoryFolders = await chrome.bookmarks.getChildren(mainFolder.id);
      const categorizedData = {};

      for (const folder of categoryFolders) {
        const bookmarks = await chrome.bookmarks.getChildren(folder.id);
        categorizedData[folder.title] = { bookmarks };
      }

      if (Object.keys(categorizedData).length > 0) {
        displayCategories(categorizedData);
        updateStatus('Current bookmark organization');
      } else {
        updateStatus('No organized bookmarks found. Click Organize to start!');
      }
    } catch (error) {
      updateStatus(`Error loading categories: ${error.message}`, true);
    }
  }

  // Load existing categories when popup opens
  await loadExistingCategories();

  // Handle organize button click
  organizeButton.addEventListener('click', async () => {
    try {
      organizeButton.disabled = true;
      updateStatus('Processing bookmarks...');

      const response = await chrome.runtime.sendMessage({ 
        action: 'processBookmarks',
        method: organizeMethod.value // Send the selected organization method
      });

      // Clean up empty folders after processing
      await chrome.runtime.sendMessage({ action: 'cleanupEmptyFolders' });
      
      if (response.success) {
        const categorizedData = {};
        response.categories.forEach(category => {
          categorizedData[category.name] = { bookmarks: category.bookmarks };
        });
        
        displayCategories(categorizedData);
        updateStatus('Bookmarks organized successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      updateStatus(`Error: ${error.message}`, true);
    } finally {
      organizeButton.disabled = false;
    }
  });
});