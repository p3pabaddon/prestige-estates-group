from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_content("<h1>Test</h1>")
    page.pdf(path="test.pdf")
    browser.close()
print("Playwright PDF OK")
