---
layout: post
title: "Building a Collaborative code-editor &amp; Whiteboard: For tech interviews."
tldr: 
modified: 2023-11-18 14:53:31 +0530
category: technology
tags: [Concurrency Management, Websockets, Multifile Navigation, YJS, tldraw, OT Vs CRDT, CodeMirror 6, Docker, AWS]
author: manav
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---
A Collaborative code-editor and Whiteboard aims to diversify the current interviewing scenario to Live - Coding, Sketching, Crafting, and Conceptualisation of ideas between the Interviewer and Interviewee for better communication which was until now only limited to Video and audio chats.

# The Blog Blueprint:

- Need for collaboration: Unveiling the Why
- Cracking the Code: Research and Concluded Solutions
  - &nbsp;&nbsp;&nbsp;&nbsp;Collaborative conflict management.
  - &nbsp;&nbsp;&nbsp;&nbsp;Code-editor research
  - &nbsp;&nbsp;&nbsp;&nbsp;Existing code-editors
  - &nbsp;&nbsp;&nbsp;&nbsp;Existing whiteboards
- Feature Showcase
- Architecture
- Actors: Use case diagram
- Dockerization, Deployment and scale
- Conclusion

# Need for Collaboration: Unveiling the Why

In the post-pandemic landscape, the majority of tech interviews and initial screening rounds have transitioned to virtual formats through platforms like Google Meet, Zoom, or Microsoft Teams. While these platforms excel in facilitating video and audio interactions, they fall short when it comes to assessing candidates' coding problem-solving skills in a live, interview-pressure setting. Typically, recruiters resort to screen sharing candidates' local code editors, but this approach presents limitations.

Recruiters lack the ability to actively edit the code or navigate through different code files seamlessly. Simple tasks such as pointing out errors, saving code for later review, brainstorming designs, and optimizing code quality become cumbersome, relying on manual instructions for candidates to scroll up or down.

As a result, the demand for a collaborative code editor and whiteboard becomes not just beneficial but critical in addressing these challenges efficiently.

# Cracking the Code: Research and Concluded Solutions

## What if two users press two different letters on the same line at the exact same time?

This conflict is a major problem that all collaborative and distributed softwares have to address. Therefore, when the user makes a change to the document that change needs to be synchronised with other users as well and if the user has to wait for this synchronisation for every letter they type this will make the application very slow. So in order to get a near real-time collaborative editing experience every client maintains a local replica of the document and the main issue now is just to maintain consistency with other clients local replica.

Consider the following example -
In an empty line, Alice inserts letter ‘A’ at index 0 and Bob inserts letter ‘B’ at index 0 at the exact same time. Now how should we combine these changes together? Should we prefer Alice’s changes over Bob’s or vice-versa?

Well there is no logical answer and quite frankly it doesn’t matter, what actually matters is that at the end of combining these operations it should “Converge to an identical state” i.e both Alice and Bob should get the same text as soon as possible and if they are not satisfied they will re-edit just like in git you would have merge conflicts and you would have to merge manually but here we can automate this merging using various concurrency control and consistency models.

There are two conceptual protocols when dealing with such problems -

1. **Consensus based protocol** - Pick one & reject the rest. In this case it will select any one between Alice and Bob, thereby losing one client's data completely. This is mainly used in decentralised blockchain applications.
2. **Collaboration based protocol** - Merge & Keep them all.

But that’s not the end of the story as we can take advantage of commutative operations like consider a double insertion situation - the text initially is “APP”, Alice inserts “H” at the beginning and Bob inserts “Y” at the end at the exact same time as Alice. In such a situation there is a line conflict but since insertions at different positions are commutative we can merge these operations automatically to get the final text “HAPPY”.
Thereby not discarding Alice’s changes or Bob’s changes, providing a real-time conflict-free editing experience and there is no need for someone to manually merge these changes for us.

The concurrency control algorithms are widely studied for collaborative tools and a lot of research is currently going into such algorithms to attain distributed concurrency. The two most widely used ones are OT and CRDT.

### Operational Transformation (OT)

Also known as **Event passing**. Any key event happening on the client-side will be sent to the server. Events can be inserting/deleting a character. The operation received by the server from the client is transformed against its operation which results in a new operation to be performed on the client-side. OT implementations are used in Google docs and many more such collaborative applications pre-2018 ( before CRDT optimisations started to outperform their OT counterparts ).

This can be better understood with the help of an example -

![ot]({{site.baseurl}}/images/collaborative_editor_and_whiteboard/ot.png)

There are many models based on Operational Transformation that are used in prod addressing different issues and there is a plethora of dense academic research whose references can be found in the Documentation. As this blog is written mainly from a developer point of view but academic references are also mentioned wherever needed.

### Conflict-free Replicated Data Type (CRDT)

CRDT works on two core principles -

1. **Commutative** - Re-ordering different operations will not change the final result.
2. **Idempotency** - No matter how many times an operation is performed the final result remains the same.

Here, every character in the document is assigned a unique ID, and when a new character is
inserted, the new character would get an ID based on the average of its neighbours (ideally could even take non-integer IDs), which helps to make the algorithm less complex in conflict resolution.

Just like OT had its own various models, CRDTs too have different implementations developed & optimised over time. To get a conceptual understanding consider the example below - using Lagoot’s CRDT Algorithm

![crdt]({{site.baseurl}}/images/collaborative_editor_and_whiteboard/crdt.png)

CRDTs have a lenient approach to the order of operations. In theory, this reduces the design complexity of distribution mechanisms since there is no need for strict serialisation protocols. By tolerating out-of-order updates, the distribution mechanism has to meet simpler integrity guarantees.

### OT Vs CRDT: Final Solution

CRDTs serve our requirements much better because of these two main reasons -

- **Speed**: CRDTs are much much faster than many OT implementations applying operations should be possible with just a _O(log(n))_ lookup. But in the past the main problem was the large memory overhead. Which is now resolved after significant optimisations in YJS CRDT implementation. ( Exact benchmarks are provided in the references section of Documentation. )
- **Flexibility and Usability**: CRDTs support a wider range of data types. Compared to the OT library, which requires a thorough modelling of business logic as different types of operation data structures, when using the CRDT library, you only need to perform the same operation on common data structures, such as Map and Array.

## Code-editor Research

The main code-editing component libraries explored were -

- <a href="https://codemirror.net/" target="_blank" style="color: blue;">CodeMirror 6</a>
- <a href="https://microsoft.github.io/monaco-editor/" target="_blank" style="color: blue;">Monaco Editor</a>
- <a href="https://ace.c9.io/" target="_blank" style="color: blue;">Ace Editor</a>

Out of which CodeMirror 6 was selected due to the following reasons -

- **Highly modular and lightweight**: seamless integration of only the necessary components, allowing for a tailored and resource-efficient implementation.
- Has a modern, extensible API with **excellent documentation.**
- Is easy to customise, style, and reconfigure.

## Existing Browser based code-editors

Here are some more projects and companies whose products were researched thoroughly, but to prevent this blog from becoming super lengthy only the names with references are mentioned and all the other details are mentioned in the Proof Of Concept given alongside the Documentation:

- <a href="https://gitlab.com/gitlab-org/gitlab-web-ide" target="_blank" style="color: blue;">Gitlab Web IDE</a>
- <a href="https://github.com/coder/code-server" target="_blank" style="color: blue;">Code-server</a>
- <a href="https://github.com/replit" target="_blank" style="color: blue;">Replit</a>
- <a href="https://codeanywhere.com/solutions/collaborate " target="_blank" style="color: blue;">Codeanywhere</a>
- <a href="https://codepen.io/" target="_blank" style="color: blue;">Codepen</a>
- <a href="https://www.codetogether.com/ " target="_blank" style="color: blue;">Codetogether</a>
- <a href="https://github.dev/github/dev" target="_blank" style="color: blue;">Github.dev</a>
- <a href="https://github.com/features/codespaces" target="_blank" style="color: blue;">Github Codespaces</a>
- <a href="https://vscode.dev/" target="_blank" style="color: blue;">Vscode.dev</a>

## Existing Whiteboards

**tldraw**

- <a href="https://docs.tldraw.dev/introduction" target="_blank" style="color: blue;">Docs</a>
- <a href="https://github.com/tldraw/tldraw" target="_blank" style="color: blue;">Github</a>
- 22k+ stars
- 130 contributors actively maintaining.
- Well funded <a href="https://tldraw.substack.com/p/tiny-little-seed-round" target="_blank" style="color: blue;">$2.7M seed</a>
- Supports YJS ( Shared-editing framework )
- Easy to integrate.

Other options researched:

- <a href="https://github.com/excalidraw/excalidraw" target="_blank" style="color: blue;">Excalidraw</a>
- <a href="http://fabricjs.com/" target="_blank" style="color: blue;">fabric.js</a>
- <a href="https://github.com/embiem/react-canvas-draw" target="_blank" style="color: blue;">react-canvas-draw</a>

# Feature Showcase

### Client Workspace

<img src="{{site.baseurl}}/images/collaborative_editor_and_whiteboard/client_workspace.png" style="width: 810px;"/>

### Multifile Navigation & Room info

<img src="{{site.baseurl}}/images/collaborative_editor_and_whiteboard/combined.png" style="width: 810px; height: 380px"/>

### Whiteboard

<img src="{{site.baseurl}}/images/collaborative_editor_and_whiteboard/whiteboard.png" style="width: 810px;"/>

All features are satisfied as specified in FRS:

<h3><strong>Collaborative Code Editor</strong></h3>
- Real-time code editing and sharing capabilities using websockets.
- Syntax highlighting for multiple programming languages using codemirror 6 language packages.
- Support for multiple users editing code simultaneously using YJS shared-editing framework.
- Files navigator bar for multi-file editing using Depth First Search Algorithm in react.
- Create a new meet in just one click!
- Fast and low-latency using websockets + sending only new changes made to the document instead of sending the whole document each time.
- Modular code as specified in Architecture below.
- Secure groups/ rooms using YJS update serialisation.
- Additional features provided -
  - &nbsp;&nbsp;&nbsp;&nbsp;Zip downloads the entire codebase.
  - &nbsp;&nbsp;&nbsp;&nbsp;Pdf download all whiteboard designs.
  - &nbsp;&nbsp;&nbsp;&nbsp;Role management for different actors ( or users ) specified below in the use-case diagram.

<h3><strong>Whiteboard</strong></h3>
- Interactive whiteboard for visual collaboration and problem-solving using tldraw.
- Drawing tools, shapes, and text annotations.
- Real-time updates for all participants using YJS.
- Ability to save whiteboard content by downloading a local pdf copy: Simply by pressing **Ctrl + P**.
- Additional features provided -
  - &nbsp;&nbsp;&nbsp;&nbsp;Upload any new shape or image for UML diagrams, flowcharts or any other design pattern.
  - &nbsp;&nbsp;&nbsp;&nbsp;Dark mode and multi page editing.
  - &nbsp;&nbsp;&nbsp;&nbsp;Set custom opacity, texture patterns and border levels.
  - &nbsp;&nbsp;&nbsp;&nbsp;Use laser pointers for better presentations.

# Architecture

<img src="{{site.baseurl}}/images/collaborative_editor_and_whiteboard/architecture.png" style="width: 780px;"/>

## Frontend

The Frontend architecture is composed of CodeMirror 6, a powerful code-editing tool. To enable multi-file support, a file explorer is seamlessly integrated, allowing users to create and delete files or folders within a nested structure. The status bar dynamically displays all open files until they are either closed or removed.

Additionally, the whiteboard functionality is implemented using Tldraw as a separate component. Users can effortlessly switch between the Code Editor and Whiteboard using the left sidebar.

The system adopts a **modular approach**, breaking down the Code Editor into smaller, manageable components such as Editor-screen, FileTree, and LeftPanel. This modular design enhances code maintainability and fosters a more scalable and extensible architecture.

## Backend

Utilising a Node.js server with the Express framework, the application listens for incoming HTTP requests through RESTful API routes. The server efficiently handles data persistence by saving user input code to the database. Additionally, it provides administrative functionality to retrieve all saved data sets from the database.

The system is Augmented with a WebSocket server for low-latency communication and real-time updates, this system further enhances its capabilities. The WebSocket server efficiently receives updates from diverse clients, manages document state updates, and broadcasts these changes to other clients within the same room. This functionality ensures synchronised, **real-time communication** across connected clients for a seamless and interactive user experience.

## Testing

I have used Jest, in conjunction with React Testing Library, for a comprehensive testing suite. This included rigorous testing scenarios for:

- Buttons
- Connection management.
- Form submissions
- Page redirections
- Error message handling within the project

# Actors: Use case diagram

<img src="{{site.baseurl}}/images/collaborative_editor_and_whiteboard/use_case.png" style="width: 770px"/>

# Dockerization, Deployment and scale

I’ve partitioned the project into distinct frontend and backend components, each independently containerized using Docker. This **modularization** facilitates the potential for separate hosting on different servers, promoting a **decoupled architecture**. Although, in the current deployment setup, both containers reside on the same EC2 instance, leveraging Docker Compose for streamlined single-host deployment.

This configuration ensures swift and straightforward deployment with efficient container orchestration. Please note that since frontend & backend are decoupled you need to enter the correct ip address of the backend container so that frontend can connect with it properly. For in-depth instructions and troubleshooting guidance during deployment, refer to the comprehensive documentation provided in the code repository.

### docker-compose.yml

{% highlight shell %}
version: "3.8"

services:
frontend:
build: ./Frontend
container_name: frontend_c
ports: - "3000:3000"
stdin_open: true
tty: true
depends_on: - backend
networks: - mern-network

backend:
build: ./Backend
container_name: backend_c
restart: always
ports: - "5000:5000"
networks: - mern-network

networks:
mern-network:
driver: bridge
{% endhighlight %}

### Docker run command

{% highlight shell %}
sudo docker compose up --build -d  
{% endhighlight %}

## Scaling

**Maximum number of users in one room** <br>
In this system, WebSockets are adopted over WebRTC for a client-server architecture. The rationale behind this decision lies in the inherent limitations of WebRTC, particularly in scenarios with a large number of users in a room.

WebRTC relies on a mesh topology, where each user establishes connections with every other user in the room. However, as the user count surpasses 15 to 30, the P2P connections become inefficient, leading to increased latency. In contrast, the client-server model with WebSockets exhibits superior scalability, comfortably supporting over 100 users in a room without encountering performance issues.

**Reducing user bandwidth** <br>
Optimising user bandwidth is achieved through a granular approach of selectively transmitting updates or modifications made to the document, as opposed to repetitively sending the entire document.

In the collaborative environment, the CRDT algorithm is leveraging this approach, conflict resolution is executed solely based on the transmitted changes, eliminating the need to transmit the entire document each time and ensuring a more efficient and bandwidth-conscious collaborative experience.

More detailed scaling information about YJS are specified in the references documentation.

# Conclusion

In this exploration, we dived into the intricacies of a Collaborative Code Editor and Whiteboard, aiming to transform the interview process. This enhances communication beyond the traditional bounds of video and audio chats.

The challenges faced during development served as valuable lessons, fortifying my grasp of web development intricacies and inspiring innovative solutions. This journey was not without its hurdles, researching various repositories, digging one article after another, and experimenting with unknown codebases but with perseverance and effective problem-solving, I navigated these challenges, gaining valuable insights and skills in web development.

Feel free to reach out if you'd like to learn more about this project—I'm here to help and answer any questions you might have.
