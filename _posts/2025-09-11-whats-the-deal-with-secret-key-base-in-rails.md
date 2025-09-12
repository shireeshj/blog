---
layout: post
title: "What's the deal with secret_key_base in Rails?"
tldr: 
modified: 2025-09-11 18:52:53 +0530
category: technology
tags: [rails,secrets,credentials]
author: kabir 
---
<br />
If you’ve spent any time with a Rails app, you’ve probably stumbled across this mysterious setting called `secret_key_base`. Maybe you saw it in `config/secrets.yml`, or like me, you were upgrading Rails, forgetting that credentials are the new norm and suddenly you saw something like this:


```ruby

Missing `secret_key_base` for 'production' environment, set this string with `bin/rails credentials:edit`

```

<div>
  <img src="{{site.baseurl}}/images/secret_key_base/secret_key_base.png" width="425"/>
</div>

--- 

### The short version of what it is:
`secret_key_base` is Rails’ way of keeping things safe. It’s a big, random string of characters that Rails uses under the hood to:

- Sign and verify cookies (so nobody can tamper with them).
- Encrypt and decrypt sensitive data.
- Make sure session data is legit and not forged.

Think of it as the master lock on your app. If someone gets hold of it, they could impersonate users or mess with your sessions. That’s why Rails treats it like a deal-breaker if the key isn’t set.

<br />

### Where does it come from?
In older Rails apps, you’ll see it inside `config/secrets.yml`:
```ruby

production:
  secret_key_base: <%= ENV["SECRET_KEY_BASE"] %>

```

In newer Rails versions, it’s usually stored in `config/credentials.yml.enc`. Either way, it usually gets pulled in from an environment variable. You don’t want this string hard-coded in your code. But guess which genius hard-coded it? ;)

<br />

### How do you get one?

Rails makes this easy. Just run: rails secret

You’ll get a nice long random string (128 characters). Copy that into your environment variable, and you’re good to go.

In developmentand test environments, even if you don’t run this command, a secret will be generated for you when you either start the server or the console.

You can find this generated file in `tmp/local_secret.txt`.

In a way this file is proof that Rails is looking for `config/credentials.yml.enc` and not `config/secrets.yml`. To override this, and to make Rails fetch this value from `secrets.yml`, just add the following in your application.rb:

```ruby

config.secret_key_base = Rails.application.config_for(:secrets)[:secret_key_base]

```

<br />

### To sum it up:
`secret_key_base` isn’t something you’ll deal with every day, but it’s quietly protecting your Rails app all the time. The good news is: once you set it up properly, you mostly forget about it, unless you’re upgrading to Rails 7 or 8 and you still want to continue using secrets.yml.
