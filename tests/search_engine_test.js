const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

const chrome = require('selenium-webdriver/chrome')
 
// Constants
const CHROME_BROWSER = 'chrome';
const FIREFOX_BROWSER = 'firefox';
const BROWSER = CHROME_BROWSER;

const SEARCH_ENGINE = 'https://duckduckgo.com';
//const SEARCH_ENGINE = 'https://www.google.com';			// This will fail, use to test failure path
const SEARCH_TERM = 'selenium';

console.log('This is a change');

let driver = undefined;

if (BROWSER == CHROME_BROWSER) {	
	const chromeOptions = new chrome.Options();
	chromeOptions.addArguments('--start-maximized');
	chromeOptions.addArguments('--headless')				// runs silently (no browser pops up)
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

// Navigate to google
driver.get(SEARCH_ENGINE);
runTests(driver)
console.log('running tests...');

async function runTests(driver) {
	try {	
		// Enter some text
		await driver.sleep(3000).then(() => {
			driver.findElement(By.name('q')).sendKeys(SEARCH_TERM);
			console.log('got element');
		});	

		// Wait for results to return
		await driver.sleep(2000).then(() => {
			driver.findElement(By.name('q')).sendKeys(webdriver.Key.TAB);  
			console.log('entered keys: ', SEARCH_TERM);
		});	
		
		await driver.findElement(By.id('search_button_homepage')).click();
		console.log('click search');


		await driver.sleep(2000).then(() => {
			driver.getTitle().then((title) => {
				console.log('Title: ', title);	
				
				if (title.includes(SEARCH_TERM)) {
					console.log('Test passed');
				} else {
					console.log('Test failed');
				}			
			});		
		});
	}
	catch(ex) {
		console.error('Exception caught while running tests: ', ex.message);
	}

	driver.quit();		// Close browser
}






