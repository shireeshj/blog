---
layout: post
title: "My Experience as a Summer Intern at eLitmus: Building a Telegram Bot"
tldr: 
modified: 2023-07-14 15:18:53 +0530
category: technology
tags: [Rails,Telegram bot]
author: Mahesh
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

# Introduction:

As a summer intern at eLitmus, I had the opportunity to work on an exciting project that involved building a Telegram Bot. In today's digital era, effective communication channels play a crucial role in connecting businesses with their stakeholders. eLitmus, a talent-tech platform, identified the need for a two-way communication channel between the platform and candidates. To achieve this, Telegram bots were chosen as the ideal starting point. This blog post will delve into the Telegram Bot Integration project.

# How it Began:

The project started with the idea of leveraging the Telegram platform as a communication channel between eLitmus and its candidates. The goal was to create a two-way communication channel, enabling candidates to access information, receive updates, and engage in various activities through Telegram bots. This opened up possibilities for automating communication, collecting data, running quizzes, and providing valuable services to candidates.

# Design:

Before diving into development phase, thorough planning and design are crucial. I begin by defining the core functionalities of the Telegram bots. I discovered that creating a bot through Bot Father (Telegram's official bot) was the standard approach. As I was tasked with implementing the project using Ruby on Rails, I focused on two key aspects: developing the Telegram bot and designing the Admin panel.
Designing such an application involves three key aspects: architecture design, database design, and UI/UX design. Let's dive into each of these parts in more detail:

  *	**Architecture** : The Telegram bots interact with users through messages and commands. Users can access FAQs, participate in quizzes, and receive responses based on their interactions with the bots. The bots handle user inputs, validate quiz answers, and provide feedback and results accordingly. An intuitive admin panel is developed using Ruby on Rails to facilitate easy management of the bots' functionalities. The admin panel allows administrators to add, update, and delete FAQs, quizzes, and other content. It also provides insights and analytics related to user engagement and bot usage.
  *	**Database**: The project utilizes a MySQL database to store and manage data related to users, FAQs, quizzes, quiz attempts, analytics, and other relevant information. The database schema is designed to efficiently store and retrieve data, ensuring optimal performance.

  *	**UI/UX**:  To ensure a visually appealing and user-friendly Telegram bot interface, I delved into various UI options and explored the best ways to present information and interact with users. This research helped me identify the most effective strategies for creating an engaging and intuitive bot interface. And for the Admin panel, I took the initiative to design the entire interface using Figma. By visualizing the layout, components, and functionalities, I was able to ensure a cohesive and user-friendly experience for administrators managing the bots' functionalities. Figma provided a powerful toolset for creating wireframes, mock-ups, and interactive prototypes, allowing me to iterate and refine the design before implementation.

# Development:

  Before starting this project, I had experience developing mobile applications, and most of them followed the Model-View-Template (MVT) pattern for backend, such as Django. However, for this project, I needed to learn and work with Ruby on Rails, which follows the Model-View-Controller (MVC) architectural pattern. Fortunately, my previous experience with backend development made it easier for me to understand Rails, and within the first two weeks, I was able to develop the basic functionalities of both the FAQ and Quiz bots.

  I focused on refining the functionalities and user flow of the bots, particularly in the context of the Telegram channels. The FAQ bot is connected to the Telegram channel, and when a user posts a question in the channel's comment section, it gets stored in the database. The admin can then view and answer the question, which is sent back to the user personally through Telegram. Additionally, users can access the FAQ bot to view existing FAQs and request the addition of new ones.

  ## FAQ bot flow
  <table>
    <tr>
      <td>
      <img src="../images/telegram-bot/faqbot.png" width="425"/>
      </td>
      <td>
        <img src="../images/telegram-bot/faqbot1.png" width="425"/> 
      </td>
    </tr>
    <tr>
      <td>
      <img src="../images/telegram-bot/faqbot2.png" width="425"/>
      </td>
      <td>
        <img src="../images/telegram-bot/faqbot3.png" width="425"/> 
      </td>
    </tr>
  </table>

  ## Quiz bot flow
  <table>
    <tr>
      <td>
      <img src="../images/telegram-bot/quizbot.png" width="425"/>
      </td>
      <td>
        <img src="../images/telegram-bot/quizbot1.png" width="425"/> 
      </td>
    </tr>
  </table>
      <img src="../images/telegram-bot/quizbot2.png" width="425"/>

  On the other hand, the admin panel allows the admin to create quizzes and questions. These quizzes are then posted in the Telegram channel, with a button redirecting users to the Quiz bot. Users can access multiple quizzes and attempt them through the bot.

  By developing these functionalities, I was able to establish a seamless flow for users, ensuring they can interact with the bots and access relevant information easily. The admin panel provides the necessary tools for managing FAQs, quizzes, and user interactions, allowing for efficient administration and engagement with the users.

  In the Admin panel, I implemented the design that I had previously created using Figma. The Admin panel offers various functionalities to enhance the administration and management of the Telegram bots. Here are some key features of the Admin panel:

  * **User Management**: The Admin panel allows the admin to view active users and access individual user data. This includes information about the user's activities, quiz attempts, and questions asked through the bot.

  * **FAQ Management**: The Admin can view and manage the FAQs. They have the ability to add, edit, or remove FAQs as needed. Additionally, the Admin can track the number of reads by users, providing insights into the popularity and relevance of different FAQs.

  *	**Quiz Management**: The Admin can create quizzes and manage them within the Admin panel. They can add questions, set options, and define correct answers. The Admin also has access to the responses of the quizzes, allowing them to analyze individual question analytics and gain insights into user performance.

  *	**Analytics**: The Admin panel provides analytics on user activities related to both the FAQ and Quiz bots. The Admin can view data such as the number of attempts per day, week, month, or year, as well as the number of FAQ reads per day, week, month, or year. These analytics help the Admin understand user engagement and make data-driven decisions.

  *	**Post Management**: The Admin can utilize the post section in the Admin panel to create and publish posts in the Telegram channel directly from Telegram. This feature streamlines the process of sharing content and updates with users in the channel.

  ## Admin Panel
  <img src="../images/telegram-bot/admin-panel.png"/>


  By incorporating these functionalities into the Admin panel, I ensured that the administrative tasks associated with managing the Telegram bots were streamlined and efficient. The panel provides comprehensive control and insights, empowering the admin to effectively manage user interactions, content, and analytics.


# Challenges Faced:

  Working with 3rd party API's is one of the most challenging task and that is the challenging task of the project using telegram bot API. I could able to use telegram api to minimal amount of data of user, for example I couldn't able to get users contact details, and I have crossed this challenge by finidng a feature of telegram that is by using permissions to access user details and request user to send the mobile number and location, but I couldn't able to get location from the web or laptop. The biggest challenge I have faced is to setup graphs and charts to display analytics of the data collected throught the telegram. This literally took me a week long to set up and work on analytics.

# Conclusion:

  In summary, working on this project presented its fair share of challenges. However, with perseverance and problem-solving skills, I was able to overcome these obstacles and achieve success. It was a valuable learning experience that helped me improve my abilities and reach my goals. By embracing challenges as opportunities for growth and staying committed to the project's vision, I was able to develop the Telegram bots and the Admin panel effectively. Overall, this project was a rewarding journey that expanded my knowledge and skills in web development.