---
layout: post
title: "Mastering Multi Tenant setup with rails - background jobs"
tldr: 
modified: 2024-05-05 12:39:14 +0530
category: technology
tags: [rails, multi-tenant, sidekiq, activejob]
author: nikhil
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share:
---

Welcome back to the Rails multi-tenant architecture series! If you're just joining in, be sure to check out Part 1, where you'll find an introduction to multi-tenancy and a detailed walkthrough on setting up a multi-tenant Rails application.

<a href="https://www.elitmus.com/blog/technology/mastering-multi-tenant-setup-with-rails-part-1/" target="_blank" style="color: blue;">Part 1</a>

#### **Quick Recap**
In the previous blog post, the focus was on delving into the concept of multi-tenancy in software design, with a specific emphasis on managing separate databases for each tenant. After exploring three types of multi-tenant application architectures, the post provided a step-by-step guide to setting up a multi-tenant Rails blog application. This included configuring databases for each tenant, implementing automatic connection switching in Rails 6, and using Nginx to run multiple databases simultaneously on different ports.

#### **Introduction**
In this blog post, the focus is on background job processing within a multi-tenant Rails environment. Specifically, it addresses the challenges of running background jobs across multiple databases and proposes solutions to ensure seamless execution of jobs.

#### **Sidekiq**
A popular background job processing library for Ruby. Here's a quick guide on how to set it up:

1. Add sidekiq( use > 6 version) in Gemfile. Follow <a href="https://github.com/sidekiq/sidekiq/wiki/Getting-Started" target="_blank" style="color:blue;">This Guide</a> for setup.
2. Create a sidekiq job `rails generate sidekiq:job multi_db_testing`

{% highlight ruby %}
# app/sidekiq/multi_db_testing_job.rb
class MultiDbTestingJob < ApplicationJob

  def perform
    p "Number of articles is #{Article.count}"
  end
end

{% endhighlight %}

##### **Running up application with sidekiq**
To start both the Rails server and Sidekiq, follow these steps:

1. Install foreman gem to start both rails server and sidekiq.
2. In Gemfile add `foreman` gem & run bundle install.
3. Create a Procfile to define the processes:

{% highlight ruby %}
# procfile
web: bin/rails server --binding=0.0.0.0 --port=3000 --environment=development
sidekiq: bundle exec sidekiq
{% endhighlight %}

##### **Triggering Background jobs**
Create a route and controller action to trigger the Sidekiq job:

{% highlight ruby %}
  # config/routes.rb
  resources :articles do
    collection do
      get :run_background_job
    end
  end

   # app/controllers/articles_controller.rb  def run_background_job
    MultiDbTestingJob.perform_later

    redirect_to root_path
  end

  # app/views/articles/index.html.erb
  <%= link_to "Run sidekiq job", run_background_job_articles_path %>
{% endhighlight %}

1. Start the server using `foreman start`
2. Navigate to http://localhost:3000, and trigger the job.
3. You'll notice that the job is executed, but it retrieves data only from the default database. why? Continue reading to find out the reason.

##### **Addressing the Database Connection Issue**
To ensure that background jobs access the correct database, we need to pass the database name as a parameter to each job and modify the job accordingly:

{% highlight ruby %}
# /app/controllers/articles_controller.rb
def run_background_job
  MultiDbTestingJob.perform_later(shard_name)

  redirect_to root_path
end

# /app/sidekiq/multi_db_testing.rb
class MultiDbTestingJob < ApplicationJob
  def perform(shard)
    ActiveRecord::Base.connected_to(shard: shard) do
      p "Number of articles in DB is #{Article.count}"
    end
  end
end
{% endhighlight %}

Now, you'll get the desired result for both databases.

However, this approach has its drawbacks:
1. For each background job, we need to pass an additional parameter.
2. We need to write additional code to connect to the correct database for each background job.

To address these issues, we can create a Sidekiq adapter that will decide which database to connect to based on the database that initiated the background job. But before creating the adapter, we need a global attribute to remember which database we are connected to. To achieve this, Rails `current_attributes` and Sidekiq `Middleware` will be utilized.

##### **Current Attributes**
From the definition of [Current Attributes](https://api.rubyonrails.org/classes/ActiveSupport/CurrentAttributes.html), *Abstract super class that provides a thread-isolated attributes singleton, which resets automatically before and after each request. This allows you to keep all the per-request attributes easily available to the whole system.*


{% highlight ruby %}
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :tenant
end

# app/controllers/application_controller.rb
before_action :setup_tenant

def setup_tenant
  tenants = Rails.application.config_for(:settings)[:tenants]
  current_tenant = tenants.keys.find { |key| tenants[key][:hosts].include?(request.env['HTTP_HOST']) } || :app1_shard
  Current.tenant = current_tenant.to_sym
end
{% endhighlight %}

**Note** - Sidekiq also introduced the `cattr` feature, this will help in persisting the value of current attributes when sidekiq job runs.
<a href="https://www.mikeperham.com/2022/07/29/sidekiq-and-request-specific-context/"  target="_blank" style="color: blue;">Read More</a>


##### **Sidekiq Middleware**
It is a set of customizable modules that intercept and augment the behavior of Sidekiq job processing in Ruby on Rails applications. <a herf="https://github.com/sidekiq/sidekiq/wiki/Middleware" target="_blank" style="color: blue;">Sidekiq Middleware</a>

#### **Creating adapter**

* Create file `config/initializers/sidekiq.rb` and paste following code.
  {% highlight ruby %}
    # config/initializers/sidekiq.rb
    require 'sidekiq'
    require 'sidekiq/web'
    require 'sidekiq/middleware/current_attributes'
    require_relative '../../app/middleware/sidekiq_adapter'

    Sidekiq::CurrentAttributes.persist('Current')

    Sidekiq.configure_server do |config|
      config.server_middleware do |chain|
        chain.add Middleware::SidekiqAdapter
      end
    end
  {% endhighlight %}

* Create file `app/middleware/sidekiq_adapter.rb` and paste following code.
  {% highlight ruby %}
    module Middleware
      class SidekiqAdapter
        include Sidekiq::ServerMiddleware

        def call(job_instance, job_payload, queue)
          shard = current_shard(job_payload)
          ApplicationRecord.connected_to(shard: shard, role: :writing) do
            yield
          end
        rescue StandardError => e
          p "Error occured #{e}"
        end

        def current_shard(job_payload)
          job_payload.try(:[], 'cattr').try(:[], 'tenant')&.to_sym
        end
      end
    end
  {% endhighlight %}

* With the middleware in place, we can simplify our Sidekiq job and remove the shard logic from it. The middleware will handle connecting to the correct shard.

{% highlight ruby %}
  # multi_db_testing_job.rb
  class MultiDbTestingJob < ApplicationJob
    def perform
      p "Number of articles in DB is #{Article.count}"
    end
  end


  # /app/controllers/articles_controller.rb
  def run_background_job
    MultiDbTestingJob.perform_later(shard_name)

    redirect_to root_path
  end
{% endhighlight %}

* Run the project again and subsqeuently run the sidekiq job to test it out.

##### **Code** - <a href="https://github.com/nikhilbhatt/rails-multi-db-tutorial/releases/tag/0.1.0" target="_blank" style="color: blue;">Github Link</a>

#### **Summary**
In this blog post, we tackled the challenge of background job processing in a multi-tenant Rails application. By leveraging Sidekiq and implementing a custom Sidekiq adapter middleware, we successfully addressed the issue of running background jobs across multiple databases. This solution provides a robust framework for handling background job execution in complex multi-tenant environments.

