---
layout: post
title: "Building a Frontend Scoring Engine: Automating Frontend Evaluation"
tldr:
modified: 2023-07-21 20:17:46 +0530
category: technology
tags: [frontend development, evaluation, automation, testing, coding]
author:
image:
  feature:
  credit:
  creditlink:
comments:
share:
---

The frontend scoring engine is a powerful tool designed to assess the frontend skills of candidates based on code quality, responsiveness, and functionality. It aims to streamline the evaluation process for frontend development by automating the assessment of code quality, best practices, and functionality.

## **What you'll learn from this blog**

In this blog, we will dive into the technical aspects of building a frontend scoring engine.

- The need for frontend scoring engine in today's technology landscape.
- The technical requirements gathering and Research phase involved.
- Generation of Test script for Test automation using Puppeteer.
- Dockerizing the Application.
- Features and Process of building the application.

## **Need for the Frontend Scoring Engine**

In today's technology-driven world, the demand for skilled frontend developers is at an all-time high. With the rapid evolution of web applications and user interfaces, companies are constantly seeking talented individuals who can create visually appealing, intuitive, and responsive frontend experiences. However, evaluating frontend development skills can be a complex and time-consuming task. This is where a frontend scoring engine comes into play Automating the Evaluation Process, Measurement of Code Quality and Ensuring Mobile Responsiveness. By allowing users to input HTML, CSS and JavaScript code, and generating scores based on predefined test cases, the scoring engine provides a comprehensive evaluation of candidates' frontend skills.

## **Research Work**

Before starting the implementation of the frontend scoring engine project, extensive research was conducted to understand the need for such a system, evaluate existing systems, explore testing tools, and plan the evaluation process. This research phase played a crucial role in shaping the project and ensuring its successful execution. Let's take a brief look on highlight and the key areas of research conducted during the project's inception.

1. **Evaluating Existing Systems** :
   To gain insights into the existing solutions available in the market, a comprehensive evaluation of similar systems was conducted. Various frontend scoring engines, online code editors were explored to understand their features, functionalities, strengths, and weaknesses. This evaluation provided valuable insights that influenced the design decisions and feature set of the new scoring engine. <br>
   Some similar existing systems:

   - [Codier.io](https://codier.io/)
   - [Frontend Mentor](https://www.frontendmentor.io/)
   - [CSS Battle](https://cssbattle.dev/)
   - [Algoexpert.io Frontend](https://www.algoexpert.io/frontend/product)<br>

2. **Testing Tools and Technologies** :
   During our research, we explored various testing tools and technologies to find the perfect fit for executing test cases, assessing code quality, and evaluating frontend functionalities. The evaluation revolved around factors like capabilities, ease of use, and compatibility with our project requirements. Tools such as Selenium, Cypress, Jest, csslint, eslint were taken into consideration.<br>
   Read more about the tools:

   - [Selenium](https://www.selenium.dev/documentation/)
   - [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
   - [Jest](https://jestjs.io/docs/getting-started)<br>

3. **Puppeteer** :
   Puppeteer was chosen over Selenium primarily due to its compatibility with Docker and its ability to control headless Chrome or Chromium instances. Docker provides an efficient and scalable environment for running tests, and Puppeteer seamlessly integrates with Docker containers. Additionally, Puppeteer offers a more modern and concise API, making it easier to write test scripts and perform browser automation tasks.

   - [Puppeteer vs Selenium](https://oxylabs.io/blog/puppeteer-vs-selenium)
   - [Puppeteer Docs](https://pptr.dev/)<br>

4. **Docker Integration** :
   We explored the benefits of Docker, a widely-used containerization platform, and discovered how it could greatly enhance our project. Docker allows us to create lightweight, portable, and isolated containers, which provide a consistent and reproducible environment. Leveraging Docker, we encapsulated and ran our scoring engine, testing tools, and other dependencies, ensuring seamless integration and efficient execution. <br>
   We pulled various Docker images from Docker Hub, enabling us to set up the required tools effortlessly.

   - [eslint](https://hub.docker.com/r/eeacms/csslint)
   - [csslint](https://hub.docker.com/r/cytopia/eslint)
   - [jest](https://hub.docker.com/r/cfreak/jest)<br>

5. **Real-Time Code Editor** :
   To provide a user-friendly and real-time code editing experience, we started searching for frontend code editors and existing projects available on GitHub. Various code editor projects were evaluated, and their source code were studied to understand the implementation details. This research helped in selecting the most suitable code editor framework and implementing it within our frontend scoring engine. <br>

   - [Codepen](https://codepen.io/)
   - [Fronteditor](https://www.fronteditor.dev/)
   - [CodeG](https://github.com/Prince-Codemon/Code-G-The-Coding-Playground-)<br>

6. **Problem Statement and Test Case Creation** :
   The goal was to design problem statements that accurately reflect real-world frontend development challenges and create test cases that thoroughly evaluate candidates' code. Puppeteer test scripts were written to simulate user interactions, perform assertions, and capture screenshots for image comparison using the PixelMatch JavaScript library.<br>

7. **Cloud Deployment and Infrastructure** :
   For our final Deployment and integrtion Amazon Web Services (AWS) was choosen. The research covered various AWS services, including EC2 instances for hosting the scoring engine, S3 for storage, and other relevant services for infrastructure setup. The deployment process, security considerations, and scaling options were thoroughly explored to ensure a robust and scalable deployment architecture.<br>

## **Application Flowchart**

![Application Architecture]({{site.baseurl}}/images/frontend-scoring-engine/frontend_scoring_engine_architecture.png)
<br>

## **Test Script Generation**

In the frontend scoring engine, we ensure evaluation of user-submitted HTML, CSS, and JavaScript code by subjecting it to comprehensive testing against predefined test cases. These tests are designed to assess the code quality, functionality, and adherence to best practices, providing a total assessment of candidates' frontend development skills. By conducting these thorough evaluations, we can accurately determine the proficiency of developers in creating efficient and reliable frontend solutions. Throughout this section, you'll get an overview of the various types of tests performed, explaining their significance in evaluating code quality and functionality.

- **Heading/Element Testing**
  This test focuses on ensuring the presence and correctness of specific HTML elements within the user's code. Test cases are designed to check if required headings, such as h1, h2, p or specific elements identified by ID or class, are present. The purpose of this test is to assess the structure and semantic correctness of the user's HTML code.

- **CSS Properties Testing**
  This test aims to verify the correct usage of CSS properties in the user's code. It includes checking for the presence of essential CSS properties, such as margin, padding, font-size, or specific properties required for a particular problem statement. This test ensures that the user's code adheres to the defined CSS requirements and best practices.

- **Form Validation Testing**
  Form validation testing focuses on assessing the user's code for proper form validation techniques. Test cases can include checking for required fields, validating email formats, enforcing password complexity, or implementing custom validation logic. This test ensures that the user's code handles form validation correctly and provides appropriate error messages.

- **Function Testing**
  This test evaluates the functionality and correctness of JavaScript functions implemented by the user. Test cases are designed to cover different scenarios and edge cases to ensure that the functions perform as expected. This test assesses the user's ability to write functional and efficient JavaScript code.

- **API Testing**
  API testing involves verifying the integration of API calls in the user's code. Test cases may include checking if an API request is made, handling the API response correctly, and displaying the data from the API on the page. This test ensures that the user's code effectively interacts with external APIs.

- **Button Testing**
  Button testing focuses on evaluating the behavior and interactivity of buttons implemented by the user. Test cases may include checking if a button triggers a specific action, updates the UI, or performs a navigation action. This test ensures the proper functionality of user-defined buttons.

- **Redirection Testing**
  This test aims to assess the behavior of navigation and redirection implemented by the user's code. Test cases may include checking if clicking a link or a button redirects the user to the correct page or if the page refreshes as intended. This test ensures that the user's code correctly handles navigation and redirection scenarios.

## **Dockerizing the Puppeteer with Chrome Browser Support**

#### Dockerfile:

```Dockerfile
# Use the node:slim base image
FROM node:slim

# Set an environment variable to skip Puppeteer Chromium download during installation
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json file to the working directory
COPY package.json ./

# Install project dependencies using npm
RUN npm install

# Expose port 3000 to allow access to the app outside the container
EXPOSE 3000

# Run the app using the "npm test" command when the container starts
CMD ["npm", "test"]
```

#### Build command:

```
docker build -t bhushan21z/puppchrome .
```

#### Publish it to Docker Hub:

```
docker push bhushan21z/puppchrome:tagname
```

#### Pull commnd:

```
docker pull bhushan21z/puppchrome
```

#### Run command:

```
docker run -it --rm -v $(pwd)/files:usr/src/app/files puppeteerchrome
```

## **Features and Architecture**

#### **Scoring Engine:**

1. Inputs: The scoring engine takes HTML, CSS, and JavaScript files created by users on the client side, as well as the test cases file generated on the backend.
2. Code Quality Assessment: The engine assesses code quality using ESLint CSSlint and similar tools.
3. Scoring: The engine generates a score based on code quality, along with the results of the test cases executed on the client-side code.
4. Modular Architecture: The scoring engine is a separate entity, independent of the frontend and backend code.
5. Technology Stack: Python Flask framework is used to implement the scoring engine.
6. Working: Flask runs various Docker run commands to execute test script.

#### **Backend:**

1. MySql Database: Schema Created with various tables such as users, questions, testcases and submissions.
2. Node JS: Express framework is used to implement Rest APIs.
3. User auth: Contains user register and login APIs.
4. Questions: Questions create/get APIs.
5. Test Cases: Testcases create/get APIs and joining it with Questions table with question id as foreign key.
6. Scoring Engine: POST request to get user data and sending it to scoring engine and returning scoring engine response to frontend.
7. Submissions: User Submissions create/get APIs and joing it with users table and questions table.

#### **Frontend (Admin Side):**

1. Problem Creation: Admins can create problem statements, describing the problem to be solved.
2. Problem Settings: Problems can include various settings such as score weightage, best practices to check, and mobile responsiveness evaluation.
3. Test Cases: Admins can add multiple test cases related to each problem statement.
4. Test Case Visibility: Some test case outputs will be visible to users, while others will be hidden, showing only whether the score passed or failed.
5. User-Friendly Test Case Creation: Adding test cases are straightforward, even for users with limited programming knowledge.

#### **Frontend (Client Side):**

1. Problem List: Users can view a list of problems on their screen.
2. Code Editor: Users can write HTML, CSS, and JavaScript code for each problem, similar to the CodePen editor.
3. Code Compilation: Users can compile their code and generate the output.
4. Score Display: Users can view the scores generated by the scoring engine based on the performed test cases.<br>

## **Screenshots**

![Home Page]({{site.baseurl}}/images/frontend-scoring-engine/frontend_scoring_engine_home.png)<br><br>

---

![Generate Testcases]({{site.baseurl}}/images/frontend-scoring-engine/frontend_scoring_engine_testcases.png)<br><br>

---

![Explore Problem Statement]({{site.baseurl}}/images/frontend-scoring-engine/frontend_scoring_engine_explore.png)<br><br>

---

![Editor Page]({{site.baseurl}}/images/frontend-scoring-engine/frontend_scoring_engine_submit.png)<br><br>
<br>

## **Tools & Technologies**

#### **Frontend:**

- ReactJS is used develop the frontend of the scoring engine.

#### **Backend:**

- Node.js is employed for building the backend of the scoring engine.
- MySQL is used as the database management system.

#### **Scoring Engine**

- Puppeteer is used for implementing testcases and browser testing.
- Docker containers are utilized for testing code quality and running test cases.
- Flask is used to make scoring engine server which takes data and interacts with docker.

## **Conclusion**

By implementing a frontend scoring engine, we can automate frontend development evaluation, resulting in a streamlined and efficient assessment process. This blog has explored the goals, research, features, technical requirements, and tools and technologies involved in developing a frontend scoring engine. The automation of code assessment, real-time editing, and integration of testing tools have resulted in an efficient and comprehensive evaluation platform. The challenges we faced during development have strengthened our understanding of frontend development and inspired innovative solutions. As we move forward, we remain committed to enhancing the scoring engine to meet the evolving needs of the tech industry. <br>
If you have any questions, doubts or suggestions feel free to reach out to me on <a href="https://www.linkedin.com/in/bhushan-wanjari-952042213/" target="_blank" style="color: blue;">LinkedIn</a>
