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
        
        console.log('Clicking on hex grid canvas...');
        await canvas.click({ position: { x: 200, y: 200 } });
        await page.waitForTimeout(3000);
        
        // Take screenshot with extracted hex and coordinates
        await page.screenshot({ path: 'debug-4-after-canvas-click.png', fullPage: false });
        console.log('Screenshot 4: After canvas click taken');
        
        // Check if extraction result appeared
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