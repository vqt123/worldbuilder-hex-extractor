const { chromium } = require('playwright');

async function testFrontend() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to frontend
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of new layout
    await page.screenshot({ path: 'frontend-new-layout.png', fullPage: false });
    
    // Check for console errors and logs
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    // Test clicking "View with Hex Grid" button if it exists
    const hexGridButton = page.locator('button:has-text("View with Hex Grid")');
    if (await hexGridButton.isVisible()) {
      console.log('Clicking hex grid button...');
      await hexGridButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot with hex grid
      await page.screenshot({ path: 'frontend-hex-grid.png', fullPage: false });
    }
    
    // Check if images section exists
    const imagesSection = await page.locator('h2:has-text("Uploaded Images")').isVisible();
    console.log('Images section visible:', imagesSection);
    
    // Check if image items exist
    const imageItems = await page.locator('.image-item').count();
    console.log('Number of image items found:', imageItems);
    
    console.log('Console logs:', logs);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFrontend();