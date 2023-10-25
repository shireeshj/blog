---
layout: post
title: "Puma: From Daemonization to Process Control with Systemctl and Monit"
tldr: 
modified: 2023-10-21 21:06:27 +0530
category: technology
tags: [puma,daemon,systemctl,monit,rails]
author: nikhil
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

Puma is a popular Ruby web server that is known for its speed and scalability. It has undergone significant changes in recent versions(starting 5.0.0). One of the most notable alterations is the removal of the daemonization feature. But what does it mean?

Daemonization, in the context of web servers, is a process that allows a program to run in the background as a system service. In older versions, Puma made it simple for users to daemonize their processes with a straightforward configuration snippet:

{% highlight shell %}
#config/puma.rb
daemonize
{% endhighlight %}

However, in recent versions, attempting to use the `daemonize` code will result in an error, as this functionality has been removed from the  codebase.

#### **Why daemonization should not be part of gem?**
Incorporating daemonization directly within a gem can lead to undesirable consequences: as explained by Mike Parham in a <a href="https://www.mikeperham.com/2014/09/22/dont-daemonize-your-daemons/" target="_blank" style="color: blue;">Blog Post</a>. Here are some key points that should be considered -
1. **Complexity**: Adding daemonization features to a gem can make its code more complex and challenging.
2. **Maintenance**: The responsibility of maintaining daemonization, automatic restart, and similar core features becomes an additional burden.
3. **Efficiency**: System processes are better equipped to manage tasks like daemonization. Delegating this function to the system ensures more efficient and reliable execution, rather than embedding it within the gem.

As a result of these considerations, Puma decided to remove the daemonization feature from the gem.

This decision led us to make some changes in our setup to ensure the smooth running of our applications.

#### **Using Systemd**

We had previously implemented daemonization for <a href="https://www.elitmus.com/blog/technology/sidekiq-process-in-production-with-systemd-and-monit" target="_blank" style="color: blue;">Sidekiq</a>, which was a process similar to Puma's needs. Although there were some minor adjustments required for Puma. Here are steps to achieve daemnization through systemctl:

<ol>
  <li>Remove <code>daemonization</code> from config/puma.rb file</li>
  <li>
    Create a file in <code>/lib/systemd/system/puma.service</code>. Below is sample systemd service configuration example, modify it according to your needs.

    {% highlight shell %}
      [Unit]
      Description=Puma HTTP Server
      After=network.target

      [Service]
      Type=notify
      User=username

      WorkingDirectory=/dir/path
      ExecStart=/bin/pumactl start -F /path/puma_config --environment env
      ExecStartPost=/bin/sh -c '/bin/echo $MAINPID > /usr/myapp/shared/pids/puma.pid'
      ExecStop=/bin/kill -TSTP $MAINPID

      RestartSec=10
      Restart=on-failure

      [Install]
      WantedBy=multi-user.target
    {% endhighlight %}
  </li>
  <li>
    Two prominent Puma restart strategies are Phased and Hot restarts. <strong>Phased restarts are slower but ensure that all workers finish their existing requests before restarting the server, while Hot restarts are faster but come with increased latency during the restart.</strong> <br/>
    To initiate Puma with a phased restart, you can pass the <code>phased-restart</code> option. This choice offers flexibility to adapt Puma's behavior according to specific needs. More about puma restarts <a href="https://github.com/puma/puma/blob/master/docs/restart.md" target="_blank" style="color: blue;">Here</a>.
  </li>
  <li>
    <strong>Monit configurations</strong><br/>

    Monit is a utility for managing and monitoring processes, programs, files, directories and filesystems on a Unix system <a href="https://mmonit.com/monit/" target="_blank" style="color: blue;">Monit Docs</a>. <br/>

    Updated <code>monitrc</code> file
    {% highlight shell %}
    check process puma with pidfile "/usr/myapp/shared/pids/puma.pid"
      start program = "/bin/bash -l -c 'sudo systemctl start puma'" with timeout 20 seconds
      stop program = "/bin/bash -l -c 'sudo systemctl stop puma'" with timeout 20 seconds
      if totalmem is greater than 800 MB for 3 cycles then restart
      if cpu is greater than 65% for 2 cycles then exec "/etc/monit/slack_notifier.sh" else if succeeded then exec "/etc/monit/slack_notifier.sh"
    {% endhighlight %}
  </li>
  <li>
    To check if puma is running correctly follow the commands.

    {% highlight shell %}
    ps aux | grep puma
    sudo monit summary
    {% endhighlight %}
  </li>
</ol>
#### **Exploring Other Alternatives**

As alternative to this we considered using <a href="https://github.com/kigster/puma-daemon/)  gem. it copied the removed code and maintained a separate gem" target="_blank" style="color: blue;">puma-daemon</a> gem, which essentially replicated the removed code and maintained it in a separate gem. However, after careful consideration, we chose not to adopt this alternative for the following reasons:

1. Violation of system standards.
2. Additional gem and maintainence burden.

#### **Summary**
While the removal of daemonization from Puma may require some adjustments, it aligns with the best practices of modern web server management Managing processes at the system level, using tools like systemd and Monit, is considered a more efficient and maintainable approach. Daemonizing processes within application code is discouraged, as it's a task that falls under the system level. Ultimately, the shift towards system-level process management ensures the stability and efficiency of web applications.
