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
            <button id="btnLogin" class="button" \${click@=>login}>Login</button>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnCreateGame" class="button" \${click@=>create}>Create Game</button>
            <button id="btnConnectGame" class="button" \${click@=>connect}>Connect Game</button>
            <label for="gameJoinID">Game ID</label>
            <input id="gameJoinID" type="text" \${value <=> gameID}></input>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnJoinGame" class="button" \${click@=>join}>Join Game</button>
            <button id="btnStartGame"  class="button" \${click@=>start}>Start Game</button>
          </div>
          <div class="instructions">Up/Down arrows move paddle, spacebar launches ball</div>
          <div id='playArea' class="gameArea">
            <div id="p1" class="p1" style="transform: translate(\${player1pos.x}px,\${player1pos.y}px)"></div>
            <div id="p2" class="p2" style="transform: translate(\${player2pos.x}px,\${player1pos.y}px)"></div>
            <div id="ball" class="ball" style="transform: translate(\${ball.x}px,\${ball.y}px)"></div>
          </div>
          
        </div>
      `;

const model = {
    login: async (event, model) => {
        if (sessionStorage.getItem('token') === null) {
            sessionStorage.setItem('token', await client.loginAnonymous());
        }
        token = sessionStorage.getItem('token');
        user = HathoraClient.getUserFromToken(token);
        model.username = `-> User Name: ${user.name}`;
    },
    create: async (event, model) => {
        model.gameID = await client.create(token, {});
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection = await client.connect(token, model.gameID);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
    },
    connect: async (event, model) => {
        myConnection = await client.connect(token, model.gameID);
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
    },
    join: (event, model) => {
        myConnection.joinGame({});
        bindKeyboardEvents();
    },
    start: (event, model) => {
        myConnection.startGame({});
    },
    title: '',
    gameID: '',
    username: '',
    player1pos: { x: 15, y: 10 },
    player2pos: { x: 575, y: 10 },
    ball: { x: 25, y: 25 },
    p1Lives: 3,
    p2Lives: 3,
};

let myUI: UIView;
myUI = UI.create(myApp, template, model);

intervalID = setInterval(() => {
    UI.update();
}, 1000 / 60);
