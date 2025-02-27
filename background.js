// Core functionality for Smart Bookmark Organizer
// Developed by Rohit Karki

// Constants for bounds and configuration
const MAX_BOOKMARKS = 100;

// Function to extract website name from URL
function extractWebsiteName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    // Remove www. and everything after .com/.org/.net etc
    return hostname
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|edu|gov|io|co|me|app|dev).*$/, '')
      .replace(/\.[a-z]{2,3}$/, '')  // Remove country codes
      .split('.')[0]  // Take first part of remaining domain
      .charAt(0).toUpperCase() + hostname.slice(1);  // Capitalize first letter
  } catch (e) {
    return 'Other';
  }
}

// Comprehensive category patterns with detailed recognition
const categoryPatterns = {
  // Technology Categories
  'Tech - Programming': /programming|coding|developer|software engineering|git|github|stackoverflow/i,
  'Tech - Web Development': /web development|html|css|javascript|react|angular|vue|nodejs/i,
  'Tech - Mobile': /android|ios|mobile app|swift|kotlin|react native|flutter/i,
  'Tech - AI & ML': /artificial intelligence|machine learning|deep learning|neural network|data science|tensorflow|pytorch/i,
  'Tech - Cybersecurity': /security|encryption|cybersecurity|hacking|penetration testing|firewall|malware/i,
  'Tech - Cloud': /aws|azure|google cloud|cloud computing|serverless|docker|kubernetes/i,
  'Tech - Hardware': /hardware|cpu|gpu|processor|motherboard|arduino|raspberry pi/i,
  
  // Science Categories
  'Science - Physics': /physics|quantum|mechanics|relativity|particle|astronomy|cosmos/i,
  'Science - Chemistry': /chemistry|molecule|chemical|reaction|organic|inorganic|biochemistry/i,
  'Science - Biology': /biology|genetics|cell|organism|evolution|ecology|biodiversity/i,
  'Science - Mathematics': /mathematics|algebra|calculus|geometry|statistics|probability|theorem/i,
  'Science - Environmental': /environment|climate|sustainability|renewable|ecosystem|conservation/i,
  
  // Health Categories
  'Health - Fitness': /fitness|workout|exercise|gym|training|muscle|cardio/i,
  'Health - Nutrition': /nutrition|diet|food|healthy eating|vitamin|mineral|supplement/i,
  'Health - Mental Health': /mental health|psychology|therapy|meditation|mindfulness|stress|anxiety/i,
  'Health - Medical': /medical|disease|treatment|medicine|doctor|hospital|healthcare/i,
  'Health - Alternative': /alternative medicine|holistic|natural healing|herbal|acupuncture|ayurveda/i,
  
  // Business & Finance
  'Finance - Investment': /investment|stock|trading|portfolio|mutual fund|etf|dividend/i,
  'Finance - Cryptocurrency': /cryptocurrency|bitcoin|ethereum|blockchain|crypto|defi|nft/i,
  'Finance - Personal': /personal finance|budget|saving|retirement|tax|insurance|mortgage/i,
  'Business - Startup': /startup|entrepreneur|business plan|venture capital|funding|pitch/i,
  'Business - Marketing': /marketing|advertising|branding|seo|social media|content marketing/i,
  
  // Arts & Culture
  'Art - Visual': /art|painting|drawing|illustration|design|gallery|artist/i,
  'Art - Photography': /photography|camera|photo|lens|photographer|editing|lightroom/i,
  'Art - Music': /music|song|album|artist|band|concert|instrument/i,
  'Art - Film': /film|movie|cinema|director|actor|documentary|screenplay/i,
  'Art - Literature': /literature|book|novel|author|poetry|writing|publishing/i,
  
  // Entertainment
  'Entertainment - Gaming': /game|gaming|playstation|xbox|nintendo|steam|esports/i,
  'Entertainment - TV': /tv show|series|television|streaming|netflix|hulu|amazon prime/i,
  'Entertainment - Anime': /anime|manga|japanese animation|cosplay|otaku|studio ghibli/i,
  'Entertainment - Comics': /comics|marvel|dc|graphic novel|superhero|webcomic/i,
  
  // Sports
  'Sports - Football': /football|soccer|premier league|fifa|world cup|champions league/i,
  'Sports - Basketball': /basketball|nba|ncaa|slam dunk|lebron|jordan/i,
  'Sports - Baseball': /baseball|mlb|world series|batting|pitcher|home run/i,
  'Sports - Combat': /mma|ufc|boxing|wrestling|martial arts|jiu jitsu/i,
  'Sports - Racing': /racing|formula 1|nascar|motorsport|car race|grand prix/i,
  
  // Travel & Places
  'Travel - Adventure': /adventure|backpacking|hiking|camping|outdoor|expedition/i,
  'Travel - Luxury': /luxury travel|resort|spa|five star|gourmet|cruise/i,
  'Travel - Budget': /budget travel|hostel|cheap flight|backpacker|travel hack/i,
  'Travel - Cultural': /cultural travel|history|museum|architecture|ancient|heritage/i,
  
  // Food & Drink
  'Food - Recipes': /recipe|cooking|baking|kitchen|ingredient|meal prep/i,
  'Food - Restaurants': /restaurant|dining|cafe|bistro|eatery|food review/i,
  'Food - Wine & Spirits': /wine|beer|cocktail|spirits|brewery|distillery/i,
  'Food - Vegetarian': /vegetarian|vegan|plant based|organic|meat free/i,
  
  // Lifestyle
  'Lifestyle - Fashion': /fashion|clothing|style|outfit|designer|trend|wardrobe/i,
  'Lifestyle - Home': /home|interior|decoration|furniture|garden|diy|renovation/i,
  'Lifestyle - Pets': /pet|dog|cat|animal|veterinary|pet care|adoption/i,
  'Lifestyle - Parenting': /parenting|child|baby|family|education|pregnancy|kids/i,
  
  // Education & Career
  'Education - Online': /online course|mooc|e-learning|tutorial|certification|udemy|coursera/i,
  'Education - Language': /language|learning|english|spanish|french|duolingo|grammar/i,
  'Career - Job Search': /job|career|resume|interview|linkedin|recruitment|salary/i,
  'Career - Skills': /skill|professional|development|leadership|management|communication/i,
  
  // News & Current Events
  'News - Politics': /politics|government|election|policy|democracy|congress|parliament/i,
  'News - Technology': /tech news|gadget|innovation|startup news|digital|future/i,
  'News - Business': /business news|economy|market|industry|company|trade|stock market/i,
  'News - Science': /science news|discovery|research|breakthrough|study|journal/i,
  
  // Shopping
  'Shopping - Electronics': /electronics|gadget|smartphone|laptop|tablet|headphone/i,
  'Shopping - Fashion': /fashion shopping|clothes|shoes|accessories|jewelry|watch/i,
  'Shopping - Home': /home shopping|furniture|appliance|decor|kitchen|bedroom/i,
  'Shopping - Deals': /deal|discount|sale|coupon|offer|black friday|cyber monday/i,
  
  // Social
  'Social - Professional': /linkedin|networking|professional network|career network/i,
  'Social - Personal': /facebook|instagram|twitter|social media|friends|community/i,
  'Social - Dating': /dating|relationship|tinder|bumble|match|online dating/i,
  'Social - Forum': /forum|reddit|discussion|community|board|thread/i
};

// Utility function to validate data
function assertValid(condition, message) {
  if (!condition) throw new Error(message);
}

// Fetch bookmarks with a fixed upper bound
async function fetchBookmarks() {
  const bookmarks = await chrome.bookmarks.getTree();
  assertValid(bookmarks && bookmarks.length > 0, 'Invalid bookmark data');
  
  const flattened = [];
  
  function processNode(node) {
    if (flattened.length >= MAX_BOOKMARKS) return;
    
    if (node.url) {
      flattened.push({
        id: node.id,
        title: node.title,
        url: node.url
      });
    }
    
    if (node.children) {
      for (const child of node.children) {
        processNode(child);
      }
    }
  }
  
  processNode(bookmarks[0]);
  return flattened;
}

// Analyze content to determine category
async function analyzeContent(text) {
  assertValid(typeof text === 'string', 'Invalid content for analysis');
  
  // Check against all defined patterns
  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(text)) {
      return category;
    }
  }
  
  // If no category matches, return Unknown
  return 'Unknown';
}


// Encrypt bookmark data
async function encryptData(data) {
  assertValid(data && typeof data === 'object', 'Invalid data for encryption');
  
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  
  // Generate a secure key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  
  // Encrypt the data
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv),
    key: await crypto.subtle.exportKey('jwk', key)
  };
}

// Process bookmarks with encryption
async function processBookmarks(method = 'category') {
  try {
    console.log('=== Starting Bookmark Processing ===');
    const bookmarks = await fetchBookmarks();
    console.log(`Found ${bookmarks.length} bookmarks to process`);
    assertValid(bookmarks.length > 0, 'No bookmarks to process');
    
    const categorized = {};
    
    // Find existing main folder or create new one
    let mainFolder;
    const existingBookmarks = await chrome.bookmarks.search({title: 'Smart Organized Bookmarks'});
    
    if (existingBookmarks.length > 0) {
      mainFolder = existingBookmarks[0];
      console.log('Found existing Smart Organized Bookmarks folder');
      
      // Get existing category folders
      const existingFolders = await chrome.bookmarks.getChildren(mainFolder.id);
      existingFolders.forEach(folder => {
        categorized[folder.title] = { folderId: folder.id, bookmarks: [] };
        console.log(`Found existing category: ${folder.title}`);
      });
    } else {
      mainFolder = await chrome.bookmarks.create({
        title: 'Smart Organized Bookmarks'
      });
      console.log('Created new Smart Organized Bookmarks folder');
    }
    
    for (const bookmark of bookmarks) {
      console.log('\nProcessing bookmark:', {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url
      });
      
      // Determine category based on method
      let category;
      if (method === 'website') {
        category = extractWebsiteName(bookmark.url);
      } else {
        category = await analyzeContent(bookmark.title);
      }
      console.log(`Categorized as: ${category}`);
      
      if (!categorized[category]) {
        console.log(`Creating new category: ${category}`);
        
        // Create category folder if it doesn't exist
        const categoryFolder = await chrome.bookmarks.create({
          parentId: mainFolder.id,
          title: category
        });
        categorized[category] = { folderId: categoryFolder.id, bookmarks: [] };
      }
      
      // Move bookmark to category folder
      await chrome.bookmarks.move(bookmark.id, {
        parentId: categorized[category].folderId
      });
      categorized[category].bookmarks.push(bookmark);
    }
    
    console.log('\n=== Category Summary ===');
    Object.entries(categorized).forEach(([category, data]) => {
      console.log(`${category}: ${data.bookmarks.length} bookmarks`);
    });
    
    // Sort Unknown category alphabetically
    if (categorized['Unknown']) {
      const unknownBookmarks = categorized['Unknown'].bookmarks;
      unknownBookmarks.sort((a, b) => a.title.localeCompare(b.title));
      console.log('Sorted Unknown category alphabetically');
    }
    
    console.log('\nEncrypting categorized bookmarks...');
    const encrypted = await encryptData(categorized);
    await chrome.storage.local.set({ bookmarkData: encrypted });
    console.log('Encryption complete and data saved');
    
    return { success: true, categories: Object.entries(categorized).map(([category, data]) => ({
      name: category,
      bookmarks: data.bookmarks
    })) };
  } catch (error) {
    console.error('Error processing bookmarks:', error);
    return { success: false, error: error.message };
  }
}

// Function to check if a folder is empty with double verification
async function isEmptyFolder(folderId) {
  // First check
  let children = await chrome.bookmarks.getChildren(folderId);
  if (children.length > 0) return false;
  
  // Wait a brief moment and check again to ensure consistency
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Second check
  children = await chrome.bookmarks.getChildren(folderId);
  return children.length === 0;
}

// Function to clean up empty folders
async function cleanupEmptyFolders() {
  try {
    const mainFolder = (await chrome.bookmarks.search({title: 'Smart Organized Bookmarks'}))[0];
    if (!mainFolder) return;

    const categoryFolders = await chrome.bookmarks.getChildren(mainFolder.id);
    let deletedCount = 0;

    for (const folder of categoryFolders) {
      if (await isEmptyFolder(folder.id)) {
        await chrome.bookmarks.remove(folder.id);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} empty folders`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up empty folders:', error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processBookmarks') {
    (async () => {
      try {
        const result = await processBookmarks(request.method);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Will respond asynchronously
  } else if (request.action === 'cleanupEmptyFolders') {
    (async () => {
      try {
        const deletedCount = await cleanupEmptyFolders();
        sendResponse({ success: true, deletedCount });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Will respond asynchronously
  }
});