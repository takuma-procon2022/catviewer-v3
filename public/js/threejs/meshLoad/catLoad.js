import { getRandomInt } from "../../voicecat/useful.js";
import { kittenIconMaterial } from "../mainController.js";

// 実装しているネコ素材の種類一覧
const catKinds = ["buchi", "gray", "hokke", "kutsushita", "mike", "white"]
const kittenKinds = ["buchi", "gray", "hokke", "kutsushita", "mike", "white"]
const kittenIconKinds = ["angry", "disgusted", "fearful", "happy", "neutral", "sad", "surprised", "ng"]

// ネコのモデルが置かれている位置のパス
const url = './assets/env/cats/cat.glb';

// ネコのメッシュとアニメーション読み込み
export function loadCatModel(position, kittenKind, scale) {
    return new Promise((resolve) => {
        let texture = new THREE.TextureLoader().load(`./assets/env/cats/${kittenKind}.png`)
        texture.flipY = false;


        new THREE.GLTFLoader().load(url, (gltf) => {
            let model = gltf.scene;
            let animations = gltf.animations;
            // model.name = "model_with_cloth";
            model.scale.set(scale, scale, scale);//モデルの大きさ
            model.position.set(getRandomInt(position.x - 300, position.x + 300), 300, getRandomInt(position.y + 100, position.y + 300));
            //モデルの回転
            // model.rotation.y = 600;
            model.rotation.x = 60 * Math.PI / 180 ;

            model.traverse((object) => { //モデルの構成要素をforEach的に走査
                if (object.isMesh) { //その構成要素がメッシュだったら
                    let parameters = { //toon materialを使うと簡単にトゥーンレンダリングっぽくなる。オプションは適当に。
                        transparent: true,
                        opacity: 1,
                        color: 0xffffff,
                    }
                    let newMat = new THREE.MeshToonMaterial(parameters);
                    object.material = newMat;
                    // object.material.outlineParameters = {
                    //     thickness: 0.1,
                    //     color: new THREE.Color( 0xff0000 ),
                    //     alpha: 1,
                    //     visible: true,
                    //     keepAlive: true
                    // }

                    object.material.receiveShadow = true; // 影の受け取りを有効
                    object.material.castShadow = true; // 別のオブジェクトに与える影を有効

                    object.material.map = texture;
                }
            });
            resolve([model, animations]);
        })
    })
}

// アニメーションからmixer作成
export function loadAnimation(model, animations) {
    return new Promise((resolve) => {
        let actions = [];
        let mixer;

        if (animations && animations.length) {
            //Animation Mixerインスタンスを生成
            mixer = new THREE.AnimationMixer(model);

            //全てのAnimation Clipに対して
            for (let i = 0; i < animations.length; i++) {
                let animation = animations[i];

                //Animation Actionを生成
                actions[i] = mixer.clipAction(animation);

                if (i == 4) {
                    //ループ設定（1回のみ）
                    actions[i].setLoop(THREE.LoopOnce);
                    //アニメーションの最後のフレームでアニメーションが終了
                    actions[i].clampWhenFinished = true;
                }
                else {
                    //ループ設定（1回のみ）
                    actions[i].setLoop(THREE.Loop);
                    //アニメーションの最後のフレームでアニメーションが終了
                    //actions[i].clampWhenFinished = true;
                }
                //アニメーションを再生
            }


        }
        resolve([mixer, actions]);
    })
}

// 表情のアイコンを読み込み
export async function loadKittenMaterial() {
    let promiseArray = [];

    kittenKinds.forEach(kittenKind => {
        kittenIconKinds.forEach(kittenIconKind => {
            kittenIconMaterial[kittenKind] = {}
            promiseArray.push(new Promise((resolve) => {
                new THREE.TextureLoader().load(
                    `./assets/env/kitten/${kittenKind}/${kittenIconKind}.png`,
                    texture => {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        //texture.offset.x = 90/(2*Math.PI);
                        kittenIconMaterial[kittenKind][kittenIconKind] = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.99,
                        });
                        resolve();
                    }
                );
            }))
        });
    });

    // 一括で並列読み込み
    return Promise.all(promiseArray);
}

