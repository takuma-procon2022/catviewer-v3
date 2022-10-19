import { scene, userMeshList, kittenIconMaterial } from "../mainController.js";
import { dcText } from "../meshLoad/dcText.js";
import { lerp } from "../../voicecat/useful.js";

// ユーザーのアイコンを追加
export async function addUserIcon(id, nameText, url, kitten) {

    let userMesh = { name: null, icon: null, frame: null, kitten: null, linearMove: null };

    const promiseName = new Promise((resolve) => {
        userMesh.name = dcText(nameText, 14, 20, 50, 0x000000, 0xcccccc);
        userMesh.name.position.set(30, 20, 30);
        userMesh.name.rotation.x = Math.PI / 2;
        userMesh.name.rotation.y = Math.PI;
        scene.add(userMesh.name);
        resolve();
    })

    const promiseIcon = new Promise((resolve) => {
        new THREE.TextureLoader().load(
            url,
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                let woodMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                });

                userMesh.icon = new THREE.Mesh(
                    new THREE.CircleGeometry(30, 25),
                    woodMaterial
                );

                userMesh.icon.rotation.x = Math.PI / 2;
                userMesh.icon.rotation.y = Math.PI;
                userMesh.icon.position.set(30, 10, 0);
                scene.add(userMesh.icon);
                resolve();
            }
        );
    })

    const promiseFrame = new Promise((resolve) => {
        let frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
        });

        userMesh.frame = new THREE.Mesh(
            new THREE.CircleGeometry(32, 26),
            frameMaterial
        );

        userMesh.frame.castShadow = true;
        userMesh.frame.receiveShadow = true;

        userMesh.frame.rotation.x = Math.PI / 2;
        userMesh.frame.rotation.y = Math.PI;
        userMesh.frame.position.set(30, 0, 0);
        scene.add(userMesh.frame);
        resolve();
    })

    userMesh.kitten = new THREE.Mesh(
        new THREE.CircleGeometry(25, 25),
        kittenIconMaterial[kitten].neutral,
    );
    userMesh.kitten.name = kitten;


    userMesh.kitten.rotation.x = Math.PI / 2;
    userMesh.kitten.rotation.y = Math.PI;
    userMesh.kitten.position.set(10, 20, 0);
    scene.add(userMesh.kitten);


    await Promise.all([promiseName, promiseIcon, promiseFrame]).then(() => {
        userMeshList.set(id, userMesh);
    })
}

// ユーザーのアイコンの削除
export function delUserIcon(id) {
    let userMesh = userMeshList.get(id);

    Object.keys(userMesh).forEach(key => {
        if (key == "linearMove") {
            return; // スキップ
        }
        scene.remove(userMesh[key]);
        userMesh[key].traverse((object) => { //モデルの構成要素をforEach的に走査
            if (object.isMesh) { //その構成要素がメッシュだったら
                object.material.dispose();
                object.geometry.dispose();
            }
        });
    });

    userMeshList.delete(id);
}

// 表情分析の結果をアイコン右下の子ネコに反映
export function setKittenIcon(id, status) {
    if (userMeshList.has(id) == false) {
        console.log("Error!")
        return;
    }

    let kitten = userMeshList.get(id).kitten;
    kitten.material = kittenIconMaterial[kitten.name][status];
}

export function userSetPos(id, position) {
    if (userMeshList.has(id) == false) {
        console.error("Error!")
        return;
    }

    let userMesh = userMeshList.get(id);

    userMesh.name.position.x = position.x;
    userMesh.name.position.z = position.y + 30;
    userMesh.icon.position.x = position.x;
    userMesh.icon.position.z = position.y;
    userMesh.frame.position.x = position.x;
    userMesh.frame.position.z = position.y;
    userMesh.kitten.position.x = position.x - 20;
    userMesh.kitten.position.z = position.y - 20;

    userMesh.linearMove = {
        elapsedTime: 0,
        end: true,
        from: {
            x: position.x,
            y: position.y,
        },
        to: {
            x: position.x,
            y: position.y,
        }
    }
}

// サーバーからのユーザーの移動を反映
export function userMove(id, position, end) {
    if (userMeshList.has(id) == false) {
        console.error("Error!")
        return;
    }

    let userMesh = userMeshList.get(id);

    userMesh.linearMove = {
        elapsedTime: 0,
        end: end,
        from: {
            x: userMesh.icon.position.x,
            y: userMesh.icon.position.z,
        },
        to: {
            x: position.x,
            y: position.y,
        }
    }
}

export function userUpdate(userMesh, delta) {
    if (userMesh.linearMove == null) {
        return;
    }
    let pos;
    userMesh.linearMove.elapsedTime += delta;
    if (userMesh.linearMove.end == true && userMesh.linearMove.elapsedTime / 0.1 >= 1) {
        //return;
        pos = {
            x: userMesh.linearMove.to.x,
            y: userMesh.linearMove.to.y
        }
    }
    else {
        pos = {
            x: lerp(userMesh.linearMove.from.x, userMesh.linearMove.to.x, userMesh.linearMove.elapsedTime / 0.1),
            y: lerp(userMesh.linearMove.from.y, userMesh.linearMove.to.y, userMesh.linearMove.elapsedTime / 0.1),
        }
    }

    userMesh.name.position.x = pos.x;
    userMesh.name.position.z = pos.y + 30;
    userMesh.icon.position.x = pos.x;
    userMesh.icon.position.z = pos.y;
    userMesh.frame.position.x = pos.x;
    userMesh.frame.position.z = pos.y;
    userMesh.kitten.position.x = pos.x - 20;
    userMesh.kitten.position.z = pos.y - 20;
}