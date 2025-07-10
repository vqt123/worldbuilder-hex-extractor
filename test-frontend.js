const { chromium } = require('playwright');

async function testFrontend() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Capture all console messages
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
    });
    
    // Capture network requests
    page.on('request', request => {
      if (request.url().includes('uploads/')) {
        console.log('REQUEST:', request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('uploads/')) {
        console.log('RESPONSE:', response.url(), response.status());
      }
    });
    
    // Navigate to frontend
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-1-initial.png', fullPage: false });
    console.log('Screenshot 1: Initial state taken');
    
    // Check if images section exists
    const imagesSection = await page.locator('h2:has-text("Uploaded Images")').isVisible();
    console.log('Images section visible:', imagesSection);
    
    // Check if image items exist
    const imageItems = await page.locator('.image-item').count();
    console.log('Number of image items found:', imageItems);
    
    // Test clicking "View with Hex Grid" button if it exists
    const hexGridButton = page.locator('button:has-text("View with Hex Grid")');
    const buttonVisible = await hexGridButton.isVisible();
    console.log('Hex grid button visible:', buttonVisible);
    
    if (buttonVisible) {
      console.log('Clicking hex grid button...');
      await hexGridButton.click();
      await page.waitForTimeout(3000); // Wait longer for image to load
      
      // Take screenshot after clicking button
      await page.screenshot({ path: 'debug-2-after-button-click.png', fullPage: false });
      console.log('Screenshot 2: After button click taken');
      
      // Check if canvas appeared
      const canvas = page.locator('canvas');
      const canvasVisible = await canvas.isVisible();
      console.log('Canvas visible:', canvasVisible);
      
      if (canvasVisible) {
        const canvasSize = await canvas.boundingBox();
        console.log('Canvas dimensions:', canvasSize);
        
        // Wait a bit more for image to load in canvas
        await page.waitForTimeout(2000);
        
        // Take screenshot before clicking canvas
        await page.screenshot({ path: 'debug-3-canvas-loaded.png', fullPage: false });
        console.log('Screenshot 3: Canvas loaded taken');
        
        console.log('Testing coordinate alignment with debugging...');
        
        // Test hex contribution system
        console.log('Testing hex contribution system...');
        console.log('Clicking on hex center to open contribution modal...');
        await canvas.click({ position: { x: 300, y: 300 } });
        await page.waitForTimeout(3000);
        
        // Take screenshot with contribution modal open
        await page.screenshot({ path: 'screenshots/contribution-modal-open.png', fullPage: false });
        console.log('Screenshot: Contribution modal open taken');
        
        // Check if contribution modal appeared
        const modalVisible = await page.locator('.modal-overlay').isVisible();
        if (modalVisible) {
            console.log('✅ Contribution modal opened successfully');
            
            // Fill out the contribution form
            console.log('Filling out contribution form...');
            await page.fill('input[name="contributorName"]', 'Test User');
            await page.fill('textarea[name="description"]', 'This is a test contribution for the hex contribution system. This area contains a mystical forest.');
            
            // Take screenshot with form filled
            await page.screenshot({ path: 'screenshots/contribution-form-filled.png', fullPage: false });
            console.log('Screenshot: Contribution form filled taken');
            
            // Submit the contribution
            console.log('Submitting contribution...');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            // Take screenshot after submission
            await page.screenshot({ path: 'screenshots/after-contribution-submitted.png', fullPage: false });
            console.log('Screenshot: After contribution submitted taken');
            
            // Click on the same hex again to test existing contribution display
            console.log('Testing existing contribution display...');
            await canvas.click({ position: { x: 300, y: 300 } });
            await page.waitForTimeout(2000);
            
            // Take screenshot showing existing contribution
            await page.screenshot({ path: 'screenshots/existing-contribution-display.png', fullPage: false });
            console.log('Screenshot: Existing contribution display taken');
            
            // Close modal
            await page.click('.close-button');
            await page.waitForTimeout(1000);
            
            // Take final screenshot showing visual indicators
            await page.screenshot({ path: 'screenshots/visual-indicators.png', fullPage: false });
            console.log('Screenshot: Visual indicators taken');
            
        } else {
            console.log('❌ Contribution modal did not open');
        }
        
        // Check if extraction result appeared (legacy test)
        const extractionSection = await page.locator('div:has-text("Extracted Hex Region")').isVisible();
        console.log('Extraction section visible:', extractionSection);
      }
    }
    
    console.log('All console logs:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFrontend();