let minoSize = 35;

let offsetX = minoSize * 3;
let offsetY = 0;

let placedBlocks = [];
let minos = [];
let newMino = [];
let nextMinos = [];
let holdMino = null;
let isHoldUsed = false;
let dropTimeoutId = null; // 追加: 固定処理のタイマーID

let nextSpace = 1.5;
let groundedAt = null; // 接地時刻を記録する変数

let enemyMinoSwitch = false; //敵攻撃SE
let lineRemoveSwitch = false; //ライン削除SE
let minoDropSwitch = false; //ドロップSE
let tetriMinoRotationSwitch = false; //回転SE
let tetriMinoHoldSwitch = false; //ホールドSE
let tetriMinoMoveSwitch = false; //ミノ動きSE

let newOffsetX = offsetX;
let newOffsetY = offsetY;

let a = null;
let isArrowDownPressed = false; // ArrowDownキーが押されているかどうかのフラグ

let rotatedReset = 0;

// 左右移動のインターバルIDを保持する変数
let moveIntervalId = null;
let moveSpeed = 50; // 50ms間隔で移動
let moveTimeoutId = null; // ⬅️ setTimeout の ID を保持

// 下移動のインターバルIDを保持する変数
let downMoveIntervalId = null;
let downMoveSpeed = 50; // 50ms間隔で移動

let isFirstMovePress = true;
let isMoveKeyPressed = false; // ⬅️ 左右移動キーの押下状態を管理

let enemyHP = 10; //敵HP

document.body.innerHTML = `
<div id="enemyHPText">敵HP:${enemyHP}</div>
<canvas id="canvas" width="${minoSize * 10}" height="${minoSize * 23}"></canvas>
<canvas id="nextBox" width="${minoSize * 6}" height="${minoSize * 17}"></canvas>
<canvas id="holdBox" width="${minoSize * 6}" height="${minoSize * 6}"></canvas>
<canvas id="tetriMino" width="${minoSize * 10}" height="${minoSize * 23}"></canvas>
<canvas id="nextMino" width="${minoSize * 6}" height="${minoSize * 17}"></canvas>
<canvas id="holdMino" width="${minoSize * 6}" height="${minoSize * 6}"></canvas>

<audio id="enemyMino" src="SE/enemyMino.wav"></audio>
<audio id="lineRemove" src="SE/lineRemove.wav"></audio>
<audio id="minoDrop" src="SE/minoDrop.wav"></audio>
<audio id="tetriMinoHold" src="SE/tetriMinoHold.wav"></audio>
<audio id="tetriMinoMove" src="SE/tetriMinoMove.wav"></audio>
<audio id="tetriMinoRotation" src="SE/tetriMinoRotation.wav"></audio>

<img id="enemyPicture" src="Picture/てき.png" alt="">
<img id="mikataPicture" src="Picture/みかた.png" alt="">
`;

//文字
const enemyHPText = document.getElementById('enemyHPText');

//描画
const canvas = document.getElementById('canvas');
const tetriMino = document.getElementById('tetriMino');
const nextBox = document.getElementById('nextBox');
const nextMino = document.getElementById('nextMino');
const holdBox = document.getElementById('holdBox');
const holdMinoCanvas = document.getElementById('holdMino');

//SE
const enemyMino = document.getElementById('enemyMino');
const lineRemove = document.getElementById('lineRemove');
const minoDrop = document.getElementById('minoDrop');
const tetriMinoHold = document.getElementById('tetriMinoHold');
const tetriMinoMove = document.getElementById('tetriMinoMove');
const tetriMinoRotation = document.getElementById('tetriMinoRotation');

const canvasContext = canvas.getContext('2d');
const tetriMinoContext = tetriMino.getContext('2d');
const nextBoxContext = nextBox.getContext('2d');
const nextMinoContext = nextMino.getContext('2d');
const holdBoxContext = holdBox.getContext('2d');
const holdMinoContext = holdMinoCanvas.getContext('2d');

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

canvasContext.fillRect(0, minoSize * 3, minoSize * 10, minoSize * 20);
nextBoxContext.fillRect(0, 0, minoSize * 6, minoSize * 18);
holdBoxContext.fillRect(0, 0, minoSize * 6, minoSize * 6);

function gameStart() {
    // ミノの定義
    //I
    let iMino = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];

    //J
    let jMino = [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ];

    //L
    let lMino = [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ];

    //O
    let oMino = [
        [1, 1],
        [1, 1],
    ];

    //S
    let sMino = [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ];

    //T
    let tMino = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ];

    //Z
    let zMino = [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ];

    // 各ミノの初期状態を保存するオブジェクト
    const minoTemplates = {
        i: JSON.parse(JSON.stringify(iMino)),
        j: JSON.parse(JSON.stringify(jMino)),
        l: JSON.parse(JSON.stringify(lMino)),
        o: JSON.parse(JSON.stringify(oMino)),
        s: JSON.parse(JSON.stringify(sMino)),
        t: JSON.parse(JSON.stringify(tMino)),
        z: JSON.parse(JSON.stringify(zMino)),
    };

    function addOjamaMinoRow() {
        let b = Math.floor(Math.random() * 10);
        const bottomY = tetriMino.height - minoSize;
        for (let x = 0; x < 10; x++) { // 幅は10列に戻す (全体をループ)
            if (x !== b) { // 中央の列 (インデックス5) 以外の場合のみ追加
                placedBlocks.push({ x: x * minoSize, y: bottomY, color: "gray" });
            }
        }
        addDrawing();
    }

    function shiftPlacedBlocksUp() {
        let shiftedBlocks = []; // 新しいブロックを格納する配列
        for (let block of placedBlocks) {
            let newY = block.y - minoSize; // 一段上のY座標を計算
            if (newY >= 0) { // ゲームボードの上端を超えないかチェック
                block.y = newY; // Y座標を更新
                shiftedBlocks.push(block); // 新しい配列にブロックを追加
            } // 上端を超えたブロックは削除（今回は最上段にブロックが来ても削除しない仕様にします）
        }
        placedBlocks = shiftedBlocks; // placedBlocksを更新
        addDrawing(); // 描画を更新
    }

    // ✅ 衝突判定 (配置済みのミノとの接触判定)
    function checkCollision(newOffsetX, newOffsetY, mino) {
        for (let y = 0; y < mino.length; y++) {
            for (let x = 0; x < mino[y].length; x++) {
                if (mino[y][x] === 1) {
                    const newX = newOffsetX + x * minoSize;
                    const newY = newOffsetY + y * minoSize;

                    // 画面外に出る場合
                    if (newX < 0 || newX + minoSize > tetriMino.width || newY < 0 || newY + minoSize > tetriMino.height) {
                        return true;
                    }

                    // 既存のブロックと衝突
                    for (let placed of placedBlocks) {
                        if (newX === placed.x && newY === placed.y) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /// ✅ ラインチェックと消去
    function checkLines() {
        const rows = {};
        const linesToClear = [];

        for (const block of placedBlocks) {
            if (!rows[block.y]) {
                rows[block.y] = [];
            }
            rows[block.y].push(block);
        }

        for (const y in rows) {
            if (rows[y].length === 10) {
                linesToClear.push(parseInt(y));
            }
        }

        if (linesToClear.length > 0) {
            lineRemoveSwitch = true;
            SESound();
        }

        // ラインを消去し、上のミノを下に移動
        linesToClear.forEach(lineY => {
            placedBlocks = placedBlocks.filter(block => block.y !== lineY);
            placedBlocks.filter(block => block.y < lineY).forEach(block => block.y += minoSize);
        });

        // 消去されたライン数を返す
        return linesToClear.length;
    }


    // ✅ ネクストミノを描画
    function drawNextMino() {
        nextMinoContext.clearRect(0, 0, nextBox.width, nextBox.height);
        let displayMinos = nextMinos.slice(0, 5);
        let nextMinoSize = minoSize * 1; // ネクストミノのサイズ

        displayMinos.forEach((mino, index) => {
            let minoHeight = getMinoHeight(mino) / minoSize * nextMinoSize;
            let minoWidth = getMinoWidth(mino) / minoSize * nextMinoSize;
            let offsetX_next = (nextBox.width - minoWidth) / 2;
            let offsetY_next = minoSize * nextSpace;

            // Y軸方向の描画開始位置を調整
            offsetY_next += index * (minoHeight * nextSpace);

            // ミノの種類によるオフセット調整
            const minoType = getMinoType(mino);
            switch (minoType) {
                case "i":
                    offsetY_next += index * (minoHeight * nextSpace);
                    break;
                // 他のミノについても同様に調整
            }

            for (let y = 0; y < mino.length; y++) {
                for (let x = 0; x < mino[y].length; x++) {
                    if (mino[y][x]) {
                        const addDrawingX = offsetX_next + x * nextMinoSize;
                        const addDrawingY = offsetY_next + y * nextMinoSize;

                        nextMinoContext.fillStyle = "rgb(255, 0, 0)";
                        nextMinoContext.fillRect(addDrawingX, addDrawingY, nextMinoSize, nextMinoSize);
                    }
                }
            }
        });
    }

    // ミノが最下部に到達したときの処理
    function dropMino() {
        rotatedReset = 0;
        isHoldUsed = !1;
        offsetX = minoSize * 3;
        offsetY = 0;
        newOffsetX = offsetX;
        newOffsetY = offsetY;
        newMino = getNextMino();
        addDrawing();
        groundedAt = null;

        // ✅ ラインチェックを行い、消去されたライン数を取得
        const clearedLines = checkLines();

        // ✅ 消去されたライン数に応じて enemyHP を減少させる
        if (clearedLines > 0) {
            if (clearedLines === 1) {
                enemyHPText.innerText = `敵HP:${enemyHP -= 1}`;
            } else if (clearedLines === 2) {
                enemyHPText.innerText = `敵HP:${enemyHP -= 2}`;
            } else if (clearedLines === 3) {
                enemyHPText.innerText = `敵HP:${enemyHP -= 3}`;
            } else if (clearedLines === 4) {
                enemyHPText.innerText = `敵HP:${enemyHP -= 4}`;
            }

            // ✅ enemyHP が0未満にならないようにする
            if (enemyHP < 0) {
                enemyHPText.innerText = `敵HP:${enemyHP = 0}`;
            }

            console.log(`ラインを ${clearedLines} ライン消去！ Enemy HP: ${enemyHP}`); // デバッグ用ログ
            // 必要であれば、ここで enemyHP の表示を更新する処理を追加
        }
    }

    function dropMinoToBottom() {
        clearTimeout(dropTimeoutId); // タイマーをクリア
        while (!checkCollision(offsetX, offsetY + minoSize, newMino)) {
            offsetY += minoSize;
        }
        dropMino();
    }

    // ✅ 次のミノを取得 (ネクストミノ配列から取得し、必要に応じて補充)
    function getNextMino() {
        // ネクストミノ配列から最初のミノを取得
        const nextMino = nextMinos.shift();

        // ネクストミノ配列が6個になったら新しいミノを1個生成
        if (nextMinos.length === 6) {
            nextMinos.push(getRandomMino());
        }

        return nextMino;
    }

    // ✅ ミノ生成
    function getRandomMino() {
        const minoTypes = [iMino, jMino, lMino, oMino, sMino, tMino, zMino];
        if (!this.minoBag || this.minoBag.length === 0) {
            // 7種類のミノをランダムに並べた配列を作成
            this.minoBag = shuffleArray(minoTypes.slice());
        }
        const mino = this.minoBag.pop();
        return mino;
    }

    // 配列をシャッフルする関数（Fisher-Yatesシャッフル）
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ミノを初期化、ネクストミノを生成
    function initMinos() {
        minos = [iMino, jMino, lMino, oMino, sMino, tMino, zMino];
        nextMinos = [getRandomMino(), getRandomMino(), getRandomMino(), getRandomMino(), getRandomMino(), getRandomMino(), getRandomMino()];
        newMino = getNextMino();
        drawNextMino();
    }

    // ✅ ミノが地面に接触しているか判定 (地面との接触のみを判定)
    function isMinoOnGround() {
        // 接地後の猶予時間を設定 (例: 500ms)
        const groundGracePeriod = 500;
        const now = Date.now();

        // 接地判定のロジック
        for (let y = 0; y < newMino.length; y++) {
            for (let x = 0; x < newMino[y].length; x++) {
                if (newMino[y][x] === 1) {
                    const blockX = offsetX + x * minoSize;
                    const blockY = offsetY + y * minoSize;

                    // 地面との接触判定
                    if (blockY + minoSize > tetriMino.height) {
                        // 接地時刻を記録 (初回のみ)
                        if (!groundedAt) {
                            groundedAt = now;
                        }
                        // 猶予時間内は接地状態を維持
                        if (now - groundedAt <= groundGracePeriod) {
                            return true;
                        }
                    }

                    // 配置済みのブロックとの接触判定
                    for (let placed of placedBlocks) {
                        if (blockX === placed.x && blockY + minoSize === placed.y) {
                            // 接地時刻を記録 (初回のみ)
                            if (!groundedAt) {
                                groundedAt = now;
                            }
                            // 猶予時間内は接地状態を維持
                            if (now - groundedAt <= groundGracePeriod) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        // 接地していない場合、接地時刻をリセット
        groundedAt = null;
        return false;
    }



    // ✅ Tスピンの判定
    function isTSpin(offsetX, offsetY, mino, placedBlocks) {
        if (getMinoType(mino) !== "t") return false; // Tミノでなければfalse

        const corners = [
            { x: offsetX, y: offsetY }, // 左上
            { x: offsetX + 2 * minoSize, y: offsetY }, // 右上
            { x: offsetX + 2 * minoSize, y: offsetY + 2 * minoSize }, // 右下
            { x: offsetX, y: offsetY + 2 * minoSize }, // 左下
        ];

        let filledCorners = 0;
        for (const corner of corners) {
            if (
                corner.x < 0 ||
                corner.x >= tetriMino.width ||
                corner.y < 0 ||
                corner.y >= tetriMino.height ||
                placedBlocks.some(
                    (block) => block.x === corner.x && block.y === corner.y
                )
            ) {
                filledCorners++;
            }
        }
        return filledCorners >= 3;
    }

    // ✅ ミノを配置する
    function placeMino() {
        minoDropSwitch = true;
        SESound();
        for (let y = 0; y < newMino.length; y++) {
            for (let x = 0; x < newMino[y].length; x++) {
                if (newMino[y][x] === 1) {
                    const placeX = offsetX + x * minoSize;
                    const placeY = offsetY + y * minoSize;
                    placedBlocks.push({ x: placeX, y: placeY, color: "blue" });
                }
            }
        }
        dropMino();
    }



    function SESound() {
        if (tetriMinoRotationSwitch === true) {
            tetriMinoRotationSwitch = false;
            tetriMinoRotation.pause();
            tetriMinoRotation.currentTime = 0;
            tetriMinoRotation.play();
        } else if (lineRemoveSwitch === true) {
            lineRemoveSwitch = false;
            lineRemove.pause();
            lineRemove.currentTime = 0;
            lineRemove.play();
        } else if (tetriMinoHoldSwitch === true) {
            tetriMinoHoldSwitch = false;
            tetriMinoHold.pause();
            tetriMinoHold.currentTime = 0;
            tetriMinoHold.play();
        } else if (tetriMinoMoveSwitch === true) {
            tetriMinoMoveSwitch = false;
            tetriMinoMove.pause();
            tetriMinoMove.currentTime = 0;
            tetriMinoMove.play();
        } else if (enemyMinoSwitch === true) {
            enemyMinoSwitch = false;
            enemyMino.pause();
            enemyMino.currentTime = 0;
            enemyMino.play();
        } else if (minoDropSwitch === true) {
            minoDropSwitch = false;
            minoDrop.pause();
            minoDrop.currentTime = 0;
            minoDrop.play();
        }
    }

    // ✅ ホールドミノを描画
    function drawHoldMino() {
        holdMinoContext.clearRect(0, 0, holdBox.width, holdBox.height);
        if (holdMino) {
            let minoHeight = getMinoHeight(holdMino) / minoSize;
            let minoWidth = getMinoWidth(holdMino) / minoSize;
            let offsetX_hold = (holdBox.width - minoWidth * minoSize) / 2;
            let offsetY_hold = (holdBox.height - minoHeight * minoSize) / 2;

            for (let y = 0; y < holdMino.length; y++) {
                for (let x = 0; x < holdMino[y].length; x++) {
                    if (holdMino[y][x]) {
                        const addDrawingX = offsetX_hold + x * minoSize;
                        const addDrawingY = offsetY_hold + y * minoSize;

                        holdMinoContext.fillStyle = "rgb(255, 0, 0)";
                        holdMinoContext.fillRect(addDrawingX, addDrawingY, minoSize, minoSize);
                    }
                }
            }
        }
    }


    // ✅ ミノの実際の高さを取得
    function getMinoHeight(mino) {
        return mino.filter(row => row.some(cell => cell === 1)).length * minoSize;
    }

    // ✅ ミノの実際の幅を取得
    function getMinoWidth(mino) {
        let maxWidth = 0;
        for (let x = 0; x < mino[0].length; x++) {
            if (mino.some(row => row[x] === 1)) {
                maxWidth++;
            }
        }
        return maxWidth * minoSize;
    }

    //ゴーストミノ
    function drawGhostMino() {
        let ghostOffsetY = offsetY;
        while (!checkCollision(offsetX, ghostOffsetY + minoSize, newMino)) {
            ghostOffsetY += minoSize;
        }

        for (let drawingY = 0; drawingY < newMino.length; drawingY++) {
            for (let drawingX = 0; drawingX < newMino[drawingY].length; drawingX++) {
                if (newMino[drawingY][drawingX]) {
                    const addDrawingX = offsetX + drawingX * minoSize;
                    const addDrawingY = ghostOffsetY + drawingY * minoSize;

                    tetriMinoContext.fillStyle = "rgba(255, 0, 0, 0.5)";
                    tetriMinoContext.fillRect(addDrawingX, addDrawingY, minoSize, minoSize);
                }
            }
        }
    }

    // ✅ ミノを描画
    function addDrawing() {
        tetriMinoContext.clearRect(0, 0, tetriMino.width, tetriMino.height);

        // 配置済みのミノを描画
        for (let block of placedBlocks) {
            tetriMinoContext.fillStyle = "rgb(0, 255, 255)";
            tetriMinoContext.fillRect(block.x, block.y, minoSize, minoSize);
        }

        // ゴーストミノを描画
        drawGhostMino();

        // 現在のミノを描画
        for (let drawingY = 0; drawingY < newMino.length; drawingY++) {
            for (let drawingX = 0; drawingX < newMino[drawingY].length; drawingX++) {
                if (newMino[drawingY][drawingX]) {
                    const addDrawingX = offsetX + drawingX * minoSize;
                    const addDrawingY = offsetY + drawingY * minoSize;

                    tetriMinoContext.fillStyle = "rgb(255, 0, 0)";
                    tetriMinoContext.fillRect(addDrawingX, addDrawingY, minoSize, minoSize);
                }
            }
        }
        drawNextMino();
        drawHoldMino();
    }





    // ミノの種類を特定する関数
    function getMinoType(mino) {
        if (JSON.stringify(mino) === JSON.stringify(iMino)) return "i";
        if (JSON.stringify(mino) === JSON.stringify(jMino)) return "j";
        if (JSON.stringify(mino) === JSON.stringify(lMino)) return "l";
        if (JSON.stringify(mino) === JSON.stringify(oMino)) return "o";
        if (JSON.stringify(mino) === JSON.stringify(sMino)) return "s";
        if (JSON.stringify(mino) === JSON.stringify(tMino)) return "t";
        if (JSON.stringify(mino) === JSON.stringify(zMino)) return "z";
        return null;
    }

    // ✅ ホールド機能（修正後）
    function holdMinoFunc() {
        isHoldUsed = true;
        if (holdMino === null) {
            // ホールドミノが空の場合、現在のミノをホールド (回転状態を保持)
            holdMino = JSON.parse(JSON.stringify(newMino));
            newMino = getNextMino();
        } else {
            // すでにホールドがある場合、現在のミノとホールドミノを入れ替える (回転状態を保持)
            let temp = holdMino;
            holdMino = JSON.parse(JSON.stringify(newMino));
            newMino = temp;
        }
        drawHoldMino();
        addDrawing();
    }

    function dropMinoToBottom() {
        while (!checkCollision(offsetX, offsetY + minoSize, newMino)) {
            offsetY += minoSize;
        }
        placeMino();
    }



    function fallLoop() {
        a = setInterval(() => {
            newOffsetY += minoSize;

            // 衝突判定を行い、問題があれば位置変更をキャンセル
            if (checkCollision(offsetX, newOffsetY, newMino)) {
                // 地面についている場合、タイマーをリセットして設定
                clearTimeout(dropTimeoutId); // タイマーをリセット
                dropTimeoutId = setTimeout(placeMino, 500);
            } else {
                // 地面から離れた場合、タイマーをクリア
                clearTimeout(dropTimeoutId);
                dropTimeoutId = null;
            }

            // 配置済みのミノとの衝突判定
            if (checkCollision(offsetX, newOffsetY, newMino)) {
                newOffsetY = offsetY; // 衝突したら位置を戻す
            } else {
                offsetY = newOffsetY;
            }

            addDrawing();
        }, 1000);
    }

    let count = 0;
    let enemyMinoIntervalCount = 64;

    function enemyMinoIntervalLoop() {
        let enemyMinoInterval = setInterval(() => {
            count++;
            enemyMinoSwitch = true;
            SESound();

            shiftPlacedBlocksUp(); // 先にミノを上げる
            addOjamaMinoRow();    // その後お邪魔ミノを追加
            if (count >= 10) {
                clearInterval(enemyMinoInterval);
                setTimeout(() => {
                    enemyMinoIntervalLoop();
                    count = 0;
                }, 1000 * enemyMinoIntervalCount);
            }
        }, 64);
    }

    // enemyMinoIntervalLoop();

    // ✅ キーイベント
    document.addEventListener("keydown", (event) => {
        let previousOffsetX = offsetX;
        let previousOffsetY = offsetY;
        let previousMino = newMino;

        // **左右移動の処理**
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            tetriMinoMoveSwitch = true;
            SESound();
            if (isMoveKeyPressed) return; // すでに押されていたら処理をスキップ
            isMoveKeyPressed = true; // 左右移動キーを押したことを記録

            let direction = event.code === 'ArrowLeft' ? -1 : 1;

            if (isFirstMovePress) {
                newOffsetX += direction * minoSize;
                if (!checkCollision(newOffsetX, newOffsetY, newMino)) {
                    offsetX = newOffsetX;
                    addDrawing();
                } else {
                    newOffsetX = previousOffsetX;
                }
                previousOffsetX = offsetX;
                isFirstMovePress = false;
            }

            if (moveTimeoutId) clearTimeout(moveTimeoutId);

            moveTimeoutId = setTimeout(() => {
                if (!moveIntervalId) {
                    moveIntervalId = setInterval(() => {
                        newOffsetX += direction * minoSize;
                        if (checkCollision(newOffsetX, newOffsetY, newMino)) {
                            newOffsetX = previousOffsetX;
                            clearInterval(moveIntervalId);
                            moveIntervalId = null;
                        } else {
                            offsetX = newOffsetX;
                            addDrawing();
                        }
                        previousOffsetX = offsetX;
                    }, moveSpeed);
                }
            }, 100);
        }

        // **回転処理**
        else if (event.code === 'KeyX') { // 右回転
            if (!downMoveIntervalId) {
                tetriMinoRotationSwitch = true;
                SESound();
                rotatedReset++;
                const size = newMino.length;
                let rotated = Array.from({ length: size }, () => Array(size).fill(0));

                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        rotated[x][size - 1 - y] = newMino[y][x];
                    }
                }
                newMino = rotated;

                // Tスピンの判定
                if (isTSpin(offsetX, offsetY, newMino, placedBlocks)) {
                    console.log("Tスピン！");
                    // Tスピンのボーナス処理などを追加
                }
            }
        } else if (event.code === 'KeyZ') { // 左回転
            if (!downMoveIntervalId) {
                tetriMinoRotationSwitch = true;
                SESound();
                rotatedReset--;
                const size = newMino.length;
                let rotated = Array.from({ length: size }, () => Array(size).fill(0));

                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        rotated[size - 1 - x][y] = newMino[y][x];
                    }
                }
                newMino = rotated;

                // Tスピンの判定
                if (isTSpin(offsetX, offsetY, newMino, placedBlocks)) {
                    console.log("Tスピン！");
                    // Tスピンのボーナス処理などを追加
                }
            }
        } else if (event.code === 'ArrowDown') {
            if (!downMoveIntervalId) {
                downMoveIntervalId = setInterval(() => {
                    isArrowDownPressed = true;
                    clearInterval(a); // ArrowDownキーが押されたときにsetInterval(a)を停止
                    a = null;
                    newOffsetY += minoSize;
                    // 衝突判定
                    if (checkCollision(offsetX, newOffsetY, newMino)) {
                        newOffsetY = offsetY; // 衝突したら位置を戻す
                    } else {
                        offsetY = newOffsetY;
                    }
                    addDrawing();
                    previousOffsetY = offsetY;

                    // 地面との接触判定
                    if (isMinoOnGround()) {
                        // 地面についている場合、タイマーが設定されていなければ設定
                        if (!dropTimeoutId) { // 追加: dropTimeoutIdが設定されていない場合のみ設定
                            dropTimeoutId = setTimeout(placeMino, 500);
                        }
                    } else {
                        // 地面から離れた場合、タイマーをクリア
                        clearTimeout(dropTimeoutId);
                        dropTimeoutId = null;
                    }
                }, downMoveSpeed);
            }
        } else if (event.code === 'Space') { // スペースキーでハードドロップ
            dropMinoToBottom();
        } else if (event.code === 'KeyC') { // 「C」キーでホールド
            if (!isHoldUsed) {
                tetriMinoHoldSwitch = true;
                SESound();
                newOffsetX = minoSize * 3;
                newOffsetY = 0;
                if (rotatedReset > 0) {
                    for (let i = 0; i < rotatedReset; i++) {
                        const size = newMino.length;
                        let rotated = Array.from({ length: size }, () => Array(size).fill(0));

                        for (let y = 0; y < size; y++) {
                            for (let x = 0; x < size; x++) {
                                rotated[size - 1 - x][y] = newMino[y][x];
                            }
                        }
                        newMino = rotated;
                    }
                    rotatedReset = 0;
                } else if (rotatedReset < 0) {
                    for (let i = 0; i > rotatedReset; i--) {
                        const size = newMino.length;
                        let rotated = Array.from({ length: size }, () => Array(size).fill(0));

                        for (let y = 0; y < size; y++) {
                            for (let x = 0; x < size; x++) {
                                rotated[x][size - 1 - y] = newMino[y][x];
                            }
                        }
                        newMino = rotated;
                    }
                    rotatedReset = 0;
                }
                holdMinoFunc();
            }
        }

        // **衝突チェック**
        if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') {
            if (checkCollision(newOffsetX, newOffsetY, newMino)) {
                offsetX = previousOffsetX;
                offsetY = previousOffsetY;
                newMino = previousMino;
                newOffsetX = offsetX;
                newOffsetY = offsetY;
            } else {
                offsetX = newOffsetX;
                offsetY = newOffsetY;
            }
            addDrawing();
        }
    });

    // ✅ キーアップイベント
    document.addEventListener("keyup", (event) => {
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            clearInterval(moveIntervalId);
            moveIntervalId = null;
            clearTimeout(moveTimeoutId);
            moveTimeoutId = null;
            isFirstMovePress = true;
            isMoveKeyPressed = false; // ⬅️ キーを離したことを記録
        } else if (event.code === 'ArrowDown') {
            clearInterval(downMoveIntervalId);
            downMoveIntervalId = null;
            clearTimeout(dropTimeoutId);
            dropTimeoutId = null;
            isArrowDownPressed = false;
            fallLoop(); // ArrowDownキーが離されたときにsetInterval(a)を再開
        }
    });

    fallLoop();
    initMinos();
    addDrawing();
};

document.addEventListener("keydown", (event) => {
    if (event.code === 'ShiftLeft') { // スペースキーでスタート
        gameStart();
    }
});