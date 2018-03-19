const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  // run before all tests under
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('and using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Blog Title'); // add content to input
      await page.type('.content input', 'Blog Content');
      await page.click('form button'); // submit form
    });
    test('submitting takes user to a review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });
    test('submitting then saving adds blog to Blog index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card'); // with ajax click above we have to wait for content to render
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('Blog Title');
      expect(content).toEqual('Blog Content');
    });
  });

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button'); // click next to submit form
    });
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When user is not logged in', async () => {
  const actions = [
    { method: 'get', path: '/api/blogs' },
    {
      method: 'post',
      path: '/api/blogs',
      data: { title: 'title', content: 'content' }
    }
  ];

  test('Blog related actions are prohibited', async () => {
    // helper that runs  ajax resquests and returns array of results for each request
    const results = await page.execRequests(actions);
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
