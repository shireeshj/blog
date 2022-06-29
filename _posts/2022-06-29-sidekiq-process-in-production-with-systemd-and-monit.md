---
layout: post
title: "Sidekiq process in production with Systemd and Monit"
tldr: 
modified: 2022-06-29 08:10:37 +0530
category: technology
tags: [Sidekiq, Monit, Systemd]
author: manish
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

Recently, we have upgraded our Sidekiq version from 5.2 to 6.5. Before Sidekiq 6.0 we were managing the Sidekiq process directly using Monit. With the release of Sidekiq 6, the team has removed the **daemonization, logfile, and pidfile command line arguments and sidekiqctl binary**.  Managing services manually is more error-prone, let our operating system do it for us.
We have three options to go with systemd, upstart, and foreman. We decided to go ahead with the systemd.

#### **Systemd**
[Systemd](https://wiki.debian.org/systemd#systemd_-_system_and_service_manager) is a system and service manager for linux. Systemd tasks are organized as units. Most common units are services(.service), mount points(.mount), devices(.device), sockets(.socket), or timers(.timer)

#### **Systemctl**
The systemctl command is a utility which is responsible for examining and controlling the systemd system and service manager.

#### **Sidekiq**
Simple, efficient background processing for Ruby.


### **Sidekiq running as Systemd Service**

<ol>
<li>
To manage Sidekiq we need to create a service file for Sidekiq which can be used to start, stop or restart the Sidekiq process.
{% highlight shell %}
Sudo nano /lib/systemd/system/sidekiq.service
{% endhighlight %}

</li>
<li>
Content in the Sidekiq.service. Sidekiq has provided us with the template for the service file here <a href="https://github.com/mperham/sidekiq/blob/main/examples/systemd/sidekiq.service">Sidekiq.service</a>. We modified it according to our use case
{% highlight shell %}
[Unit]
Description=sidekiq
After=syslog.target network.target

[Service]

Type=simple
# If your Sidekiq process locks up, systemd's watchdog will restart it within seconds.
#WatchdogSec=10

WorkingDirectory=/opt/myapp/current

ExecStart=/usr/local/bin/bundle exec sidekiq -C /opt/myapp/shared/config/sidekiq.yml -e production
ExecStop=/bin/kill -TSTP $MAINPID
ExecStartPost=/bin/sh -c '/bin/echo $MAINPID > /opt/myapp/shared/pids/sidekiq.pid'
ExecStopPost=/bin/sh -c 'rm /opt/myapp/shared/pids/sidekiq.pid'

User=deploy
Group=deploy
UMask=0002

# Greatly reduce Ruby memory fragmentation and heap usage
# https://www.mikeperham.com/2018/04/25/taming-rails-memory-bloat/
Environment=MALLOC_ARENA_MAX=2

# if we crash, restart
RestartSec=10
Restart=on-failure

# output goes to /var/log/syslog (Ubuntu) or /var/log/messages (CentOS)
StandardOutput=syslog
StandardError=syslog

# This will default to "bundler" if we don't specify it
SyslogIdentifier=sidekiq

[Install]
WantedBy=multi-user.target
{% endhighlight %}

</li>
<li>
  Our Modified Configurations:
  <ul>
    <li>
      As we were using system ruby and using Sidekiq with some custom configurations. To start Sidekiq we used.

{% highlight shell %}
ExecStart=/usr/local/bin/bundle exec sidekiq -C /opt/myapp/shared/config/sidekiq.yml -e production
{% endhighlight %}
    </li>

    <li>
    To stop Sidekiq we need to send a TSTP signal to process all the busy jobs before terminating Sidekiq.

{% highlight shell %}
ExecStop=/bin/kill -TSTP $MAINPID
{% endhighlight %}
    </li>
    <li>
    For Managing with Monit we need the process id, After starting or stopping the service we were maintaining the process id file.

{% highlight shell %}
ExecStartPost=/bin/sh -c '/bin/echo $MAINPID > /opt/myapp/shared/pids/sidekiq.pid'
ExecStopPost=/bin/sh -c 'rm /opt/myapp/shared/pids/sidekiq.pid'
{% endhighlight %}
    </li>
    <li>
    As we want to use our app user to run this service.

{% highlight shell %}
User=deploy
Group=deploy
UMask=0002
{% endhighlight %}
    </li>

    <li>
    And we want to restart only when there is a failure.


{% highlight shell %}
# if we crash, restart
RestartSec=10
Restart=on-failure
{% endhighlight %}
    </li>
  </ul>
</li>
<li>
Reload the systemctl daemon for the new created service
{% highlight shell %}
Sudo systemctl daemon-reload
{% endhighlight %}
 
</li>
<li>
 Now we can start the Sidekiq service:

{% highlight shell %}
sudo systemctl start|stop|restart sidekiq
{% endhighlight %}
</li>
</ol>

### **Monitor Sidekiq process with Monit**

Now we have systemd to start, stop and restart the Sidekiq process. Now we will look at how to monitor the Sidekiq process with the help of monit.

#### **Monit**

Monit is a utility for managing and monitoring processes, programs, files, directories and filesystems on a Unix system.

<ol>
<li>
Modified monitrc
{% highlight shell %}
check process sidekiq with pidfile "/opt/myapp/shared/pids/sidekiq.pid"
  start program = "/bin/bash -l -c  'sudo systemctl start sidekiq' as uid deploy and gid deploy"
    with timeout 20 seconds
  stop program  = "/bin/bash -l -c  'sudo systemctl stop sidekiq' as uid deploy and gid deploy"
    with timeout 20 seconds
  if totalmem is greater than 800 MB for 3 cycles then restart
  if changed pid then exec "/etc/monit/slack_notifier.sh"
  if cpu is greater than 65% for 2 cycles then exec "/etc/monit/slack_notifier.sh" else if succeeded then exec "/etc/monit/slack_notifier.sh"
{% endhighlight %}
</li>
<li>
We can check if sidekiq is up and running:

{% highlight shell %}
sudo monit summary sidekiq
{% endhighlight %}
</li>
</ol>

Monit will check the Sidekiq process and it will automatically start in case of the unexpected kill of the Sidekiq process.

We have successfully completed the Sidekiq process monitoring with the help of Monit and Systemd.



