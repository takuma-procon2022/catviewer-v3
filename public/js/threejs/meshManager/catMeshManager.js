import { loadCatModel, loadAnimation } from "../meshLoad/catLoad.js";
import { scene } from "../mainController.js";
import { lerp } from "../../voicecat/useful.js";

// ネコを追加
export async function addCat(state_name, position, kittenKind, scale) {
    let mesh, animations, mixer, actions;

    // ファイルからネコのメッシュとアニメーション読み込み
    [mesh, animations] = await loadCatModel(position, kittenKind, scale);

    // シーンに追加
    scene.add(mesh);

    // アニメーションからmixer追加
    [mixer, actions] = await loadAnimation(mesh, animations);

    let catMesh = {
        mesh: mesh,
        mixer: mixer,
        actions: actions,
        state: {
            name: state_name,
            iscomplete: false,
            toposition: position,
            torotation: null,
        },
        linearMove: {
            elapsedTime: 0,
            end: true,
            from: {
                x: position.x,
                y: position.y,
            },
            fromRotate: {
                x: 60 * Math.PI / 180,
                y: 0,
                z: 0,
            },
            to: {
                x: position.x,
                y: position.y,
            },
            toRotate: {
                x: 60 * Math.PI / 180,
                y: 0,
                z: 0,
            },
        },
        serverSyncData: {
            actions: {
                num: 5,
                iscomplete: false,
            },
            kittenKind: {
                name: kittenKind,
                iscomplete: false,
            },
        }
    }
    
    // 歩くモーション再生
    actions[5].fadeIn(1);
    actions[5].play();

    return catMesh;
}

export function addCatWalkState(obj, toposition) {
    obj.state.name = "walk";
    obj.state.toposition = toposition
}

// ネコ歩く
export function catWalk(obj, delta) {
    const speed = 70;
    
    let torotation = 0;

    // 行きたい場所から今いるネコの位置の差分を計算
    let todiffposition = {
        x: obj.state.toposition.x - obj.mesh.position.x,
        y: obj.state.toposition.y - obj.mesh.position.z,
    }

    // 行きたい方向の回転を計算
    torotation = Math.atan((-todiffposition.y)/todiffposition.x) + (Math.PI / 2);
    if (todiffposition.x < 0){
        torotation += Math.PI;
    }
    
    // 計算した方向に向く
    catRotate(obj, torotation);

    // 行きたい場所に到達できた
    if (Math.abs(todiffposition.x) < 8 && Math.abs(todiffposition.y) < 8) {
        obj.state.iscomplete = true;
    }
    else {
        // 近づく
        obj.mesh.position.x += Math.sin(obj.mesh.rotation.y) * speed * delta;
        obj.mesh.position.z += Math.cos(obj.mesh.rotation.y) * speed * delta;
    }
}

// ネコの回転
export function catRotate(obj, torotation) {
    let rotation = obj.mesh.rotation.y;
    let rotatediff = torotation - rotation;

    // 最短が右向きか左向きか計算
    if (rotatediff > Math.PI) {
        // 右向き
        obj.mesh.rotation.y = lerp(rotation + 2 * Math.PI, torotation, 0.06);
    } else {
        // 左向き
        obj.mesh.rotation.y = lerp(rotation, torotation, 0.06);
    }

    if(obj.mesh.rotation.y < 0) {
        obj.mesh.rotation.y += 2 * Math.PI;
    }
}

// ネコのなめらかなモーション遷移
export function catAction(obj, actionNum) {
    let currentActionNum = obj.actionNum;
    if (currentActionNum == undefined ) {
        obj.actions[5].stop();
        obj.actions[5].reset();
    } else {
        obj.actions[currentActionNum].fadeOut(1);
        obj.actions[currentActionNum].stop();
        // obj.actions[currentActionNum].reset();
    }

    obj.actionNum = actionNum;
    obj.actions[actionNum].reset()
    obj.actions[actionNum].fadeIn(1)
    obj.actions[actionNum].play()
}

export function setCatMaterial(obj, kittenKind) {
    let texture = new THREE.TextureLoader().load(`/assets/env/cats/${kittenKind}.png`)
    texture.flipY = false;

    obj.mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
        if (object.isMesh) { //その構成要素がメッシュだったら
            object.material.map = texture;
        }
    });
}