---
layout: post
title: "Revamping eLitmus.com | Stand-Alone Front-end Module"
tldr: 
modified: 2023-07-20 04:10:15 +0530
category: technology
tags: [elitmus, revamp, upgrade, distributed system]
author: smruti
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

The current elitmus.com is a web application built with Ruby on Rails Framework, and the views are sent directly from the backend server whenever requested. This was quite good before, but in present scenario of internet and web technologies, these seem to lack some very basic requirements. And Hence, an upgradation is required.

Formally, current [elitmus.com](http://elitmus.com) has a monolithic structure i.e. the front-end and the back-end are tightly coupled together. As a result of this, it is not possible to divide the project’s logic and team for front-end and back-end. Only Full Stack Developers having knowledge of both the domains are required in order to work in this project. This somehow limits the people who are more expertised in one of the domains.

Also, the present [elitmus.com](http://elitmus.com) is not using the latest web technologies available. This greatly impacts the user experience.

So, What’s the solution for this ?

![Monolithic and Distributed Systems]({{site.baseurl}}/images/revamping-elitmus-dot-com-stand-alone-front-end-module/monolithic-distributed.png)

Well, we can separate the front-end and back-end. This will solve all the problems faced by the developers who work or tends to work in this project. This solves some of the major issues faced today by developers.

Now, we can have a distributed system, with the views ( front-end ) in one place and the Models and Controllers in the other. The Front-end we plan to build can be built using the latest and efficient web technologies currently available. This helps to improve the User Experience as well.


## What Benefits ?
---
- **Developer Experience**
  - Team Separation → We can have Dedicated teams for front-end and back-end, each expertised in their own domains
  - Logic Separation → We can separate the Logic of course for the frontend and backend
  - Easy to Manage
  - Easy to Scale

- **User Experience**
  - Latest Web Tech like React can be used to Build Views
  - Improved Speed
  - Improved Performance
  - Consistency in design

<br>

## How do we do it?
---
Well, now that we know what we have to do. We are halfway there already ( Just Kidding ). Let’s discuss some of the things we can use to make the front-end efficient and reliable.


- **React JS**
  - Its component architecture , helps us building a consistent design across the site.
  - It's fast and performant.


- **Tailwind CSS**
  - This is a light-weight CSS framework which is highly reliable and easy to use.
  - This has a good community, which can help to borrow UI components rather than making it from scratch.

- **Redux Toolkit**
  - Redux Toolkit is a light version of Redux, which extracts away a lot of boilerplate codes and provides us easy to use APIs to manage state.


- **Jest**
  - Jest is the most popular library for writing tests in a react application. Infact, Create-React-App provides support for this out of the box when we initiate a new react project.


So, that’s all the core technologies we can use to build an efficient and reliable front-end. But, here is the catch: we can even improve more by following certain practices, which will be fruitful in the long run.


<br>

## What else can we Improve ?
---
Following are some of the best practices that we can use to further improve the frontend application.


- **ES Lint**
  - Enforcing a code style guide is important to maintain the source code of the application. It helps to maintain consistency across the application.
  - More Particularly, we can use the AirBNB Style Guide. This is the most popular style guide for React Application.
  - We can add rules as per our need and requirements in the .eslintrc.js

- **Nested Routes**
  - This is one of the features of react. We can nest the routes under other routes to maintain a route intuition.

{% highlight shell %}
  <Route path="/jobs" element={<JobsAndInterviews />}>
    <Route index element={<AllJobs />} />
    <Route path="my_jobs" element={<MyJobs />}>
      <Route index element={<ActiveJobs />} />
      <Route path="active" element={<ActiveJobs />} />
      <Route path="inactive" element={<InActiveJobs />} />
      <Route path="interviews" element={<Interviews />} />
    </Route>
    <Route path="all_jobs" element={<AllJobs />} />
  </Route>
{% endhighlight %}

  Like in this example snippet, we have a parent route for job and under that my_jobs and inside that we have active, inactive, interviews.
  - /jobs/my_jobs/active → this route path is really gives a lot of information of the pages.

- **Dynamic Routes**
  - This is another feature of React Itself. This allows us to only load the pages that are requested by the user and not all.
  - Just imagine, our site has hundreds of pages. When the user wants to visit the homepage, we are trying to send him all the hundred pages. This doesn’t make any sense right ?

{% highlight shell %}
  // Jobs Page Routes
  export const JobsAndInterviews = lazy(() => import('../pages/Jobs'));
  export const AllJobs = lazy(() => import('../pages/Jobs/AllJobs'));
  export const ApplyJob = lazy(() => import('../pages/Jobs/ApplyJob'));
  export const JobDetails = lazy(() => import('../pages/Jobs/JobDetails'));
  export const MyJobs = lazy(() => import('../pages/Jobs/MyJobs'));
  export const ActiveJobs = lazy(() => import('../pages/Jobs/MyJobs/Active'));
  export const InActiveJobs = lazy(() => import('../pages/Jobs/MyJobs/Inactive'));
  export const Interviews = lazy(() => import('../pages/Jobs/MyJobs/Interviews'));
{% endhighlight %}

  This above snippet shows how to import the components dynamically. But for this thing to work, we need to wrap the Routes in a Suspense Component which takes fallback.
  The component given inside the fallback is rendered in between the dynamic loads. So, we can put our page loader here. Below is the snippet showing how to do it.

{% highlight shell %}
  import jobsRoutes from './routes/jobsRoutes';
  const App = () => (
  <Router>
    <Provider store={store}>
      <Layout>
        <Suspense fallback={() => <Loader />}>
          <Routes>
            {jobsRoutes}
          </Routes>
        </Suspense>
      </Layout>
    </Provider>
  </Router>
  );
{% endhighlight %}

  Now, this makes the website immensely faster than before.
- **Intuitive File and Folder Organization** -> Organizing the files and folders properly is a very important task because it significantly helps the new developers. It lowers the learning curve for the new fellas.
{% highlight shell %}
  /src
    /__tests__
      /categoryA
        /page1.test.js
        /page2.test.js
      /categoryB
        /page1.test.js
        /page2.test.js
    /assets
    /components
      /customElements
      /Layout
    /features
      /redux_slices.js
    /pages
      /categoryA
        /page1.jsx
        /page2.jsx
      /categoryB
        /page1.jsx
        /page2.jsx
    /routes
    /store
      /redux_store.js
    /styles
{% endhighlight %}

That’s how we can improve our codebase even more.

Then, we have to make sure if our application runs the same on every device, OS, and system specs. For that we can dockerize the react app.

<br>

## Dockerization and Deployment
---
Dockerizing the react app gives us the following benefits:

1. **Consistency:** Docker ensures the app runs consistently across different environments.
2. **Dependency Management:** Docker encapsulates app dependencies, preventing conflicts.
3. **Easy Deployment:** Docker simplifies deployment to various environments.
4. **Scalability:** Docker facilitates easy scaling to handle increased traffic.
5. **Versioning and Rollbacks:** Docker images can be versioned, enabling controlled updates and rollbacks.
6. **Development and Testing:** Docker streamlines development and testing in a consistent environment.
7. **Infrastructure Agnostic:** Docker allows running the app on various infrastructures.
8. **Resource Efficiency:** Docker containers are lightweight and efficient in resource utilization.
9. **Easy Collaboration:** Docker promotes seamless collaboration among developers and teams.
10. **Security:** Docker provides isolation, adding an extra layer of security to the app.

We can dockerize the react app by adding docker files i.e.

- **Dockerfile** → contains environment and installation instructions for the app.

  {% highlight shell %}
  FROM node:18 as builder
  WORKDIR /app
  COPY package.json .
  RUN npm install
  COPY . .
  RUN npm run build
  FROM nginx
  EXPOSE 80
  COPY --from=builder /app/build /usr/share/nginx/html{% endhighlight %}
- **docker-compose.yml** → contain commands to run our docker container.

  {% highlight shell %}
  version: '3'
  services:
    web:
      build:
        context: .
        dockerfile: Dockerfile
      ports:
        - '80:80'{% endhighlight %}

Now, we have successfully containerized our react application. Finally, we need to deploy it to some cloud services such as AWS.

- We can first push our docker image to docker hub
{% highlight shell %}
  docker push iamsmruti/elitmus-frontend
{% endhighlight %}

- Then we can login to EC2 instance and then pull the docker image
{% highlight shell %}
  docker pull iamsmruti/elitmus-frontend
{% endhighlight %}

- Finally, we can run the docker image
{% highlight shell %}
  docker run -d -p 5000:5000 iamsmruti/elitmus-frontend
{% endhighlight %}

That wraps up our frontend application which can now be live. It is fully capable of consuming the APIs from the backend. Now, the business logic is in the backend and doesn't put much load on the frontend and hence it is performant and reliable.

If you have any questions, doubts, you can ping me at `smrutiranjanbadatya2@gmail.com`.

I would definitely get back to you.

I Hope this was a helpful and insightful guide for making a better frontend application with all the necessary good practices to maintain sustainability of the project.


See Ya 👋🏻 … Peace ✌🏻

**References**
1. React Docs - <a href="https://react.dev/" target="_blank" style="color: blue;">Here</a>

2. Tailwind Docs - <a href="https://tailwindcss.com/docs/installation" target="_blank" style="color: blue;">Here</a>

3. Redux Toolkit Docs - <a href="https://redux-toolkit.js.org/" target="_blank" style="color: blue;">Here</a>

4. Jest Docs - <a href="https://jestjs.io/docs/getting-started" target="_blank" style="color: blue;">Here</a>

5. ES Lint Docs - <a href="https://eslint.org/docs/latest/" target="_blank" style="color: blue;">Here</a>

6. Docker Docs - <a href="https://docs.docker.com" target="_blank" style="color: blue;">Here</a>