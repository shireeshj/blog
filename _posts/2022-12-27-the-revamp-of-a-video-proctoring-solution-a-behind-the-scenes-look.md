---
layout: post
title: "The revamp of a Video Proctoring Solution: A Behind-the-Scenes Look"
tldr: 
modified: 2022-12-27 12:33:45 +0530
category: technology
tags: [proctoring, live proctoring, remote proctoring, eLitmus proctoring, 100ms, webRTC]
author: manish
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---
***The story of how we took a good platform and made it even better***

![Protcoring Dashboard]({{site.baseurl}}/images/revamp-of-proctoring-solution/proctoring-dashboard.png)

For the past few months, the number of test takers and clients at eLitmus has increased significantly. Conducting all of these tests remotely poses a significant challenge in terms of preventing cheating. To address this issue, eLitmus has developed an in-house solution using the open-source Kurento media server. While this solution has been effective in terms of recording videos, it is not horizontally scalable.

In search of a more effective solution, eLitmus turned to Amazon Kinesis and worked with the AWS team to conduct a proof-of-concept. While this approach allowed for live proctoring, it was not possible to record the exams.

As I was learning about WebRTC and Amazon Kinesis during this time, I had the opportunity to attend a session by a company called 100ms. This company is focused on solving problems related to live conferencing, and I was eager to learn more about their approach.

After connecting with the co-founder of 100ms, Ankit Behera, I received a message from their salesperson to schedule a demo call. During the call, we determined that 100ms could be a potential solution for eLitmus' scalability problem. However, we needed to weigh the costs of maintaining engineering time and effort to maintain the solution against the opportunity cost of using that time to build a new product, as well as overall server and bandwidth costs.

Based on this analysis, we decided to proceed with a proof-of-concept for live remote proctoring. I spent the next week working on the proof-of-concept and was able to complete it successfully. From there, we saw potential synergies between 100ms and eLitmus and decided to make the product an open-source platform.

I created a document outlining the requirements for the video proctoring solution, including features such as a proctoring dashboard, candidate tests screen, cheating analysis and verification dashboard, admin dashboard, and auto proctoring. For the first version (v0.1), we planned to roll out the proctoring dashboard with multiple streams visible to the proctor, storage of the video stream on an s3 server, retrieval of the video stream in the cheating analysis and verification dashboard, and admin configuration.

After outlining the requirements for the video proctoring solution, I designed the architecture for the solution, diagrammatically representing how all of the components would be connected. The main components of the app were the 100ms server API, the eLitmus server, and the candidate or proctor's browser.

Next, I created a [milestone](https://github.com/elitmus/knights-watch/milestone/1) on Github and listed out the issues that needed to be addressed, including the integration of the proctor dashboard, candidate test screen, algorithm for assigning candidates and proctors to rooms, and storage of videos on the eLitmus prescribed directory structure on an s3 server.

![Milestone]({{site.baseurl}}/images/revamp-of-proctoring-solution/milestone.png)

I began working on these issues and was able to roll out the v0.1 of the proctoring solution within a few weeks. During this time, our team encountered various challenges and suggested various features to 100ms.

As we worked on storing videos on an s3 server in our prescribed directory structure, we encountered a challenge with the 100ms API. The webhook provided by 100ms was only for the composite recording of the room, not for individual recordings. However, we needed webhooks to notify us of the success of each individual recording. In addition, 100ms had the functionality for only a single webhook per account, but we needed to support multiple environments with multiple applications within a single account. We requested this feature from 100ms.

While working on an algorithm to assign candidates and proctors to rooms, I faced the challenge of storing authentication tokens in the user's browser and in Redis storage in production. I wrote an algorithm to handle the expiration of tokens from both ends and to handle multiple events.

As we configured 100ms for various environments including staging, production, and edge, we encountered several issues and suggested various features to 100ms. These included the ability to delete apps and templates from the 100ms dashboard from the front-end, team management options in the dashboard, and handling of access keys and secrets for multiple environments.

After completing the first version (v0.1) of the video proctoring solution, we were ready to test it in production. eLitmus was conducting an internal hiring event at the time, and we used the live video proctoring feature for this event with around 400 candidates. The event went smoothly, with minor issues. The proctor was able to hear the voices of the candidates and all of the videos were recorded throughout the session.

This success gave us confidence in the solution, and we made some minor tweaks. However, our main concern from the start had been scalability, and we wanted to test the solution at a larger scale. We had an in-person test at IITK with over 600 candidates, and decided to conduct the event with live proctoring. The event went smoothly, but the next day we conducted data analysis and discovered that 14 out of 600+ videos had some data loss or were not recorded.

We had a meeting with 100ms to discuss this issue, and after working with their engineering team, we determined that the issue was caused by network connectivity problems. We fixed the issue and the proctoring solution became more stable, with 97% of the videos being recorded.

After this event, we had discussions with 100ms about pricing and suggested various features, including pricing on the 100ms dashboard itself and the option to opt-in or opt-out of composite recording and browser-based recording.

After making the video proctoring solution an open-source project, I focused on documenting the project so that it could be used by others in the community and more developers could contribute to it. I wrote several documents, including a readme file, information on the architecture and prerequisites, installation guidelines, development guidelines, deployment guidelines, a code of conduct, and guidelines for contributing and welcoming new contributors.

In conclusion, the development of the video proctoring solution at eLitmus was a challenging but rewarding process. By identifying a need to solve the problem of vertical scalability, we were able to explore various solutions and ultimately choose 100ms as a partner to help us build a scalable and effective video proctoring platform. Through the development process, we encountered various challenges and were able to work closely with the 100ms team to find solutions and improve the stability of the platform. We are proud to have made the video proctoring solution an open-source project and to have contributed to the community by documenting the project and welcoming new contributors. We hope that others will find this project useful and will be able to build upon it to create even better solutions in the future.
