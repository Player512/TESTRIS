//ストーリー
let storyText = null;
let textCount = 0;
let textSwitch = true;

//ゲーム
let gameStartSwitch = true;　//ゲームスタートスイッチ

let minoSize = 35; //ミノサイズ
let enemyHP = 96; //敵HP
let MusicVolume = 1;　//音楽ボリューム
let SEVolume = 0.3;　//効果音ボリューム
let enemyAttackIntervalVariable = 26; //敵攻撃間隔
let dropSpeed = 1; //落下スピード

let placedBlocks = [];

let BPM = 130;
let beat = 16 * 74;
let loopTime = 60 / BPM * beat / 4;

let enemyMinoSwitch = false; //敵攻撃SE
let lineRemoveSwitch = false; //ライン削除SE
let minoDropSwitch = false; //ドロップSE
let tetriMinoRotationSwitch = false; //回転SE
let tetriMinoHoldSwitch = false; //ホールドSE
let tetriMinoMoveSwitch = false; //ミノ動きSE

let offsetX = minoSize * 3;
let offsetY = minoSize;

let minos = [];
let newMino = [];
let nextMinos = [];
let holdMino = null;
let isHoldUsed = false;
let dropTimeoutId = null; // 追加: 固定処理のタイマーID

let nextSpace = 1.5;
let groundedAt = null; // 接地時刻を記録する変数

let newOffsetX = offsetX;
let newOffsetY = offsetY;

let fallLoopInterval = null;
let isArrowDownPressed = false; // ArrowDownキーが押されているかどうかのフラグ

let rotatedReset = 0;

// 左右移動のインターバルIDを保持する変数
let moveIntervalId = null;
let moveSpeed = 50; // 50ms間隔で移動
let moveTimeoutId = null; // ⬅️ setTimeout の ID を保持

// 下移動のインターバルIDを保持する変数
let downMoveIntervalId = null;
let downMoveSpeed = 50; // 50ms間隔で移動

let minoGeneration = true; //ミノ生成

let isFirstMovePress = true;
let isMoveKeyPressed = false; // ⬅️ 左右移動キーの押下状態を管理
let fallLoopSwitch = true;

document.body.innerHTML = `

<!--ストーリー-->
<div id="storyBackground"></div>
<div id="textWindow">
<div id="text"><ゆっくり><br>こんにちは</div>
</div>

<!--ゲーム-->
<canvas id="canvas" width="${minoSize * 10}" height="${minoSize * 23}"></canvas>
<canvas id="nextBox" width="${minoSize * 6}" height="${minoSize * 17}"></canvas>
<canvas id="holdBox" width="${minoSize * 6}" height="${minoSize * 6}"></canvas>
<canvas id="tetriMino" width="${minoSize * 10}" height="${minoSize * 23}"></canvas>
<canvas id="nextMino" width="${minoSize * 6}" height="${minoSize * 17}"></canvas>
<canvas id="holdMino" width="${minoSize * 6}" height="${minoSize * 6}"></canvas>
<canvas id="gameOverLine" width="${minoSize * 4}" height="${minoSize * 4}"></canvas>

<!--テキスト-->
<div id="enemyHPText">敵HP:${enemyHP}</div>
<div id="gameResult" style="color:red; font-size:${minoSize * 5}px; white-space:nowrap;"></div>

<!--立ち絵-->
<img id="enemyStandPicture" src="Picture/ゆっくり.png" style="top:calc(50% + ${minoSize * -2}px); left:calc(50% + ${minoSize * 16}px); width:${minoSize * 32}px; height:${minoSize * 32}px; z-index: 4;">
<!--
<img id="allyStandPicture" src="Picture/みかた.png" style="left:calc(50% + ${minoSize * -20}px); width:${minoSize * 32}px; height:${minoSize * 32}px;">
-->

<!--音楽-->
<audio id="gitou" src="Music/疑答.mp3"></audio>

<!--効果音-->
<audio id="enemyMino" src="SE/enemyMino.wav"></audio>
<audio id="gameOver" src="SE/gameOver.wav"></audio>
<audio id="lineRemove" src="SE/lineRemove.wav"></audio>
<audio id="minoDrop" src="SE/minoDrop.wav"></audio>
<audio id="tetriMinoHold" src="SE/tetriMinoHold.wav"></audio>
<audio id="tetriMinoMove" src="SE/tetriMinoMove.wav"></audio>
<audio id="tetriMinoRotation" src="SE/tetriMinoRotation.wav"></audio>
`;

//ストーリー
const storyBackground = document.getElementById('storyBackground');
const text = document.getElementById('text');
const textWindow = document.getElementById('textWindow');

//ゲーム
//文字
const enemyHPText = document.getElementById('enemyHPText');
const gameResult = document.getElementById('gameResult');

//描画
const canvas = document.getElementById('canvas');
const tetriMino = document.getElementById('tetriMino');
const nextBox = document.getElementById('nextBox');
const nextMino = document.getElementById('nextMino');
const holdBox = document.getElementById('holdBox');
const holdMinoCanvas = document.getElementById('holdMino');
const gameOverLine = document.getElementById('gameOverLine');

//効果音
const enemyMino = document.getElementById('enemyMino');
const gameOver = document.getElementById('gameOver');
const lineRemove = document.getElementById('lineRemove');
const minoDrop = document.getElementById('minoDrop');
const tetriMinoHold = document.getElementById('tetriMinoHold');
const tetriMinoMove = document.getElementById('tetriMinoMove');
const tetriMinoRotation = document.getElementById('tetriMinoRotation');

//音楽
const gitou = document.getElementById("gitou");

//2d描画
const canvasContext = canvas.getContext('2d');
const tetriMinoContext = tetriMino.getContext('2d');
const nextBoxContext = nextBox.getContext('2d');
const nextMinoContext = nextMino.getContext('2d');
const holdBoxContext = holdBox.getContext('2d');
const holdMinoContext = holdMinoCanvas.getContext('2d');
const gameOverLineContext = gameOverLine.getContext('2d');

canvasContext.fillRect(0, minoSize * 3, minoSize * 10, minoSize * 20);
nextBoxContext.fillRect(0, 0, minoSize * 6, minoSize * 18);
holdBoxContext.fillRect(0, 0, minoSize * 6, minoSize * 6);
holdBoxContext.fillRect(0, 0, minoSize * 6, minoSize * 6);
gameOverLineContext.fillStyle = "rgba(0, 0, 0, 0)";
gameOverLineContext.fillRect(0, 0, minoSize * 4, minoSize * 4);

//ストーリー
text.style.fontSize = `${minoSize * 1}px`;
text.style.left = `${minoSize * 0.2}px`;
textWindow.style.top = `calc(50% + ${minoSize * 8}px)`;
textWindow.style.width = `${minoSize * 48}px`;
textWindow.style.height = `${minoSize * 8}px`;

//ゲーム
enemyHPText.style.top += `calc(50% + ${minoSize * -10}px)`;
enemyHPText.style.left += `calc(50% + ${minoSize * 6}px)`;
enemyHPText.style.transform = `translate(0%, -50%)`;
enemyHPText.style.fontSize = `calc(${minoSize} * 1px)`;

nextBox.style.top += `calc(50% + ${minoSize * 0}px)`;
nextBox.style.left += `calc(50% + ${minoSize * 9}px)`;
nextMino.style.top += `calc(50% + ${minoSize * 0}px)`;
nextMino.style.left += `calc(50% + ${minoSize * 9}px)`;
holdBox.style.top += `calc(50% + ${minoSize * -5.5}px)`;
holdBox.style.left += `calc(50% + ${minoSize * -9}px)`;
holdMinoCanvas.style.top += `calc(50% + ${minoSize * -5.5}px)`;
holdMinoCanvas.style.left += `calc(50% + ${minoSize * -9}px)`;
gameOverLine.style.top += `calc(50% + ${minoSize * -10.5}px)`;

holdMinoCanvas.style.top += `calc(50% + ${minoSize * -5.5}px)`;
holdMinoCanvas.style.left += `calc(50% + ${minoSize * -9}px)`;