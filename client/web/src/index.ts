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
let updateState = (update: UpdateArgs) => {};

//Create UI String Template
const template = `
        <div>
          <div class="instructions">Pong \${title} \${username}</div>
          
          <div class="flex small_width">
            <button id="btnLogin" class="button" \${click@=>login}>Login</button>
          </div>

          <div class="flex spacedEqual large_width">
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
          <div id='playArea' class="gameArea"></div>
          
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
        myConnection.joinGame({});
    },
    connect: async (event, model) => {
        myConnection = await client.connect(token, model.gameID);
        model.title = `-> Game ID: ${model.gameID}`;
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        myConnection.joinGame({});
    },
    join: (event, model) => {
        myConnection.joinGame({});
    },
    start: (event, model) => {
        myConnection.startGame({});
    },
    title: '',
    gameID: '',
    username: '',
};

let myUI: UIView;
myUI = UI.create(myApp, template, model);

intervalID = setInterval(() => {
    UI.update();
}, 1000 / 60);
