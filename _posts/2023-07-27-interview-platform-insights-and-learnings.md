---
layout: post
title: "Interview-Platform:Insights and Learnings"
tldr: 
modified: 2023-07-27 13:58:13 +0530
category: technology
tags: [video-conferencing,socket-io,webrtc,mediasoup]
author: rajat
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

An interview platform is a platform that offers a digital answer to the interview procedure. The conventional hiring procedure is frequently ineffective, time-consuming, and difficult. The platform was developed to address the issue by streamlining the hiring process and offering an effective means to carry it out.


## Requirements

It was chosen to incorporate the following features in the application taking into account current interview circumstances, which are as follows:

* Multi-User Conferencing
* The ability to communicate via video and voice,
* Chat feature
* Screen-sharing Capabilities



## Exploring the Application's Fundamentals

To build a solution incorporating the above features it is necessary to have a clear understanding of the following concepts.

* WebRTC (Web Real-Time Communication): It is a free and open-source project that provides web browsers and mobile applications with real-time communication (RTC) via application programming interfaces (APIs). It allows audio and video communication to work inside web pages by allowing direct peer-to-peer communication.

* Socket IO: It is a JavaScript library that enables real-time, bidirectional communication between the server and clients. By leveraging WebSockets, it establishes persistent connections, allowing instantaneous data exchange.

* Websocket: It is a protocol that provides a full-duplex communications channel over a network connection. WebRTC is standardised on WebSocket as the way to send information from a web browser to the signalling server and vice versa.

* Adapter JS: It takes care of the differences between browsers, so developers don't have to worry about compatibility issues and can focus on building their applications.

* Signaling: The signalling process involves exchanging messages between two peers using an intermediary, the signalling server. WebRTC does not define a signalling protocol. 


* RTCPeerConnection: RTCPeerConnection is a web API in the JavaScript language used for enabling real-time communication (RTC) between web browsers. It is a fundamental part of the Web Real-Time Communication (WebRTC) technology

* Media Servers: A media server is a device or software that stores digital media such as video, audio, or images and makes it available over a network.

* SDP (Session Description Protocol): A protocol for describing media communication sessions is used. It is used for peer-to-peer negotiation of different audio and video codecs, network topologies, and other device characteristics but does not deliver the media data.

Now let us understand briefly what signalling taking an example:

*   User A creates an offer that contains its local SDP.

*   User A attaches that offer to something known as an RTCPeerConnection object.
    
*   User A sends its offer to the signalling server using WebSocket.

*   User B receives User A's offer using WebSocket.
    
*   User B creates an answer containing her local SDP.
    
*   User B attaches its answer, along with User A's offer, to its RTCPeerConnection object.
    
*   User B returns its answer to the signalling server using WebSocket.
    
*   User A receives User B's offer using WebSocket.
    
    
You may have a basic understanding of the technology used to create the solution up to this point, so let's take a quick look at the approach used to develop the solution.


## Approach to Build the Solution

* The first milestone was accomplished achieved after finishing room functionality, which essentially means that a unique meeting can be made and participants can enter the room with a unique id.

* To make the application more purpose-specific, admin features and a chat component were included. With this feature, the interviewer has more control over the meeting, and participants can only participate after being accepted by the admin.

* It was important to understand how to use the AWS platform and how to incorporate networking concepts to host the application.


## Architecture to be used:

Different Architecture that can be used to enable Multiple User Video Calling Apps:

1.  Mesh Topology
    
2.  SFU Topology
    
3.  MCU Topology
    

<p align="center">
  <img src="{{site.baseurl}}/images/interview-platform-insights-and-learnings/topology.png" alt="Image" width="600" />
</p>

## Comparing the Mesh & SFU Topology to be used:

*   In the Mesh architecture a user when joining the room, needs to establish a connection with every other present in the room.
    
*   And in turn the guests present needs to establish a connection with the new user.
    
*   Mesh architecture can be suitably implemented in a group of 3-4 people.
    
*   The advantage is that it is less expensive and less complex.
    
*   The disadvantage lies in the extent of scalability.
    
*   SFU topology has an edge over the Mesh taking into Scalability as a factor.
    
*   The bandwidth decreases taking the number of participants to be constant in both cases.
    
*   The one disadvantage is that it is more complex and relatively difficult to implement.
    

## Topology to be followed:


**Selective forwarding unit**

*   In this various clients connect to the media server.
    
*   Here P2P is taken into use.
    
*   Each device is connected to the server.
    
*   The server combines them in the stream and puts them in a single stream.
    

## Comparision between Mediasoup and Kurento

Until now we have a fair idea of which topology we need to implement in the application. We need a media server to get implemented for Selective Forwarding Unit. There are many options available in media servers that we can proceed but taking into multiple factors we are left with two options and we need to proceed with one. 


1.  Media connections are established 80% quicker than Kurento

2.  Provides rich scalability and performance with its robust selective forwarding unit
    
3.  Can be used as a NodeJS package or a Rust library
    
4.  MediaSoup is designed to work in a distributed environment, making it suitable for large-scale deployments. It can handle multiple rooms and numerous concurrent calls, which aligns with your scalability requirement
    
5.  MediaSoup has good community support and regular updates over time
    
6.  MediaSoup allows you to write automated test cases for all the features, helping ensure the stability and functionality of your application.

## Insights of the application

We currently have a good understanding of the architecture that will be used in the application. According to the demands of the application, SFUs (single forwarding units) will be deployed. And we conclude that we will keep using Mediasoup as the application's media server.

Talking about the features to be implemented, which include audio and video chat and screen sharing, we need to have a better understanding.

The application requests authorization to use the available camera and microphone to establish communication and transfer media, such as video and audio.

{% highlight javascript %} 
navigator.mediaDevices 
	.getDisplayMedia({ video: true, }) 
	.then(streamSuccess) 
	.catch((err) => { console.log(err); }); 
{% endhighlight %}

The ability to share the screen must be implemented in addition to audio and video. To do this, we can use the code snippet below.

{% highlight javascript %} 
navigator.mediaDevices 
	.getDisplayMedia({ video: true, }) 
	.then(streamSuccess) 
	.catch((err) => { console.log(err); }); 
{% endhighlight %}

As fetching the streams we can proceed with the following steps of implementing the mediasoup architecture. Here is a brief overview of the steps implemented.

* Create a media device (mediasoup-client) for capturing media.
* Create a transport for sending media to the server.
* Connect the send transport and produce audio/video tracks.
* Signal a new consumer transport for a remote producer.
* Get the list of available producers from the server.
* Connect the receiving transport and consume remote media.
* Render the local video, screen sharing video, and other controls.
* Implement event handlers for muting, camera, and screen sharing toggles.
* Implement event handlers for leaving the meeting and accepting new users.

    
## Building the Solution
	
* [React Js](https://react.dev/) is used to develop the application's front end. [Redux](https://redux.js.org/) is utilised for state management, and after establishing the page routes, work on UI design began.

* After reading the documentation, we began implementing Mediasoup in the backend and preferred [Node Js](https://nodejs.org/en) as the backend framework.

This is an overview of the Mediasoup WebRTC server application. The application is built using Node.js, [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Socket.IO](https://socket.io/) to facilitate real-time communication and media streaming.

### Dependencies

- `dotenv`: Loads environment variables from a `.env` file.
- `express`: Web framework for building the server.
- `httpolyglot`: Provides HTTPS server functionality for secure communication.
- `socket.io`: Enables WebSocket communication for real-time events.
- `mediasoup`: A WebRTC media server library for media processing.

### Server Setup

1. Import required modules and set up the Express server.
2. Create an HTTPS server using `httpolyglot` for secure communication with SSL certificates.
3. Connect to MongoDB using Mongoose to store user information and other data.
4. Define the MongoDB schema for the "users" collection.

### Mediasoup Integration

1. Create a Mediasoup worker to manage media processing.
2. Define media codecs for audio and video.
3. Set up Socket IO to handle WebSocket communication for real-time media streams.
4. Create maps and arrays to manage Mediasoup peers, transports, producers, and consumers.

### Socket IO Event Handlers

1. Implement event handlers for various actions:
   - Joining a room and creating WebRTC transports.
   - Joining a room and creating WebRTC transports.
   - Producing and consuming media.
   - Sending and receiving messages between peers.
   - Confirming admin status and accepting user requests.

### Mediasoup Transports

1. Implement functions to create Mediasoup WebRTC transports with specific options.
2. Handle transport events like DTLS state changes and transport closure.

### Final Setup

1. Create the Express app and set it to listen on the specified port (default: 3002).


### Deployment
1. Dockerize the application

{% highlight docker %} 
FROM node:20 
WORKDIR /app 
COPY package*.json ./ 
RUN npm cache clean --force 
COPY . . 
EXPOSE 8000 
CMD [ "npm", "start" ] 
{% endhighlight %}

3. Initialize an EC2 Instance on AWS
4. Run the docker container with Ngnix WebServer
5. Expose TCP UDP Ports for EC2 Instance for media transmission.


## Challenges Faced


During building the product the major problem I faced was to establish a connection between the clients using the application. Every Client who was joining was producing media but the media was not transporting to other clients. After debugging and revamping the application's state, the conclusion was drawn that the React state was not behaving as decided and solved the issue after fixing it. During development, the socket instance needs to be properly handled so that it gets mapped to the proper room and doesn't get broadcasted to every other instance.

During deployment, the major issue was assigning the proper IP address to be used in the application as the application has the requirement of broadcasting the IP address to every applicant with a public IP. After using the Amazon EC2 instance the issue was solved and then I implemented Docker to containerize the application and run it with the nginx server.


<p align="center">
  <img src="{{site.baseurl}}/images/interview-platform-insights-and-learnings/app_ss.png" alt="Image" width="600" />
</p>

## Conclusion

* The first version of the application is built with the multi-user functionality joining with their desired choice of media. 
* The admin can accept the desired user and on accepting the user can enter the room. 
* The participants can communicate over audio, see each other's video and chat in the room. The entire process of building the application is a great chance of learning and rewarding experience and future improvements can be done to make the application more consistent and reliable.

## References

<a href="https://openvidu.medium.com/a-new-era-for-openvidu-better-perfomance-and-media-quality-with-mediasoup-24d46a9eb10d" target="_blank" style="color: blue;">Comparision of Kurento and Mediasoup Mediaserver</a>





