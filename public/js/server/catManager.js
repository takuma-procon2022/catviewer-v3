import { getRandomInt, lerp } from "./useful.js"


export function addCat(state_name, position, kittenKind, scale) {
    let catMesh = {
        mesh: {
            position: {
                x: getRandomInt(position.x - 300, position.x + 300),
                y: -50,
                z: getRandomInt(position.y + 100, position.y + 300),
            },
            rotation: {
                x: 60 * Math.PI / 180,
                y: 0,
                z: 0,
            }
        },
        mixer: "未実装",
        actions: 5,
        kittenKind: kittenKind,
        scale: scale,
        state: {
            name: state_name,
            iscomplete: false,
            toposition: position,
            torotation: null,
            nextWorkTimer: null,
        },
        groupData: {
            position: position,
        }
    }

    return catMesh;
}



function catWalk(obj, delta) {
    // const speed = 70;
    const speed = 30;
    // const speed = 20;

    let torotation = 0;

    // 行きたい場所から今いるネコの位置の差分を計算
    let todiffposition = {
        x: obj.state.toposition.x - obj.mesh.position.x,
        y: obj.state.toposition.y - obj.mesh.position.z,
    }

    // 行きたい方向の回転を計算
    torotation = Math.atan((-todiffposition.y) / todiffposition.x) + (Math.PI / 2);
    if (todiffposition.x < 0) {
        torotation += Math.PI;
    }

    // 計算した方向に向く
    catRotate(obj, torotation);

    // 行きたい場所に到達できた
    if (Math.abs(todiffposition.x) < 20 && Math.abs(todiffposition.y) < 20) {
        obj.state.iscomplete = true;
    }
    else {
        // 近づく
        obj.mesh.position.x += Math.sin(obj.mesh.rotation.y) * speed * delta;
        obj.mesh.position.z += Math.cos(obj.mesh.rotation.y) * speed * delta;
    }
}

// ネコの回転
function catRotate(obj, torotation) {
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

    if (obj.mesh.rotation.y < 0) {
        obj.mesh.rotation.y += 2 * Math.PI;
    }
}



// 1フレームごとに親ネコの動き計算
export function catUpdate(obj, delta) {
    if (obj.state.name == "walk") {
        catWalk(obj, delta);

        if (obj.state.iscomplete) {
            obj.state.name = "sit";
            obj.state.torotation = getRandomInt(130, 230) * Math.PI / 180;
            obj.state.iscomplete = false;
            catAction(obj, 4);
            // obj.state.nextWorkTimer = 
            setTimeout(() => {
                catAction(obj, 5);
                obj.state.name = "walk";
                obj.state.toposition = {
                    x: getRandomInt(obj.groupData.position.x - 1300, obj.groupData.position.x + 1300),
                    y: getRandomInt(obj.groupData.position.y - 1300, obj.groupData.position.y + 1300),
                }
                obj.state.iscomplete = false;
            }, getRandomInt(7 * 1000, 20 * 1000))
        }

    }
    if (obj.state.name == "sit") {
        catRotate(obj, obj.state.torotation);
    }

}

function catAction(obj, actionNum) {
    obj.actions = actionNum;

    // let currentActionNum = obj.actionNum;
    // if (currentActionNum == undefined ) {
    //     obj.actions[5].stop();
    //     obj.actions[5].reset();
    // } else {
    //     obj.actions[currentActionNum].fadeOut(1);
    // }

    // obj.actionNum = actionNum;
    // obj.actions[actionNum].reset()
    // obj.actions[actionNum].fadeIn(1)
    // obj.actions[actionNum].play()
}
