---
layout: post
title: "How to setup AWS Cloudwatch alarm for your SES reputation metrics"
tldr: 
modified: 2023-11-20 18:58:55 +0530
category: technology
tags: [AWS, AWS SES, AWS SNS, AWS Cloudwatch]
author: vikastiwari14
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

Amazon Simple Email Service (SES) is an email platform that offers a straightforward and cost-effective way for you to send and receive emails using your own email addresses and domains.

AWS SES has associated <a href="https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-email-deliverability-dashboard-bounce-complaint.html" target="_blank" style="color: blue;">reputation metrics (Bounce & Complaint rate)</a>, and if these metrics exceed the threshold limit, AWS may disable your email service, potentially causing a significant impact on your business.

Why not create an alarm that monitors these reputation metrics and notifies you when they approach the threshold value? This way, you can prevent email service downtime.

Fortunately, AWS provides a few services that, when combined, can help you easily set up the SES reputation metrics alarm.

![Alarm Architecture]({{site.baseurl}}/images/aws-cloudwatch-alarm-for-ses-monitoring/aws-cloudwatch-alarm-architecture.png)

**Amazon Simple Email Service**

  I recommend following <a href="https://www.sitepoint.com/deliver-the-mail-with-amazon-ses-and-rails/" target="_blank" style="color: blue;">deliver the mail with Amazon SES and Rails</a> 
  article to set up AWS SES for your Ruby on Rails application, as I'll be using Ruby on Rails as my backend language.

**Amazon Simple Notification Service**

  Amazon Simple Notification Service (SNS) is a web service that coordinates and manages message delivery from publishers to subscribers. You can learn more about it <a href="https://www.sitepoint.com/deliver-the-mail-with-amazon-ses-and-rails/" target="_blank" style="color: blue;">here</a>.

  We will configure SNS to send notifications to both an email address and an API endpoint in your backend server.

  - **Steps to create SNS topic**
    - Go to <a href="https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/dashboard" target="_blank" style="color: blue;"> AWS SNS dashboard</a> and click on the ***Create Topic*** button.
    - Select ***Standard*** as the type of topic.
    - Type a name for the topic. For example, ***ses-reputation-notifier***.
    - Click on ***Create topic*** button.

  - **Steps to create subscription for SNS topic**
    - Go to <a href="https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/dashboard" target="_blank" style="color: blue;"> AWS SNS dashboard</a> and click on the ***Create Subscription*** button.
    - Select the SNS topic you created from Topic ARN
    - Choose the protocol from the list of protocols.
      - **Email**
        - Select the ***Email*** protocol.
        - Enter your email in the endpoint.
        - You'll receive a subscription URL on your email. Visit this URL to subscribe to the SNS topic.
      - **HTTP/HTTPS**
        - We will configure the HTTP/HTTPS protocol after creating the public API endpoint in later part of the blog.

**Amazon Cloudwatch**

  Amazon CloudWatch monitors your Amazon Web Services (AWS) resources and the applications you run on AWS in real time. You can use CloudWatch to collect and track metrics, which are variables you can measure for your resources and applications. You can learn more about it <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" target="_blank" style="color: blue;">here</a>.

  For our SES reputation monitoring alarm, we'll require four alarms. Two will be for monitoring bounce rate, and two will be for monitoring complaint rate. We create two alarms for each reputation metric because the first alarm triggers when the reputation metric exceeds the threshold, and the second alarm triggers when the reputation metric returns to normal.

  **Steps to create alarm**
  - **1. Bounce rate (OK -> ALARM)**

    This alarm will activate when the Bounce rate surpasses the set limit. This transition will change the alarm state from ***OK*** to ***ALARM.***
      - Go to <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" target="_blank" style="color: blue;">AWS Cloudwatch</a> and click on ***Create alarm***.
      - Click on ***Select metrics*** and select ***SES > Account Metrics > Reputation.BounceRate*** and click on ***Select metrics***
      - Select ***1 hour*** from period dropdown.
      - Fill ***Define the threshold value*** with 0.05 (suggested by AWS).
      - Click on ***Additional configuration*** and from dropdown select ***Treat Missing data as Good***.
      - From ***Alarm state trigger*** select ***In alarm***.
      - From ***Send a notification to…*** select the SNS topic you created.
      - Type a name for the alarm. For example, ***bounce-rate-threshold-exceeded*** and click on ***Create alarm***.

  - **2. Bounce rate (ALARM -> OK)**

    This alarm will activate when the Bounce rate returns within the specified limit. This transition will change the alarm state from ***ALARM*** to ***OK***.
      - The procedure will be same for as for ***Alarm #1***.
      - Just ***OK*** will be selected for ***Alarm state trigger***.
      - Type a name for the alarm. for example, ***bounce-rate-threshold-inlimit***


  - **3. Complaint rate (OK -> ALARM)**

    This alarm will activate when the Complaint rate surpasses the set limit. This transition will change the alarm state from ***OK*** to ***ALARM.***
      - Go to <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" target="_blank" style="color: blue;">AWS Cloudwatch</a> and click on ***Create alarm***.
      - Click on ***Select metrics*** and select ***SES > Account Metrics > Reputation.ComplaintRate*** and click on ***Select metrics***
      - Select ***1 hour*** from period dropdown.
      - Fill ***Define the threshold value*** with 0.001 (suggested by AWS).
      - Click on ***Additional configuration*** and from dropdown select ***Treat Missing data as Good***.
      - From ***Alarm state trigger*** select ***In alarm***.
      - From ***Send a notification to…*** select the SNS topic you created.
      - Type a name for the alarm. For example, ***complaint-rate-threshold-exceeded*** and click on ***Create alarm***.


  - **4. Complaint rate (ALARM -> OK)**

    This alarm will activate when the Complaint rate returns within the specified limit. This transition will change the alarm state from ***ALARM*** to ***OK.***
      - The procedure will be same for as for ***Alarm #3***.
      - Just ***OK*** will be selected for ***Alarm state trigger***.
      - Type a name for the alarm. for example, ***complaint-rate-threshold-inlimit***

**API endpoint to receive POST request**

  You'll need an API endpoint to receive POST requests from AWS SNS.

  Create a file in `app > controllers > sns_notification_controller.rb`

  {% highlight shell %}
    class SnsNotificationController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_request

      def ses_reputation_notifier
        case message_body['Type']
        when 'SubscriptionConfirmation'
          Rails.logger.error(message_body['SubscribeURL'])
        when 'Notification'
          message = JSON.parse(message_body['Message'])

          alarm_active = message['NewStateValue'] == 'ALARM'
          // Your logic based on alarm status
        end

        head :ok
      end

      private

        def authenticate_request
          head :unauthorized if raw_post.blank? || !message_verifier.authentic?(raw_post)
        end

        def raw_post
          @raw_post ||= request.raw_post
        end

        def message_body
          @message_body ||= JSON.parse(raw_post)
        end

        def message_verifier
          @message_verifier ||= Aws::SNS::MessageVerifier.new
        end
    end
  {% endhighlight %}

  The code above uses the official <a href="https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/SNS/Client.html" target="_blank" style="color: blue;">AWS SNS SDK</a>.

  Add a route for the ***ses_reputation_notifier*** action in the ***sns_notification*** within the `config/routes.rb` file.

  {% highlight shell %}post '/ses_reputation_notifier', to: 'sns_notification#ses_reputation_notifier'{% endhighlight %}

  The API endpoint needs to be a public endpoint so that SNS can send notifications without requiring any token. Since it's a public endpoint, we need to verify the authenticity of the request to ensure it comes from SNS.

  There are two types of notifications sent by SNS:

  1. Subscription Confirmation
  2. Notifications

  Before being able to receive notifications, we must confirm the subscription by visiting the subscribeUrl sent in the request body. That's why we log the subscribeURL. Once you visit that URL, you'll be subscribed to the SNS topic. After subscription, you'll start receiving notifications.

  **Steps to create HTTP/HTTPS subscription for SNS topic**
  - Select ***HTTP*** or ***HTTPS*** protocol.
  - Enter the public API endpoint URL in the endpoint field. For example: ***https://your-domain/ses_reputation_notifier***
  - A POST request will be sent to the API endpoint, and the subscription URL will be logged (as specified in the code above). Visit this URL to confirm the subscription.

  Now, your SNS topic is configured to publish messages to the specified email and API endpoint.

**Conclusion**

Now that we've set up a CloudWatch alarm to monitor SES reputation metrics, it will notify both via email and API endpoint using SNS. With the notifications received by the server, you can ensure that any potential issues won't significantly impact the current flow.

**References**

1. AWS SES - <a href="https://www.sitepoint.com/deliver-the-mail-with-amazon-ses-and-rails/" target="_blank" style="color: blue;">Here</a> 
2. AWS SNS - <a href="https://aws.amazon.com/sns/" target="_blank" style="color: blue;">Here</a> 
3. AWS Cloudwatch - <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" target="_blank" style="color: blue;">Here</a> 
4. AWS SNS SDK (Ruby) - <a href="https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/SNS/Client.html" target="_blank" style="color: blue;">Here</a> 
5. Reputation monitoring alarms using CloudWatch - <a href="https://docs.aws.amazon.com/ses/latest/dg/reputationdashboard-cloudwatch-alarm.html" target="_blank" style="color: blue;">Here</a> 


