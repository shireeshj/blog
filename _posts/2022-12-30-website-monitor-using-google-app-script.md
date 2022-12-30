---
layout: post
title: "Website Monitor Using Google App Script"
tldr: 
modified: 2022-12-30 02:04:27 +0530
category: technology
tags: [google-app-script, uptime-monitor, website-status, upptime]
author: nikhil
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

Recently, I was looking for a solution to notify me when a website is down and when it is back up. I found a few solutions, but they all had a learning curve. So I thought of an alternative solution using Google App Script, which I had recently learned about.

**Requirements**
* Can run every 5 minutes.
* Can send emails when the website is down.
* Trustworthy.

I wasn't sure if the first requirement was possible with Google App Script, but the other two were. After reading the documentation, I found that it was possible to create a time-based trigger for a script.

**Steps to follow:**
* Create a new Google App Script project.
* Create a function to track the website. Here is an example:

{% highlight shell %}
function myFunction() {
   const initialUrls = [
     { uri: 'https://mock.codes/200', status: ''},
     { uri: 'https://mock.codes/500', status: ''}
   ];
 
 const properties = PropertiesService.getScriptProperties();
 let urls =  JSON.parse(properties.getProperty('URL_LIST')) || initialUrls;
 const errorResponseCodes = [500, 502, 503, 504];
 const alertEmail = 'alertmail@gmail.com';
 
 const options = { muteHttpExceptions: true };
 
 urls.forEach((url) => {
   let responseCode = UrlFetchApp.fetch(url.uri, options).getResponseCode();
 
   const isErrorResponse = errorResponseCodes.includes(responseCode);
   const wasPreviouslyDown = url.status === 'down';

   if (isErrorResponse && !wasPreviouslyDown) {
     // Site is now down for the first time
     const subject = `Alert: Your site ${url.uri} is currently down`;
     const body = `${url.uri} has encountered an error with status code ${responseCode}`;
     MailApp.sendEmail(alertEmail, subject, body);
     url.status = 'down';
   } else if (!isErrorResponse && wasPreviouslyDown) {
     // Site was previously down, but is now back up
     const subject = `Your site ${url.uri} is now back up`;
     const body = `${url.uri} has recovered and is now back up`;
     MailApp.sendEmail(alertEmail, subject, body);
     url.status = '';
   }
 });

 properties.setProperty('URL_LIST', JSON.stringify(urls));
}
{% endhighlight %}


* Go to the "Triggers" menu in the left sidebar of the Google App Script project.
* Click the "Add Trigger" button and select the function to run.
* Choose the options to run the trigger every 5 minutes and click "Save"

**Explanation**

This above code uses the UrlFetchApp service to make HTTP requests to the websites and check their status. it stores the value of each trigger in a variable so that whenver site goes live again it can send email of website backed up.

> You can also check the logs for each trigger execution in the "Execution" menu on the left side of the project.

![Email Sample]({{site.baseurl}}/images/website-monitor/email.jpg)

**Conclusion**

In conclusion, Google App Script is a useful tool for creating a customized website tracker that can notify the user when a website is down. The process of setting up the tracker is straightforward and the logs can be easily accessed to track the execution of the function. this basic functionality can be enhanced more to record the status in a csv file. also interesting graphs and charts can be made using that data.

**Additional investigations**

<a href="https://github.com/upptime/upptime" target="_blank" style="color: blue;">Upptime</a> is one of the good open-source alternative which can be used to monitor a website. it uses github actions to make sure the website is up and creates a issue if website is down for some reason. it also logs the information about the website speed. 
