import { getRandomInt, lerp } from "./../voicecat/useful.js";
import { initBackgroud } from "./addbackGround.js";
import { loadKittenMaterial } from "./meshLoad/catLoad.js";
import { catUpdate } from "./meshManager/groupMeshManager.js";
import { kittenUpdate } from "./meshManager/kittenMeshManager.js";
import { setControll, lobbyClickCheck } from "./lobbyExit.js";
import { fukidashiUpdate } from "./groupManager.js";
import { userUpdate } from "./meshManager/userMeshManager.js";
import { kittenFukidashiUpdate } from "./kittenShuffle.js";


import { startUpdateGroup } from "./../server/managerUpdate.js";
import { clickAddCat } from "./../server/serverControler.js"

// import { groupList } from "../server/groupManager.js";

//========================[Three.js描画用変数]========================
export let scene = null; // シーン
export let camera = null;       // カメラ
let controls = null;     // OrbitControl.js用コントロール
let renderer = null;     // 3Dレンダラー
let labelRenderer = null;
let canvasSizeW = 0;     // 描画キャンバス横サイズ
let canvasSizeH = 0;     // 描画キャンバス縦サイズ
//====================================================================



//===========================[メッシュ管理]===========================
//ユーザー系
export let userMeshList = new Map; // ユーザーIDと生成したメッシュを対応させたMap
export let ownUserId = null;       // 自分のユーザーID保存


//グループ、親ネコ系
export let groupList = new Map;    // グループIDと生成したメッシュを対応させたMap
export const catKinds = ["buchi", "gray", "hokke", "kutsushita", "mike", "white"] // ネコの種類
export const catScale = 60;        // 親ネコの大きさ
export let fukidashiList = new Map()

//子ネコ系
export let kittenList = new Map;   // 子ネコが応対するユーザーのユーザーIDと生成したメッシュを対応させたMap
export let kittenIconMaterial = {} // 子ネコのマテリアル読み込み
export const kittenScale = 30;     // 子ネコの大きさ
export let kittenFukidashiList = new Map()
//====================================================================


//=====================[キー入力と自分の移動管理]=====================
let key = {}           // キーごとの状態保存

let followmode = 0;    //カメラが自分のアイコンに追随するか
//0:追随しない, 1:キーが押されている 追随モード, 2: 一瞬押されて現在離されている カメラが中心に来るまで追随モード

let keymode = 0;       //どれかのキーが入力されているか
let beforekeymode = 0; //前回どれかのキーが入力されていたか

let isKeyEnabled = true;       // テキストボックス入力中に移動無効
let keyMoveInterval_Id = null; // 位置を定期的にサーバー送信する
//====================================================================

//ウィンドウサイズが変更されたときに画面サイズ調整
window.addEventListener('resize', resize, false);

//画面サイズ調整関数
function resize() {
    canvasSizeW = parseInt(window.innerWidth - 19);
    canvasSizeH = parseInt(window.innerHeight - 19);
    renderer.setSize(canvasSizeW, canvasSizeH);

    console.log(canvasSizeW, canvasSizeH)

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasSizeW, canvasSizeH);

    camera.left = -canvasSizeW / 2.0;
    camera.right = canvasSizeW / 2.0;
    camera.top = canvasSizeH / 2.0;
    camera.bottom = -canvasSizeH / 2.0;

    camera.aspect = canvasSizeW / canvasSizeH;
    camera.updateProjectionMatrix();

    labelRenderer.setSize(canvasSizeW, canvasSizeH);
}


// =================================================================
// DOMロード完了時に描画開始
// =================================================================
window.addEventListener('DOMContentLoaded', async () => {
    let effect = null; // アニメ調輪郭エフェクト
    let clock = new THREE.Clock(); //フレーム時間 

    //===[デバッグ]フレームレートなどパフォーマンス測定用==========
    const stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    // stats.domElement.hidden = true;
    document.body.appendChild(stats.domElement);
    //========================================================


    init(); // 初期化実行





    // ==========================================================================
    // 初期化関数
    // ==========================================================================
    async function init() {
        // レンダラーを作成
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#canvas'),
            alpha: true,
            antialias: true,
        });

        renderer.gammaOutput = true; // 色空間自動調整有効
        renderer.shadowMap.enabled = true; // 影描画有効


        renderer.setPixelRatio(1); //リサイズ処理有効

        labelRenderer = new THREE.CSS3DRenderer({
            element: document.querySelector('#labelCanvas')
        });
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.zIndex = 1;
        

        // シーンを作成
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xBEDECB); // 背景色

        // ウィンドウサイズ設定
        let width = document.getElementById('main_canvas').getBoundingClientRect().width;
        let height = document.getElementById('main_canvas').getBoundingClientRect().height;

        // カメラを作成
        camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 4000);
        camera.position.set(0, 800, 0); //初期カメラ位置設定

        resize(); // 描画サイズ調整


        controls = new THREE.OrbitControls(camera, labelRenderer.domElement); //マウス操作有効
        controls.target = new THREE.Vector3(0, -100, 1); //初期追随位置設定
        controls.enableDamping = true; // なめらかな移動有効
        controls.dampingFactor = 0.08; // 滑りやすさ調整
        // controls.enableRotate = false; // カメラ回転無効




        initBackgroud(scene); //床と装飾の読み込み
        await loadKittenMaterial(); //子ネコ用マテリアル事前読み込み



        // 平行光源
        const light = new THREE.DirectionalLight(0xFFFFFF);
        light.intensity = 0.4; // 光の強さ
        light.position.set(3, 10, 1); // 光源の位置
        scene.add(light); // 平行光源追加

        // 環境光源
        const ambient = new THREE.AmbientLight(0xf8f8ff, 0.7);
        scene.add(ambient); //環境光源追加

        effect = new THREE.OutlineEffect(renderer, { // アニメ調アウトライン追加
            defaultThickness: 0.004,
            defaultColor: [0.1, 0.1, 0.1],
            defaultAlpha: 1,
            //defaultKeepAlive: true
        });


        // const moonMassDiv = document.createElement('div');
        // moonMassDiv.className = 'label';
        // moonMassDiv.textContent = 'こんにちは';
        // moonMassDiv.style.marginTop = '-1em';
        const button = document.createElement('button');
        button.innerText = "ネコの追加"
        // button.setAttribute('onpointerdown', 'console.log(1)');
        button.addEventListener("pointerdown", () => {
            console.log("hello");
            clickAddCat()
            // alert('Hello');
        })
        // const text = document.createElement('input');
        // text.type = 'text'
        const moonMassLabel = new THREE.CSS3DObject(button);
        moonMassLabel.position.set(0, 10, -200);
        moonMassLabel.rotation.x = Math.PI / 2;
        moonMassLabel.rotation.y = Math.PI;
        moonMassLabel.scale.set(2, 2, 2)
        scene.add(moonMassLabel);
        setControll();

        tick(); // 毎フレーム更新開始
    }



    // ==========================================================================
    // 毎フレーム更新関数
    // ==========================================================================
    function tick() {
        

        let delta = clock.getDelta(); // 前フレームとの時差

        if (isKeyEnabled) { // キー有効化か確認
            if (userMeshList.get(ownUserId)) {
                userKeyMove(userMeshList.get(ownUserId), delta);
            }
        }


        groupList.forEach((meshList, groupId) => { // 親ネコごとの更新
            if (meshList != undefined) {
                meshList.cat.forEach((catMesh, num) => {
                    if (catMesh != undefined) {
                        catMesh.mixer.update(delta); // アニメーション更新
                        catUpdate(catMesh, delta);
                    }
                })
            }
        })

        userMeshList.forEach((userMesh, key) => {
            if (ownUserId != key) {
                userUpdate(userMesh, delta);
            }
        })

        fukidashiList.forEach((fukidashiMeshList) => {
            fukidashiUpdate(fukidashiMeshList);
        })

        kittenFukidashiList.forEach((kittenFukidashiMeshList) => {
            kittenFukidashiUpdate(kittenFukidashiMeshList);
        })

        kittenList.forEach((kitten) => { // 子ネコごとの更新
            kitten.mixer.update(delta); // アニメーション更新
            kittenUpdate(kitten, delta);
        })

        lobbyClickCheck();

        startUpdateGroup()

        // [デバッグ]パフォーマンス表示
        document.getElementById('info').innerHTML = JSON.stringify(renderer.info.render, '', '    ');
        stats.update(); // フレームレート情報更新

        controls.update();
        effect.render(scene, camera); // フレームをレンダリング
        labelRenderer.render(scene, camera);

        requestAnimationFrame(tick); // ループ
    }


})

//自分のユーザーIDをもらう
export function setOwnUserId(id) {
    ownUserId = id;
}



// ==========================================================================
// ユーザー移動
// ==========================================================================

// キー状態更新
function keyDownHandler(e) {
    key[e.code] = true;
} function keyUpHandler(e) {
    key[e.code] = false;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


function userKeyMove(obj, frameTime) {
    const speed = 300;
    if (key["KeyW"] || key["KeyS"] || key["KeyA"] || key["KeyD"]) {

        if (keymode == 0) {
            keymode = 1;

            keyMoveInterval_Id = setInterval(() => {
                //console.log("testInterval", userMeshList.get(ownUserId).icon.position); // この関数3回実行されてるのでuserListをforEachするようにする, あと移動何とかする
                sendUpdatePos({ x: userMeshList.get(ownUserId).icon.position.x, y: userMeshList.get(ownUserId).icon.position.z }, false);
            }, 50)
        }


        followmode = 1;

        // ユーザー移動
        if (key["KeyW"]) {
            if (obj.icon.position.z < 1300) {
                obj.icon.position.z += speed * frameTime;
            }
            
        }
        if (key["KeyS"]) {
            if (obj.icon.position.z > -1300) {
                obj.icon.position.z -= speed * frameTime;
            }
        }
        if (key["KeyA"]) {
            if (obj.icon.position.x < 2000) {
                obj.icon.position.x += speed * frameTime;
            }
        }
        if (key["KeyD"]) {
            if (obj.icon.position.x > -2000) {
                obj.icon.position.x -= speed * frameTime;
            }
        }
        
        obj.name.position.x = obj.icon.position.x;
        obj.name.position.z = obj.icon.position.z + 30;
        obj.frame.position.x = obj.icon.position.x;
        obj.frame.position.z = obj.icon.position.z;
        obj.kitten.position.x = obj.icon.position.x - 20;
        obj.kitten.position.z = obj.icon.position.z - 20;

        // 現在位置を送信
        setPos({ x: userMeshList.get(ownUserId).icon.position.x, y: userMeshList.get(ownUserId).icon.position.z });

    }
    else {
        if (keymode == 1) {
            keymode = 0;
            
            clearInterval(keyMoveInterval_Id);

            sendUpdatePos({ x: userMeshList.get(ownUserId).icon.position.x, y: userMeshList.get(ownUserId).icon.position.z }, true);
        }
    }
    tweenCamera(obj.icon);
}

// キー入力有効無効受け取り関数
export function setIsKeyEnabled(_isKeyEnabled) {
    isKeyEnabled = _isKeyEnabled;
}



// ==========================================================================
// カメラ移動
// ==========================================================================

// 滑らかにカメラを動かす
function tweenCamera(obj) {
    if (keymode != beforekeymode) {
        followmode = 2; // 中心に来るまで追随
    }
    if (followmode == 2) {
        if (Math.abs(camera.position.x - lerp(camera.position.x, obj.position.x, 0.03)) < 0.1 && Math.abs(camera.position.z - lerp(camera.position.z, obj.position.z, 0.03)) < 0.1) {
            followmode = 0; // 中心に来たと判定、追随解除
        }
    }

    if (followmode >= 1) { // ユーザーへカメラの追随処理
        camera.position.x = lerp(camera.position.x, obj.position.x, 0.03);
        camera.position.z = lerp(camera.position.z, obj.position.z, 0.03);
        controls.target.x = camera.position.x;
        controls.target.z = camera.position.z;

        camera.up.set(0, -1, 0);
    }
}

// カメラ追随無効
document.getElementById('labelCanvas').addEventListener('pointerdown', function (event) {
    followmode = 0; // マウス入力されたのでユーザー追随無効
})
document.getElementById('labelCanvas').addEventListener('touchstart', function (event) {
    followmode = 0; // タッチ入力されたのでユーザー追随無効
})

