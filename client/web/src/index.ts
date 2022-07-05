import './style.css';
import { UI, UIView } from 'peasy-ui';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';

const myApp = document.getElementById('myApp');
let intervalID: NodeJS.Timer;

const client = new HathoraClient();
let token: string;
let user: AnonymousUserData;
let myConnection: HathoraConnection;

let updateState = (update: UpdateArgs) => {
    model.player1pos = update.state.player1position;
    model.player2pos = update.state.player2position;
    model.ball = update.state.ballposition;
    model.p1Lives = update.state.player1Lives;
    model.p2Lives = update.state.player2Lives;
    //process events
    if (update.events.length) {
        update.events.forEach(event => {
            switch (event) {
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

const bindKeyboardEvents = () => {
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                console.log(`pressing up`);
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: -15 } });
                break;
            case 'ArrowDown':
                console.log(`pressing down`);
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 15 } });
                break;
            case ' ':
                console.log(`pressing space`);
                myConnection.startRound({});
                break;
            default:
                break;
        }
    });
    document.addEventListener('keyup', e => {
        switch (e.key) {
            case 'ArrowUp':
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;
            case 'ArrowDown':
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;

            default:
                break;
        }
    });
};

//Create UI String Template
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

const model = {
    login: async (event, model) => {
        console.log(`Logging In`);
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
    create: async (event, model) => {
        console.log(`Creating new game`);
        model.gameID = await client.create(token, {});
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection = await client.connect(token, model.gameID);
        console.log(`myConnection status: `, myConnection);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },
    connect: async (event, model) => {
        console.log(`Connecting to game`);
        myConnection = await client.connect(token, model.gameID);
        console.log(`myConnection status: `, myConnection);
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },
    join: (event, model) => {
        console.log(`Join Game`);
        myConnection.joinGame({});
        bindKeyboardEvents();
        model.joinButtonDisable = true;
    },
    start: (event, model) => {
        console.log(`Start Game`);
        myConnection.startGame({});
        model.startButtonDisable = true;
    },
    copy: () => {
        console.log('copied');
        navigator.clipboard.writeText(model.gameID);
    },
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

let myUI: UIView;
myUI = UI.create(myApp, template, model);

intervalID = setInterval(() => {
    UI.update();
}, 1000 / 60);
