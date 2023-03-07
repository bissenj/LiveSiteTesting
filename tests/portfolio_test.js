const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const ec = webdriver.expectedConditions;

const chrome = require('selenium-webdriver/chrome')

// print process.argv
// process.argv.forEach(function (val, index, array) {
// 	console.log(index + ': ' + val);
// });

// Check to see if silent option was selected
let silent = false;
if (process.argv && process.argv[2]) {
	silent = (process.argv[2] == 'silent') ? true : false;		
}	



// Constants
const RUN_SILENT = silent;				// true = hide browser, false = show browser
const CHROME_BROWSER = 'chrome';
const FIREFOX_BROWSER = 'firefox';
const BROWSER = CHROME_BROWSER;

const WEBSITE = 'https://www.mountainsandcode.com';

let testCount = 0;
let errorCount = 0;
let driver = undefined;

if (BROWSER == CHROME_BROWSER) {	
	const chromeOptions = new chrome.Options();
	chromeOptions.addArguments('--start-maximized');
	if (RUN_SILENT) {
		chromeOptions.addArguments('--headless')			// runs silently (no browser pops up)
	}
	chromeOptions.excludeSwitches("enable-logging");		// disables unrelated warnings
		
	driver = new webdriver.Builder()
		.forBrowser(CHROME_BROWSER)
		.setChromeOptions(chromeOptions)
		.build();  
}
else {
	// Set up Firefox
	firefox = require('selenium-webdriver/firefox');
	const myoptions = new firefox.Options();
	myoptions.setBinary('C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe');

	driver = new webdriver.Builder()
		.forBrowser(FIREFOX_BROWSER)
		.setFirefoxOptions(myoptions)
		.build();  
}

// Navigate to website
driver.get(WEBSITE).then(() => {
	runTests(driver);
});

console.log('running tests...');

async function runTests(driver) {
	try {	
		// Check the title of the website to make sure we got there.
		await test_title(driver, 'Mountains and Code | Home');

		// Check the footer to make sure everything was loaded.
		await test_footer(driver);

		// Test menu link click
		await test_nav_click(driver);

		// Test the site map
		await test_sitemap_click(driver);

		// Test navigating to another page
		await test_career_navigation_click(driver);

		// Test clicking on the slider and navigating to a career page
		await test_slider_navigation_click(driver);

		// Wait a bit before closing browser
		await driver.sleep(3500);		
	}
	catch(ex) {
		console.error('Exception caught while running tests: ', ex.message);
	}

	// Test Summary
	console.log('-----------------');
	console.log('Total Tests: ', testCount);
	console.log('Total Failures: ', errorCount);
	console.log('-----------------');
	
	driver.quit();		// Close browser
}


// ----------------------------------------------------------------------------
//					TESTS 
// ----------------------------------------------------------------------------

/*
	Test: Check to make sure title of website is correct.
	Expected:  Website Page Title is present.
*/
async function test_title(driver, title) {
	try {
		const EXPECTED_TITLE = title;

		await driver.sleep(10).then(() => {
				driver.getTitle().then((title) => {
					writeToLog(`Title: ${title}`);	
					
					if (title.includes(EXPECTED_TITLE)) {
						testPassed();
					} else {
						throw new Error(`Expected title should be -${EXPECTED_TITLE}- but instead is -${title}-`);
				}			
			});		
		});
	}
	catch(ex) {
		handleError(driver, ex);
	}
}


/*
	Test:  Check to make sure footer is loaded
	Expected:  Footer text is found.
*/
async function test_footer(driver) {
	try {
		const EXPECTED_TEXT = 'MOUNTAINS AND CODE'
		const SELECTOR = 'footer';

		await driver.findElement(By.css(SELECTOR)).then(async (footer) => {		
			let text = await footer.getText()
									.then((result) => {
										// Replace new lines with spaces
										return result.replace(/(\r\n|\n|\r)/gm, " ")
									});

			writeToLog(`Footer Text: ${text}`);		
			if (text.includes(EXPECTED_TEXT)) {
				testPassed();
			}
			else {
				throw new Error(`Footer Text should be -${EXPECTED_TEXT}- but instead is -${text}-`);
			}		
		});
	}
	catch(ex) {
		handleError(driver, ex);
	}
}


/*
	Test: Simulate clicking on menu item
	Expected: Windows scrolls down page until the Career section. 
*/
async function test_nav_click(driver) {
	try {
		//writeToLog('begin test: test_menu_click');
		let scrollY = await driver.executeScript("return window.pageYOffset");
		writeToLog(`Scroll Position: ${scrollY}`);
		
		const SELECTOR = '.home-menu ul li:nth-child(3)';

		await driver.findElement(By.css(SELECTOR)).click();

		await driver.sleep(1000);		// wait until scroll is finished

		scrollY = await driver.executeScript("return window.pageYOffset");
		writeToLog(`Scroll Position: ${scrollY}`);

		if (scrollY && scrollY > 0) {
			testPassed();
		}
		else {
			throw new Error('Scroll Position is missing or not where it should be.');
		}	
	}
	catch(ex) {
		handleError(driver, ex);
	}		
}


/*
	Test:  Opening and closing the site map.
	Expected:  Site map opens, then closes.
*/
async function test_sitemap_click(driver) {
	try {	
		const SELECTOR = '#menutoggle';
		const EXPECTED_TITLE = 'Mountains and Code - Site Map';

		await driver.findElement(By.css(SELECTOR)).click();
		await driver.sleep(1000);		

		// Find the Title
		let title = await driver.findElement(By.css('#site-map .title'));
		let text = await title.getText();
		if (text != EXPECTED_TITLE) {
			throw new Error('Title is missing or incorrect text');
		}		
		
		await driver.sleep(1000);		

		// Close the site map
		await driver.findElement(By.css('.close-nav')).click();
		await driver.sleep(500);		
		let closeButton = await driver.findElement(By.css('.close-nav')).catch(() => { writeToLog('this is expected')});
		
		if (closeButton) {
			throw new Error('Site Modal did not close.');
		}

		// If we got here, everything is good.
		testPassed();

	}
	catch(ex) {
		handleError(driver, ex);
	}		
}


/*
	Test:  Opening the site map and navigating to the career page.
	Expected:  Site map opens, page move to career page.
*/
async function test_career_navigation_click(driver) {
	try {	
		const SITE_MAP_SELECTOR = '#menutoggle';
		const CAREER_NAV_SELECTOR = '#site-map .menu-container .menu-items-column .row:nth-child(3) a';
		const EXPECTED_TITLE = 'Career History - NWM';
		const EXPECTED_TITLE_2 = 'Career History in 6 questions - NAH';
		const EXPECTED_TITLE_3 = 'Mountains and Code | Home';
		
		await driver.findElement(By.css(SITE_MAP_SELECTOR)).click();
		await driver.sleep(2500);		
			
		
		// Navigate to career page
		await driver.findElement(By.css(CAREER_NAV_SELECTOR)).click();		
		await driver.sleep(3000);		

		// Validate the Title
		let title = await getDocumentTitle(driver);		
		if (title != EXPECTED_TITLE) {
			throw new Error(`Title -${EXPECTED_TITLE}- is missing or incorrect, got ${title} instead.`);
		}
		writeToLog('title on page 1 is good.');
		

		// Navigate to another career page
		await simulateClick(driver, '.footer-nav-item.right a', 2000);
		writeToLog('navigated to second career page.');

		// Validate the Title (now that we're on a new page)
		title = await getDocumentTitle(driver);		
		if (title != EXPECTED_TITLE_2) {
			throw new Error('Title on second page is missing or incorrect');
		}
		writeToLog('title on page 2 is good.');


		// Navigate Home		
		await simulateClick(driver, '.header a div', 2000);
		writeToLog('navigated back to home.');

		// Validate the Title (now that we're on a new page)
		title = await getDocumentTitle(driver);		
		if (title != EXPECTED_TITLE_3) {
			throw new Error('Title on third page is missing or incorrect');
		}
		writeToLog('title on home page is good.');

		// If we got here, everything is good.
		testPassed();

	}
	catch(ex) {
		handleError(driver, ex);
	}		
}



/*
	Test:  Clicking on slideshow and navigating to the career page.
	Expected:  Site map opens, page move to career page.
*/
async function test_slider_navigation_click(driver) {
	try {	
		const CONTROL_BOX_SELECTOR = '.control-box:nth-child(7)';
		const SLIDER_CLICK_SELECTOR = '#workHistorySlider1 .card:nth-child(6) .details .body p a';
		const EXPECTED_TITLE = 'Career History - Now';		
		const EXPECTED_TITLE_2 = 'Mountains and Code | Home';
		

		// Get the slider into view
		await simulateClick(driver, CONTROL_BOX_SELECTOR, 4000);

		// CLick on the slider link to go to the career page
		await simulateClick(driver, SLIDER_CLICK_SELECTOR, 4000);
		await driver.sleep(2500);		
						

		// Validate the Title
		let title = await getDocumentTitle(driver);		
		if (title != EXPECTED_TITLE) {
			throw new Error('Title is missing or incorrect');
		}
		writeToLog('title on page 1 is good.');
						

		// Navigate Home		
		await simulateClick(driver, '.header a div', 2000);
		writeToLog('navigated back to home.');

		// Validate the Title (now that we're on a new page)
		title = await getDocumentTitle(driver);		
		if (title != EXPECTED_TITLE_2) {
			throw new Error('Title on third page is missing or incorrect');
		}
		writeToLog('title on home page is good.');

		// If we got here, everything is good.
		testPassed();

	}
	catch(ex) {
		handleError(driver, ex);
	}		
}




// ----------------------------------------------------------------------------
// 					UTILITY FUNCTIONS 
// ----------------------------------------------------------------------------

function writeToLog(text) {
	console.log(`...${text}`)
}

function testPassed() {
	console.log(`Test ${++testCount} Passed`);
}

function testFailed(message = undefined) {
	errorCount++;
	console.error(`Test ${++testCount} Failed`);
	if (message) {
		console.error(`...Failure Details:`);
		console.error(`[`, message, ']');
	}		
}

function handleError(driver, error) {
	testFailed(error.message);

	driver.get(WEBSITE).then(() => {
		console.log('Navigated back to home.  Resuming tests...');
	});
}


// ----------------------------------------------------------------------------
// 					UTILITY WRAPPER FUNCTIONS 
// ----------------------------------------------------------------------------

async function getDocumentTitle(driver) {
	let result = "";
	await driver.getTitle().then((title) => {result = title});			
	return result;		
}


// This simulates a click by first moving to the item and then using selenium to click it.
async function simulateClick(driver, selector, delay) {
	// Move to the element
	const SCRIPT_COMMAND = `document.querySelector('${selector}').scrollIntoView()`;
	await driver.executeScript(SCRIPT_COMMAND);		
	await driver.sleep(1000);										// Potential timing issue here. Doesn't seem to work without this.
	
	// Click element
	await driver.findElement(By.css(selector)).click();		

	// Give UI some time to finish whatever it needs to do
	await driver.sleep(delay);	
}









