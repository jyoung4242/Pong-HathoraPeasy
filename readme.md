
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=Follow%20%40jyoung424242)](https://twitter.com/jyoung424242)

<h1 align="center">Tutorial for Hathora Back End/Peasy-UI Front End</h1>

# 👋 Introduction to the tutorial

This tutorial was penned to provide a simple example of how the Hathora framework can be utilized to quickly create a multiplayer backend game server.  With that, this tutorial showcases Peasy-UI framework to create a custom UI for the clients to connect to that server.  The game being created for this example is a simple Pong game.  This tutorial uses a state machine, simple physics and collision detection/resolution, and game state.  The game state will be bound to UI components via Peasy-UI.

## Table of Contents (Links)

-   [Introduction](#👋-introduction-to-the-tutorial)
-   [End State Objective](#end-objective)

## :trophy: End Objective

The end state for this tutorial is a deployed client on Netlify that runs the client code that connects to the Hathora backend server.   It takes two players who can join the game, and each player has three lives.  The ball bounces around until it leaves the screen on either side, and that player loses a life each time.  When all the lives are gone, the game ends.  
Tools
Hathora is a multiplayer networking framework that manages much of the low-level duties that otherwise would have to be managed.  Use cases for Hathora include turn-based games, real-time multiplayer games, and social applications such as chatting.  Hathora manages the networking and remote procedure calls, provides a prototyping UI client, and provides a full API that abstracts away much of the low-level work.
Peasy-UI is a UI data binding Library. Peasy UI provides uncomplicated UI bindings for HTML via string templating. It's intended to be used in vanilla JavaScript/Typescript projects where using ‘createElement‘ is too cumbersome and adding a complete SPA framework is overkill or simply not desired. Thanks to the small scope of the library, performance is decent.
Development Environment
I developed this project and tutorial on a Windows 10 system, utilizing VS code, and executing all terminal commands in the node PowerShell terminal embedded in VS code.  There maybe be nuanced differences between developing on a Mac or Linux system.  Also, if using different shell applications or a different IDE, there may be subtle differences to take note of.
Hathora Backend
Where to find
GitHub
	Hathora can be found at https://github.com/hathora/hathora.  There is a comprehensive readme file that helps get you started, which this tutorial essentially holds your hand through.
Documentation
	The API documentation for Hathora can be found at https://docs.hathora.dev/#/ which is a very nice, continually updated, site that outlines everything you need to know about using this framework.
Discord
	There is a fantastic Discord server for Hathora: https://discord.gg/3MuAdAdb, which gives you access to the team directly.  This has been critical for me and my journey with Hathora, as the team has proven very open to ideas, very responsive to any issues encountered, and overall is a great group of individuals that I’ve enjoyed interacting with.  I get updates on new features and guidance on any API breaking changes here as well, which is a plus.
Workflow
This is the true beginning of the tutorial, and we will start with the backend server using Hathora first.
Project Setup
 
Initial Project Folder
First, let’s start with a blank project.   I will be using VS code editor for this tutorial.  We will create a new folder; I am calling mine Pong HathoraPeasy.  This tutorial also assumes you have node.js installed.  If you don’t, you can go to https://nodejs.org/ and download and install node.js.
Open the terminal window in the editor, CTRL + J, will work as the shortcut. Here I will type:
 
This will install the Hathora NPM package from the internet.  After that installation is complete, we will create a new file, hathora.yml, in the root of our new project folder.
 
YML
	The hathora.yml is a critically important file.  A “yaml” file is a human-readable data-serialization language. 
According to Wikipedia:  It is commonly used for configuration files and in applications where data is being stored or transmitted. YAML targets many of the same communications applications as Extensible Markup Language (XML)…
Before Hathora, I didn’t know what a YML file was, so… this was all new to me.
We must outline out what our YML file needs to look like before we ask Hathora to build the project structure.  Hathora parses the YML file, and builds the backend server template, the prototype UI, and provides the end path for your custom front end client when it builds the project.
There are several sections that we need to cover in hathora.yml: types, methods,  auth, userState, and error.
 
These sections will have to be addressed prior to asking Hathora to parse it.
Types (from the docs)
 

Methods (from the docs)
 
Auth (from the docs)
 
userState (from the docs)
 
initializeArgs (from the docs) – for this tutorial we will not be using this
 
Error (from the docs)
 
Tick (from the docs)
 
So… given that information, I’m outlining that our hathora.yml will be defined initially as follows:
 
Let’s step through the ‘why’ on this.  Under types, were outlining several types that we want the server to manage: Vector, Ball, Player, Game States, Server State and Player State.  
GameStates is a type that lets us use a simple state condition to track our progress through the server, we will use this to create ‘guard’ conditions so we can ensure random procedure calls only are listened to at the right time
Vector is a type that will have an (x,y) as integers being tracked.  This will be used for the Ball entity type that we’ve outlined, as a ball type will have a vector signifying its position and velocity.  
Also on the Ball type, we define a radius integer, which will be used for collision detection.  The position and velocity are used for managing the movement of the ball, and there is a flag isColliding for collision detection.
Player type will outline all the characteristics of each player that connects, including an id, the number of lives remaining, and the position of the players paddle on the screen.  Also velocity for each player will be managed as well as the isColliding flag
The Player State and Server State types are important, as we designate each type for what data the server monitors and broadcasts to each client on change.  So, each client will understand and be able to monitor changes in the balls’ entities, and the players’ entities.  When the Server State data changes, the data gets remapped into Player State prior to being pushed to clients
There are four methods we’re defining for this, updatePlayerPosition, joinGame, startRound and startGame.
These will generate remote procedure calls for the clients to execute and communicate events to the server.
We are setting our authentication to anonymous for this tutorial, and we are defining a tick event that will run every 50 milliseconds.
Let’s try generating our Hathora project off this YAML.   In the PowerShell terminal, enter:
 
Now your project in the explorer should look a bit like this:
 
As you can see, Hathora has generated our project structure for us.  It includes all the API libraries automatically, as well as created  our server directories and our client directories.
A .gitignore is also initially included so you can create a repo at this time if you would like.  For your reference, mine is at https://github.com/jyoung4242/Pong-HathoraPeasy
IMPL
Now we’re ready to start looking at our server backend code.  Under the server directory you’ll find you implementation file, impl.ts.
 
This is the main code that is used for your server.  You can import and include other modules here too, if you want to break up your code, which we will do for this tutorial.  Also generated is the prototype test client which we will look at next.
Prototype Test Client
I’m now going to introduce you to the prototype UI client tool which is provided by Hathora.  We can use this tool to quickly iterate over the server logic in the impl.ts file.  This section will show the UI and its interface but know that we will be using it to fill out the server code.
From the PowerShell terminal, type: 
 
Congratulations, you have a client/server setup running!  Yay!
This will launch the prototype UI tool, built into Hathora, which allows you to quickly mockup your server methods.  It also launches the server so that the prototype UI can connect to it and test it.  The client UI is running at http://localhost:3000/.  You may need to open your default browser and navigate to this URL directly.
It is automatically connecting to your server running out of VS code, and will look like this:
 
You will see the authentication login button has anonymous set in the text, this is because of our auth setting in the hathora.yml file.
If you click the login button, you will find something like this:
 
You will notice in the top right, that Hathora, as an anonymous login, will assign you a random user ID, in this case its miniature-violet-tahr.  This changes every time you login, anonymously.  The UI gives you a few options here, you can create a new game instance, join and existing game, or use Hathora’s built in matchmaking functionality, which we will not get into during this tutorial.
Click the Create New button.  The prototype UI client should now look like this:
 

You get a view of the client state that’s pushed down to each client, and a button that gives  you access to the defined methods from hathora.yml.  Clicking the ‘methods’ button will expand a list of available remote procedure calls, ‘methods’ that you can send to the server, with the necessary data fields:
 
This is how you’re going to rapidly create your server logic and test it iteratively 
IMPORTANT NOTE: if you are updating your logic, you’ll have to close the server, save your updates, and restart it so it compiles your changes.  I recommend using 
 
To compile and run any updates….  
Just as an example, you can put a console.log() in your impl.ts file and recompile your server.
 
And then click the updatePlayerPosition button with some data in it and see what happens in your server console.
 
This demonstrates how these methods get called, and how you have access to the data objects being passed form each client.
Filling in the rest of the server logic
Back into the impl.ts file, if you review the Impl class that’s created by Hathora, you can see there are pre-generated methods available, some of which, we specified in our hathora.yml file.  The others are autogenerated and we will discuss each now.
InternalState:  This designates the object that the server will monitor for changes.  This doesn’t have to be what is sent to each client on changes, however.  As you will see, we are going to modify a couple things here.  Lets change it from PlayerState to ServerState.  Later on, this will force us to remap the ServerState to the PlayerState prior to pushing to clients.
 
Initialize:  autogenerated
	This let’s you define the default values for player state on the creation of a game instance.  If you recall, we defined ServerState as follows: 
 
joinGame:
The joinGame method primary job is to add the Player object to the array of state.Players array.  Depending on the length of the array, you position it on the left or right.  Also, if the 2nd player is joined, we modify game state to be ready to start the game.
 
startGame:
The startGame method primary function is to modify the game state after we add a ball into the game.  The ball is automatically added next to the left player’s paddle.
 
startRound:
The startRound method primary job is to set the initial velocity of the ball off the left player’s paddle, and to modify the game state to an active state.
 
updatePlayerPosition:
the updatePlayerPosition method will take the velocity vector from the client and update the global state.  
 
getUserState:
getUserState is an automatically generated method from Hathora, that allows the server to modify the returned state to the client based off the userID…. For example, in a card game where you don’t want each client to know the card values of all the players, you can filter the provided client state so that you don’t expose that data to each client.  This is how we will re-map player state, take note of using the ternary operator to set a default for undefined data:
 
onTick:
The onTick method will be the engine that runs the game.  We have it set to a 50ms tick routine that runs when the game is started.   It has several jobs in this game, and we will break them down.
Updating player paddle position:  based on the velocity vectors provided by each client, we will move the player paddles up or down, unless they hit the top/bottom of the screen.  Also, as a note, if we are waiting to start the next round, the ball will move up/down with the paddles.
 
Ball physics:
Ball movement:
Based on the ball velocity vector, we reposition the ball for each tick…
 
Ball collision with player:
This block of code runs a helper routine that detects overlap between balls and player paddles, and set’s each entity’s isColliding property.  If a ball is hitting, we change its velocity to send it back the other direction.  The helper routine changeVelocity takes care of that.
 
Ball collisions with top/bottom of screen:
This Block performs similar evaluation, checks for collision with top and bottom of screen, and depending on that changes the velocity of the ball to send it the opposite direction.
 
Final look at prototype UI
When you open two clients, login, joinGame, then startGame, you will see this:
 
As you can see in both client instances, they are separately logged in as two different id’s.  But you can see both users in the ‘state’ data that is being pushed down to each client.  
If the RPC (remote procedure call) is fired off to start the round, you will start seeing the onTick method updating the ball position, and the velocity will update if the ball collides with a wall or paddle.  If the ball hits the edges of the screen, the position of the ball will be reset, and the game state will change.
Custom UI
So… now in theory, our backend server code is done.  And we can exercise it with our prototype UI code, but what if we want to create our own custom front end UI that does this?  Let’s start looking into that now.
Peasy-UI Front End
Why Peasy-UI?
I chose to use Peasy-UI for a few reasons.   I liked that its pure Typescript, and that I can bundle it down to an html file and a JS file.  Easy to deploy, as there are no complicated build steps required to generate it, as we are simply using the webpack bundler.  It also doesn’t have as much overhead as say Angular, React, or other SPA frameworks.
Also, it provides a really clean way of abstracting UI code from the business logic and creates a bit of separation in the codebase.
Where to find
GitHub https://github.com/peasy-ui/peasy-ui
NPM: https://www.npmjs.com/package/peasy-ui

Data Bindings
The data bindings work through the string templating code.  We will provide the library a string template of the HTML directly and embed that template with ‘bindings’ that will be parsed out and monitored for change of state.
For Peasy-UI to work, you must pass the library a template and a data model object, or ‘state’.   The template will make references to the state object passed, and that is what you modify to update your UI.  A very quick example to outline this:
 
The template string being used has two input radio buttons.  You can see a data binding on the color property of the model object, and a binding on the onChange event of the radio button.
In this binding patter, the radio button sends the radio button value attribute of either ‘red’ or ‘green’ to the color property when active.  When the onChange event is fired, you see the method changedColor() is ran.
This is just a small slice of the binding patters. Here is an outline of the available patterns from the Peasy-UI readme.
${attr <== prop}    Binding from model property to element attribute
${attr <=| prop}    One-time binding from model property to element attribute
${attr ==> prop}    Binding from element attribute to model property
${attr <=> prop}    Two-way binding between element attribute and model property

${prop}             Binding from model property to attribute or text
${|prop}            One-time binding from model property to attribute or text

${event @=> method} Event binding from element attribute to model method

${'value' ==> prop} Binding from element to model property, used to bind values of radio buttons and select inputs to a model property

${ ==> prop}        One-time binding that stores the element in model property

${ === prop}        Binding that renders the element if model property is true
${ !== prop}        Binding that renders the element if model property is false

${alias <=* list}   Binding from model list property to view template alias for each item in the list

Custom UI overview
To simplify this as much as possible, I will create simple template.html file that renders all my index.ts code.  
I will have a login button, a create Game button and connect to Game button, and then the playing field will be available with buttons to allow for joining the game, starting the game, and keyboard bindings for updating velocity, and spacebar for starting the round.  Kind of something like this:
 
Tutorial Workflow
Creating custom UI project in Hathora framework
Step one in creating a custom UI for Hathora is to create the web directory under the Hathora client folder.
 
This folder will house the entire client project, so we can treat that as our new root directory for our client.  I use a .bat script to setup new projects, its available for you to use as well.  It can be found at:
https://github.com/jyoung4242/webpackBootstrapper
and I just place the webpack starter file (webpackstarter.bat) in the web directory and run it from the node PowerShell terminal.  Make sure you change your directory appropriately.
 
Again, this is an optional path I use as a shortcut, you are welcome to create your client project as you see fit, I don’t believe it should matter with regards to the tutorial.  After I run the bat file and set it to T for typescript, my directory looks like this.
 
The batch file will automatically start up the dev server to start running the client.
We need to make sure we update our tsconfig.json and webpack.config.js files, and there’s one more support package we need.  Run this npm command in the Powershell.
 
tsconfig.json:
 

webpack.config.json
 
Installing and importing Peasy-UI
Cancel out of the dev server running, and let’s install Peasy-UI.
 
Let’s import Peasy-UI, open index.ts file in your client project.
 
Creating string template and data model
Now that we have access to UI, and UIView, we can define our string template and model object.
 
The string template will create several sections of the HTML elements, very simplistic, and I pass the HTML straight to the UI.create() method, with the parent element, and the data model, which for now is empty, but that will change.  The myApp parameter is defined and captured by using getElementByID for the parent div in the template HTML.
 
Peasy-UI executes its state and compare feature by calling UI.update() method.  To have this run in the background and monitor and react to changes in state, we will create a Interval to call UI.update() periodically.
 
Creating data bindings
If you’re running a dev server, and using the styles.css file provided in the GitHub repo, the client should be looking like this currently:
 	
So our data binding to do list include: 
•	Data Fields in the main title div, two for rendering, and two for the data
•	Login button, click event binding, and one for the disabled property for the button
•	Create Game and Connect game buttons, one binding each for the click event and one binding each for the disabled property
•	The Game ID field data will have a data binding, and the Copy button will have an click event binding
•	The Join Game and Start Game buttons will both have an click event binding and their disabled properties tied to bindings
•	The Game area will have several bindings itself:
o	The fields for how many lives each player possess, will have a rendering binding and the data field will have a binding, 1 for each player
o	The player paddles will each have their rendering bindings, and their CSS transform data field bindings
o	The ball will have its own rendering binding, and its CSS transform data binding
Event bindings: ${event @=> method}
Data bindings: ${data}
Rendering bindings: ${===property}
One-way attribute binding: ${disabled<==getDisabledButton}
Two-way attribute binding: ${value<=>data}
Let’s add the rest of the event bindings, we can update the code logic when ready.
 
We now have our events mocked up.  Once we connect the client to the Hathora server, we’ll fill in the events will the remote procedure calls.
We can add the remaining data bindings now. Let’s update the data model object:
 
Now our data bindings are complete, and now we can connect Hathora to our client.
Connecting the custom client to the server
This section is going to import the Hathora Client module, as well as fill in the logic for the Login, Create Game, and Connect Game buttons.
Let’s import the Hathora Client code into our index.ts file.
 
This will give us access to the methods needed to connect our client.
Let’s prepare our necessary app scoped variables :
 
This gives us the key items that are required for connecting to the back-end server.  Take note of the update state method, as we have it empty for now, we will fill it in later.
This first thing our code will do is look to see if there is a session token saved locally, in session storage.  If not, we create a new authorization token.  This I part of our Login method for the button, so let’s fill that out:
 
So after a token is established with the loginAnanymous() method, we can retrieve our user data from that token.  We can set our model.username to our new ID, and the UI will automatically update, thanks Peasy!!!!
So now that we’re logged in, let’s work on creating a new game instance, or joining an existing one.
 
Each code is similar, the only difference being that the create game method uses the client.create() method, which allows for a gameID to be created, and yes, we tie it into our UI model, and the UI will update automatically.  The important final piece of these is the establishment of myConnection, which will be used for remote procedure calls.
Remote Procedure Calls
Using myConnection, we now have access to the methods that are created on the server, in the impl.ts file.  This lets us fill out the two other buttons, Join Game and Start Game.
 

We still need to figure out how we are going to access the updatePlayerVelocity() method.  Let’s tie some keyboard presses to it.
 
This method can be called after the joinGame method is called.  This connects the last two RPCs from our server into the client.  The up and down arrows will update the players paddle velocity.  The spacebar will fire off the startRound() method.
Adding logic to the game elements
Okay, that’s quite a bit of stuff.  We have our UI bindings, the HTML framework, the RPC’s, our client is connected to the server, all that’s left is now getting the information OUT of the server so our UI can use it.  This is the client state that the impl.ts file calls out.  Remember that updateState() method we defined a long time ago?  That’s the connection for how the data is going to come out of the server when the data changes.
Tying in the server data via updateState()
Earlier we created a method call updateState() that we left empty.  Now its time to fill it out and review what is going on.
 
This routine runs whenever the server state changes, and that creates a remapping of the client state on the server side, and that state gets pushed, or broadcasted, out to each connected client.  It arrives via UpdateArgs parameter, called update, in this routine.  There are two aspects of the update object that we are going to leverage, state and events.
Update.state is the client state being pushed from the server, and we simply take the important properties of that object and store it into our data model.  The act of doing this will force Peasy-UI to respond to any changes in the data and update our UI automatically.
Update.events is the Hathora event system, and this array holds a list of the events that have been fired off from the server.  We have four events outlined in our server code, Players joining, P1 and P2, the Ball being ready to display, and Game Over.
Wrap up of test project
We’ve reviewed about 96% of the code, please refer to the project repo for the miscellaneous lines of code not reviewed, as well as the helper functions that are imported.   This completes the project at a local level, let’s talk deployment.

Deployment
So how do we push our local project out to the world for others to see?  There are many, many different paths to take.
For this tutorial, I am using Netlify to push the front end out into the world, and I am self-hosting my server on a dedicated machine.  However, there are cloud-based options for deploying the backend.
Building
For the front end, I simply changed directory in /client/web/ in my project, and ran the webpack build:
 
This creates a /build/ directory under our web client.  There will be an html file and a bundled JavaScript file.  These files can be pushed to a GitHub repo project now.   We will be using our GitHub accounts to push our projects to a webhosting service, Netlify.   Many of these service providers create plugins for their tools to easily connect to GitHub repo’s.  A special note for this is that the server data is being built into the client.ts and base.ts files from where you are building.  Steps should be taken to make sure the appID called out for the coordinator matches the server target.
.gitignore
I had to modify the .gitignore file so that the Hathora client dependencies can get pushed to the repot.  These files are imported into your index.ts file, so you have to give access to the hosting service.
 

Netlify -  Frontend
Please refer to the expansive amount of Netlify documentation regarding creating an account with their service.  There is a free level of service provided with Netlify.
Once your account is created you can create a new site to your account.  They have a one-click deploy feature that lets the Netlify build tools clone your GitHub repo, then package it up and launch the site live automatically.  There was a little bit of configuration in the build step to be successful.  First, I recommend changing the domain settings to a site name that makes more sense, I used Hathor-peasy-pong.netlify.app.
The final step is setting up the deployment settings.  If you’ve tied your GitHub repo to this site, then you will fill out the build settings as such.  We have two static files, so there are no necessary build steps to spell out.
 
After this is setup, you can go to the deploy page for your site and trigger a deployment.  The site should go live after that.
 
Congratulations, you just made a real-life website with a multiplayer game on it!!!!
Self-Hosted Backend
To get this running on my dedicated machine at home, I simply recreated the project locally, and executed to fire up my service:
 
Now the service is running on my dedicated machine, and it can connect to the Hathora Coordinator via the internet. 
3rd party hosting service
To push to a hosting cloud service like , change your directory back to the project root.  Here you’ll be able to run the Hathora build command:
 
This will run a vite script that bundles and packages up your server into a index.mjs file that’s located at /server/dist/.  This file, can be pushed to a hosting service.  From the Hathora Docs:
 
Cloud Hosting
Hathora is positioning themselves to be able to host your backend application as well.  You can have an account created with Hathora, and then use the ‘hathora deploy’ command and your application will be automatically pushed to the cloud and running.  Please see the Hathora Docs and reach out to the team directly for more information.
