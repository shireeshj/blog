---
layout: post
title: "Demystifying Rails 7 System Tests: Configuring CI Pipeline"
tldr: 
modified: 2023-08-28 17:28:05 +0530
category: technology
tags: [Rails 7, System Tests, Integration Tests, CI-CD, Minitest, Capybara, Selenium, Selenium-webdriver, webdriver, webdrivers gem, chromedriver, arm64, amd64, linux, docker, gitlab-runner]
author: manish
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

In Rails 5.1 and later versions, system tests were introduced as a new type of test to simulate a user interacting with a web application. These tests use a headless browser, typically powered by Capybara and a WebDriver, to mimic a user's actions like clicking buttons, filling forms, and navigating through the application.

### **Why do we need System Tests?**

- <a href="https://guides.rubyonrails.org/testing.html#system-testing" target="_blank" style="color: blue;">System tests</a> let you test applications in the browser. Because system tests use a real browser experience, you can test all of your JavaScript easily from your test suite.
- Typically used for:
  <ul style="margin-left: 2rem">
  <li><strong>Acceptance testing:</strong> verify that the app has implemented a specific feature</li>
  <li><strong>Smoke testing:</strong> verify that the app is functional on a fundamental level and doesn't have code issues.</li>
  <li><strong>Characterization testing:</strong> is a type of software testing that involves examining and documenting the behavior of an existing system or application without making any modifications to its code</li>
  </ul>
<div style="margin-top: 2rem"></div>
### **How we can run System Test?**

- System Test interacts with your app via an actual browser to run them. 
- From a technical perspective, system tests aren't necessarily required to interact with a real browser; they can be set up to utilize the <a href="https://github.com/rack/rack-test" target="_blank" style="color: blue;">rack test</a> backend, which emulates HTTP requests and processes the HTML responses. While system tests based on rack_test run faster and more dependable than front-end tests involving an actual browser, they have notable limitations in mimicking a genuine user experience as they are incapable of executing JavaScript.

<div style="margin-top: 2rem"></div>
### **The Anatomy of a System Test?**
<div style="margin-bottom: 2rem"></div>

<img src="{{site.baseurl}}/images/system-test/flow-chart.png" width="425"/>
<div style="margin-bottom: 2rem"></div>

- **Minitest**
  <ul style="margin-left: 2rem">
  <li><a href="https://github.com/seattlerb/minitest" target="_blank" style="color: blue;">Minitest</a> is a small and incredibly fast unit testing framework.</li>
  <li>It provides the base classes for test cases.
    For Rails System Tests, Rails provides an ApplicationSystemTestCase base class which is in turn based on  <i>ActionDispatch::SystemTestCase:</i></li>
  </ul>
  {% highlight ruby %}
  require "test_helper"

  class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
    driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  end
  {% endhighlight %}

  <ul style="margin-left: 2rem">
  <li>In <code>ActionDispatch::SystemTestCase</code> we require the <code>capybara/minitest</code> library.</li>
  <li>It provides basics assertions like <strong>assert_equal, assert_nil, assert_same, assert_raises, assert_includes</strong>.</li>
  <li>A runner to run the tests and report on their success and failure.</li>
  </ul>

- **Capybara**

  <ul style="margin-left: 2rem">

    <li><a href="https://github.com/teamcapybara/capybara" target="_blank" style="color: blue;">Capybara</a> starts your app in a separate process before running the tests. This ensures that the tests are run against the correct version of your app.</li>
    <li>Capybara provides a high-level API that makes it easy to write tests in a natural way. For example, you can write a test that says <code>"click the button"</code> instead of having to write code to find the button and click it.</li>
    <li>Here is an example of a test written with Capybara's DSL (Domain Specific Language):</li>
  </ul>

  {% highlight ruby %}
  visit('/login')
  fill_in('email', with: 'user@example.com')
  fill_in('password', with: 'password')
  click_button('Login')
  {% endhighlight %}

- **Selenium-Webdriver**

  <ul style="margin-left: 2rem">
  <li>Capybara uses the <a href="https://rubygems.org/gems/selenium-webdriver/versions/4.11.0" target="_blank" style="color: blue;">Selenium Webdriver</a> library to interact with real browsers. Selenium WebDriver is a cross-platform library that provides a way to control web browsers from code. Capybara uses Selenium WebDriver to translate its high-level DSL (Domain Specific Language) into low-level commands that the browser can understand.</li>
  </ul>
  {% highlight ruby %}
  require "selenium-webdriver"

  driver = Selenium::WebDriver.for :firefox
  driver.navigate.to "http://google.com"

  element = driver.find_element(name: 'q')
  element.send_keys "Hello WebDriver!"
  element.submit

  puts driver.title

  Driver.quit
  {% endhighlight %}

  <ul style="margin-left: 2rem">
  <li>You can see how it’s a bit lower-level than the Capybara example further up. The selenium-webdriver library translates these calls into WebDriver Protocol, which it speaks to a webdriver executable.</li>
  </ul>


- **Webdriver Protocol**

  <ul style="margin-left: 2rem">

  <li>The Selenium WebDriver library translates its calls into the <a href="https://www.w3.org/TR/webdriver2/" target="_blank" style="color: blue;">WebDriver Protocol</a>. The WebDriver Protocol is a HTTP-based wire protocol that is used to communicate between the Selenium WebDriver library and the web browser.</li>
  <li>In order to start a chrome browser window and navigate to google.com. We need to startup geckodriver.</li>
  <li>We send it a <strong>“new session”</strong> command with a HTTP post request</li>
  </ul>
  {% highlight shell %}
  curl -X POST 'http://127.0.0.1:9515/session' -d '{"capabilities":{"firstMatch":[{"browserName":"firefox"}]}}'
  {% endhighlight %}

  <ul style="margin-left: 2rem">

  <li>This return a session id along with data</li>
  </ul>
  {% highlight shell %}
  { ... "sessionId":"f1776ba558e28309299dc5f62864e977" ... }
  {% endhighlight %}

  <ul style="margin-left: 2rem">

  <li>Then we make another post request with a session id. And url in data parameters</li>
  </ul>
  {% highlight shell %}
  curl -X POST 'http://127.0.0.1:9515/session/f1776ba558e28309299dc5f62864e977/url' -d '{"url": "https://google.com"}'
  {% endhighlight %}

- **Webdriver**
  <ul style="margin-left: 2rem">

  <li>Webdriver is a tool that speaks <strong>“Webdriver protocol”</strong> and controls the browser.</li>
  <li>Every major browser there is an associated webdriver tool. Chrome has <a href="https://sites.google.com/a/chromium.org/chromedriver/home" target="_blank" style="color: blue;">chromedriver</a>. Firefox has a <a href="https://github.com/mozilla/geckodriver" target="_blank" style="color: blue;">geckodriver</a>. MS Edge has <a href="https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/" target="_blank" style="color: blue;">edgedriver</a>. Safari has <a href="https://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari" target="_blank" style="color: blue;">safaridriver</a>.</li>
  <li>WebDriver tools act as servers: when you execute them, they start a persistent process that listens for HTTP requests until it is terminated.</li>
  </ul>
<div style="margin-bottom: 1rem"></div>

- **Webdrivers gem**
  <ul style="margin-left: 2rem">

  <li>Before selenium-webdriver 4.11, <a href="https://github.com/titusfortner/webdrivers" target="_blank" style="color: blue;">webdrivers</a> gem automatically determines which WebDriver executable needs to be downloaded for your platform and selected browser, downloads it, and arranges for that executable to be used by selenium-webdriver.</li>
  <li>From version 4.11, they have incorporated the functionality in selenium-webdriver gem using <a href="https://www.selenium.dev/blog/2023/whats-new-in-selenium-manager-with-selenium-4.11.0/" target="_blank" style="color: blue;">selenium-manager</a>.</li>

<img src="{{site.baseurl}}/images/system-test/webdriver.png" width="425"/>


<div style="margin-top: 2rem"></div>

### **Running Rails 7 System Tests with Docker and Gitlab Runner on Arm64 and Amd64 linux machines**
<div style="margin-top: 2rem"></div>

**Step 1: Prepare the Rails 7 application for testing**

- Run the command below to generate a very basic Ruby on Rails 7 app:

{% highlight shell %}
rails new minitest-rails-app
{% endhighlight %}

- Go ahead and open up the project in your favourite editor and proceed to the Gemfile, specifically to the test block:

  {% highlight ruby %}
  group :test do
    # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
    gem "capybara"
    gem "selenium-webdriver"
    gem "webdrivers"
  end
  {% endhighlight %}

- Next, let's do a quick scaffold generation to have something to work with:

  {% highlight shell %}
  rails generate scaffold Blog title:string body:text
  {% endhighlight %}

- Usually, generating a scaffold will automatically generate the `application_system_test_case.rb` and everything you need for the system tests

  {% highlight ruby %}
  application_system_test_case.rb (default) 
  
  require "test_helper"
  
  class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
    driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  end
  {% endhighlight %}

- Run the database commands
            

  {% highlight shell %}
  rails db:setup
  rails db:migrate
  {% endhighlight %}

- Running a Basic System For the First Time

  {% highlight shell %}
  rails test:system
  {% endhighlight %}

**Step 2: Exclude the gem webdrivers from the list of dependencies**
- Before selenium-webdriver 4.11, webdrivers gem automatically download webdriver executable.
- From version 4.11, they have incorporated the functionality in selenium-webdriver gem using selenium-manager.
- We can comment out the webdrivers line from Gemfile.
- After change, `Gemfile` looks like this
  {% highlight ruby %}
  group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem "capybara"
  gem "selenium-webdriver", "~> 4.11"
  #gem "webdrivers"
  end
  {% endhighlight %}

**Step 3: Point the Selenium-webdriver to use the firefox browser**
- As chrome has not released binary compatible with `linux/arm64` machine. So the test failed on the arm64 linux machine. I tried multiple approaches to make it work with headless_chrome, but didn’t work and commend the issue in details in this  <a href="https://github.com/titusfortner/webdrivers/issues/213#issuecomment-1686094017" target="_blank" style="color: blue;">issue tracker</a>
- We need to change the browser to the firefox.
  {% highlight ruby %}
  #application_system_test_case.rb (change driver to Firefox)
 
  require "test_helper"
  
  class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
    driven_by :selenium, using: :firefox, screen_size: [1400, 1400]
  end
  {% endhighlight %}

**Step 4: Prepare the docker image**

- Create `Dockerfile`

  {% highlight shell %}
  FROM ruby:3.1.2-slim-buster

  RUN apt-get update
  RUN apt-get -y install gnupg curl wget xvfb unzip

  ENV NODE_VERSION 19

  RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -  && \
  apt-get install --yes nodejs && \
  apt-get install --yes libxss1 libappindicator1 libindicator7 python2

  RUN apt-get update && \
  apt-get install --yes software-properties-common build-essential libssl-dev sqlite3 libsqlite3-dev pkg-config ca-certificates firefox-esr

  RUN apt-get install -y git-all
  RUN npm install yarn -g
  ADD . /data
  {% endhighlight %}

- This Dockerfile sets up an image with Ruby 3.1.2 and Node.js 19 installed. It installs system dependencies like Git, Yarn, various libraries for sqlite and Firefox.

- Build Docker image

  {% highlight shell %}
  docker buildx build -t dockermanishelitmus/systemtest-rails-app:latest1.0 . --platform linux/amd64,linux/arm64 --push
  {% endhighlight %}

- Command is building a Docker image using the buildx extension, targeting two different platforms (Intel/AMD 64-bit and ARM 64-bit), tagging the image as latest1.0, and pushing the resulting image to a container registry.

**Step 5: Prepare the gitlab-runner**

- In the project root directory create a file `.gitlab-ci.yml` with content

{% highlight yaml %}
image: "dockermanishelitmus/systemtest-rails-app:latest1.0"
services:
 - redis:latest
variables:
 RAILS_ENV: "test"

cache:
 paths:
   - vendor/ruby
   - node_modules/

before_script:
 - gem install bundler  --no-document
 - bundle config set force_ruby_platform true
 - bundle install
 - bin/rake db:drop
 - bin/rake db:setup
 - bin/rake db:migrate

stages:
 - tests

SystemTests:
 stage: tests
 script:
   - yarn install
   - bin/rake assets:precompile
   - bin/rails test:system
 artifacts:
   when: on_failure
   name: "$CI_JOB_NAME-$CI_COMMIT_REF_NAME"
   paths:
     - coverage/
   expire_in: 1 day
{% endhighlight %}

- Finally run your test suite

{% highlight shell %}
gitlab-runner exec docker SystemTests
{% endhighlight %}

- Output

{% highlight shell %}
  $ bin/rails test:system
  Running 4 tests in a single process (parallelization threshold is 50)
  Run options: --seed 13031

  # Running:

  Capybara starting Puma...
  * Version 5.6.7 , codename: Birdie's Version
  * Min threads: 0, max threads: 4
  * Listening on http://127.0.0.1:33385
  ....

  Finished in 7.865541s, 0.5085 runs/s, 0.5085 assertions/s.
  4 runs, 4 assertions, 0 failures, 0 errors, 0 skips
  Saving cache for successful job
  Creating cache SystemTests/main...
  WARNING: vendor/ruby: no matching files. Ensure that the artifact path is relative to the working directory
  node_modules/: found 2 matching files and directories
  No URL provided, cache will not be uploaded to shared cache server. Cache will be stored only locally.
  Created cache
  Job succeeded
{% endhighlight %}

### **Conclusion**

Now we have a setup that enables us to run system tests in both arm64 and amd64 linux machines with minimal customizations we may want to add. A few tips and tricks should help to get your first system tests up and running in CI pipeline.