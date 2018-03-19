const Page = require('./helpers/page');

let page;
// run before each test
beforeEach(async () => {
  page = await Page.build(); // custom helper to setup our page and broswer
  await page.goto('http://localhost:3000'); // still have to manually open page
});

// after each close browser
afterEach(async () => {
  await page.close(); // calls proxy browser.close()
});

test('Header has the correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo'); // custom method getContentsOf created helpers/page
  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('When logged in, shows logout button', async () => {
  await page.login(); // create new user and login -- doesnt save user??
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});
