---
layout: post
title: "Fixing Capybara Flaky Tests"
tldr: 
modified: 2022-12-20 00:21:23 +0530
category: technology
tags: [capybara,rails,system-tests,flaky]
author: nikhil
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

When writing system tests for a user interface, it is common to encounter test cases that fail randomly. One of the common failure can occur when the JavaScript on a page takes time to render, causing issues with the test case.

For example, imagine a test case that clicks a button on a page and then checks for the presence of certain content after the click.

**Demo Code**
```
visit submit_page
click_on 'Submit'
assert page.has_content 'Some content after clicking on submit'
```

In most cases, this test will run without any issues. However, occasionally the test may fail on the third line with the error "Expected false to be truthy". This error can occur when the page is visited and the JavaScript on the page takes a few seconds to load. During this time, the submit button may be clicked, but because there is no JavaScript associated with the button yet, the button click does not do anything. As a result, the test is still on the submit page when it tries to assert that the expected content is present, causing the test to fail.

**Solution**

One solution to this problem is to increase the `wait_time` setting in capybara. However, this approach has several limitations. First, the wait_time setting is global and applies to all test cases, so if it is set to a high value, it will increase the overall execution time of the test suite. Additionally, the wait_time setting only waits for a fixed amount of time before moving on with the test, without checking whether the page has finished loading. This means that if the page takes longer to load than the wait_time

The other solution is to use the `execute_script` method provided by Capybara to click the button instead of the `click_on` method. The execute_script method allows you to execute JavaScript code within the context of the current page. By using this method to click the button, the click action is added to the end of the browser's call stack. This means that the click action will be executed after any existing JavaScript code on the page has finished running, ensuring that the button is fully initialized and ready to be interacted with before the test tries to click it.

To use the execute_script method to click the button, you can use the following code:

```
page.find_button('Submit').execute_script('this.click()')
```

This way we can ensure that click method will run only after the page javascript is fully loaded.

**Browser Call Stack**

```
          |               |
          |               |
          |   JavaScript  |  <-- existing code on the page(1)
          |_______________|
          |               |
          |   JavaScript  |  <-- existing code on the page(2)
          |_______________|
          |               |
          |  click action |  <-- added by execute_script method(3)
          |_______________|
```