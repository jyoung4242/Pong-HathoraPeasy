import './style.css';
import { UI, UIView } from 'peasy-ui';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';

const myApp = document.getElementById('myApp');
let intervalID: NodeJS.Timer;

/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new HathoraClient();
let token: string;
let user: AnonymousUserData;
let myConnection: HathoraConnection;

/**********************************************************
 * Hathora: updateState is ran from when the server has a change in
 * state, and the server needs to synch its data to the
 * client
 *********************************************************/

let updateState = (update: UpdateArgs) => {
    //updating state
    model.player1pos = update.state.player1position;
    model.player2pos = update.state.player2position;
    model.ball = update.state.ballposition;
    model.p1Lives = update.state.player1Lives;
    model.p2Lives = update.state.player2Lives;
    //process events
    if (update.events.length) {
        update.events.forEach(event => {
            switch (event) {
                /**********************************************************
                 * Hathora: Broadcast Events from server
                 * The server can broadcast, or send specific users events
                 * For this game, there are four events that the server
                 * triggers, P1/P2 joining, Ball arriving, and Game Over
                 *********************************************************/
                case 'P2':
                    model.player2Joined = 'visible';
                    model.player1Joined = 'visible';
                    model.startButtonDisable = false;
                    break;
                case 'P1':
                    model.player1Joined = 'visible';
                    break;
                case 'Ball':
                    model.ballvisible = 'visible';
                    model.startButtonDisable = true;
                    break;
                case 'Game Over':
                    model.ballvisible = 'hidden';
                    model.player2Joined = 'hidden';
                    model.player1Joined = 'hidden';
                    alert('Game Over');
                    break;
            }
        });
    }
};

/**********************************************************
 * bindKeyboardEvents
 * creates the key up and key down events for the up arrow,
 * the down arrow, and the spacebar
 *********************************************************/
const bindKeyboardEvents = () => {
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                /**********************************************************
                 * Hathora: remote procedure call (RPC)
                 * runs the updatePlayerVelocity method that's on the server
                 * and passes a velocity Vector to the method
                 *********************************************************/
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: -15 } });
                break;
            case 'ArrowDown':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 15 } });
                break;
            case ' ':
                /**********************************************************
                 * Hathora: remote procedure call (RPC)
                 * runs the startRound method that's on the server
                 *********************************************************/
                myConnection.startRound({});
                break;
            default:
                break;
        }
    });
    document.addEventListener('keyup', e => {
        switch (e.key) {
            case 'ArrowUp':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;
            case 'ArrowDown':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;

            default:
                break;
        }
    });
};

/**********************************************************
 * Peasy-UI: create UI String Template
 * this template string forms the injected HTML template
 * that Peasy-UI uses.  This is parsed, along with the
 * data and event bindings called out
 *********************************************************/
const template = `
        <div>
          <div class="instructions">Pong \${title} \${username}</div>
          
          <div class="flex small_width">
            <button id="btnLogin" class="button" \${click@=>login} \${disabled <== loginButtonDisable}>Login</button>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnCreateGame" class="button" \${click@=>create} \${disabled <== createButtonDisable}>Create Game</button>
            <button id="btnConnectGame" class="button" \${click@=>connect} \${disabled <== connectButtonDisable}>Connect Game</button>
            <label for="gameJoinID">Game ID</label>
            <input id="gameJoinID" type="text" \${value <=> gameID}></input>
            <button id="btnCopy" class="button" \${click@=>copy} }>Copy</button>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnJoinGame" class="button" \${click@=>join} \${disabled <== joinButtonDisable}>Join Game</button>
            <button id="btnStartGame"  class="button" \${click@=>start} \${disabled <== startButtonDisable}>Start Game</button>
          </div>

          <div class="instructions">Up/Down arrows move paddle, spacebar launches ball</div>

          <div id='playArea' class="gameArea">
            <div class="p1score" style="visibility: \${player1Joined}">P1: Lives: \${p1Lives}</div>
            <div class="p2score" style="visibility: \${player2Joined}">P2: Lives: \${p2Lives}</div>
            <div id="p1" class="p1" style="transform: translate(\${player1pos.x}px,\${player1pos.y}px); visibility: \${player1Joined}"></div>
            <div id="p2" class="p2" style="transform: translate(\${player2pos.x}px,\${player2pos.y}px); visibility: \${player2Joined}"></div>
            <div id="ball" class="ball" style="transform: translate(\${ball.x}px,\${ball.y}px); visibility: \${ballvisible}"></div>
          </div>
          
        </div>
      `;

/**********************************************************
 * Peasy-UI: data model object
 * this object outlines all the monitored data bindings
 * and events for the string template
 *********************************************************/
const model = {
    /**********************************************************
     * Hathora: loginAnonymous() and getUserFromToken() methods
     * this uses sessionStorage for the browser to store token
     * if token doesn't exist, it logs into Hathora coordinator
     * and creates new access token
     *********************************************************/
    login: async (event, model) => {
        if (sessionStorage.getItem('token') === null) {
            sessionStorage.setItem('token', await client.loginAnonymous());
        }
        token = sessionStorage.getItem('token');
        user = HathoraClient.getUserFromToken(token);
        model.username = `-> User Name: ${user.name}`;
        model.loginButtonDisable = true;
        model.createButtonDisable = false;
        model.connectButtonDisable = false;
    },
    /**********************************************************
     * Hathora: create() and connect() methods
     * this is called when the create new game button is pressed
     * and creates a new game instance from the Hathora server
     * then subsequently runs the connect method, establishing
     * the myConnection object, which we use to communicate
     * between the client and the server
     *********************************************************/
    create: async (event, model) => {
        model.gameID = await client.create(token, {});
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection = await client.connect(token, model.gameID);

        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        //manage UI access
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },
    /**********************************************************
     * Hathora: connect() methods
     * runs the connect method, establishing
     * the myConnection object, which we use to communicate
     * between the client and the server
     *********************************************************/
    connect: async (event, model) => {
        myConnection = await client.connect(token, model.gameID);

        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        //manage UI access
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },

    /**********************************************************
     * Hathora: remote procedure call (RPC)
     * runs the joinGame method that's on the server
     *********************************************************/
    join: (event, model) => {
        myConnection.joinGame({});
        bindKeyboardEvents();
        //manage UI access
        model.joinButtonDisable = true;
    },

    /**********************************************************
     * Hathora: remote procedure call (RPC)
     * runs the startGame method that's on the server
     *********************************************************/
    start: (event, model) => {
        myConnection.startGame({});
        //manage UI access
        model.startButtonDisable = true;
    },
    //copies input text to clipboard
    copy: () => {
        navigator.clipboard.writeText(model.gameID);
    },

    /**********************************************************
     * Peasy-UI: data bindings
     * these values are tied into the UI specifically
     * either data fields like title, p1Lives, and gameID
     * or CSS values, like player2pos
     * or attributes for visibility and disabled of the UI
     * buttons
     *********************************************************/
    title: '',
    gameID: '',
    username: '',
    player1pos: { x: 15, y: 10 },
    player2pos: { x: 575, y: 10 },
    ball: { x: 25, y: 25 },
    p1Lives: 3,
    p2Lives: 3,
    loginButtonDisable: false,
    createButtonDisable: true,
    connectButtonDisable: true,
    joinButtonDisable: true,
    startButtonDisable: true,
    player1Joined: 'hidden',
    player2Joined: 'hidden',
    ballvisible: 'hidden',
};

/**********************************************************
 * Create UI View, and mount the injected HTML
 * you pass the parent element, the string template, and
 * the data model object to UI.create()
 *********************************************************/
let myUI: UIView;
myUI = UI.create(myApp, template, model);

/**********************************************************
 * Peasy-UI: UI.update()
 * This method triggers the framework to monitor for
 * changes in state and then automatically updates the UI
 * with the new data, recommened to be called on interval
 *********************************************************/
intervalID = setInterval(() => {
    UI.update();
}, 1000 / 60);
