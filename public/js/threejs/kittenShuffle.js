import { userMeshList, groupList, kittenList, kittenScale, scene, ownUserId, kittenFukidashiList } from "./mainController.js";
import { addCat } from "./meshManager/catMeshManager.js";
import { addFukidashi } from "./meshManager/fukidashiMeshManager.js"
// import { userList } from "../voicecat/voicecat.js";
import { addHighLight } from "./meshManager/highLightMeshManager.js"

let catSound = new Audio('./assets/env/kitten/sound/cat.mp3');
catSound.volume = 0.1;




// シャッフル開始
export async function startNekoShuffle(selectedUserId, toGroupId) {
    let selectedUserMesh = userMeshList.get(selectedUserId);
    let kitten;

    let kittenAudioInterval;

    // 子ネコの追加
    kitten = await addCat("walk", {
        x: selectedUserMesh.icon.position.x,
        y: selectedUserMesh.icon.position.z + 180,
    }, selectedUserMesh.kitten.name, kittenScale);

    // 従えているユーザーに近づく
    kitten.state.job = "goNearUser";
    kitten.state.selectedUserId = selectedUserId;
    kitten.state.toGroupId = toGroupId;


    // メッシュをMapに追加
    kittenList.set(selectedUserId, kitten);

    if (selectedUserId == ownUserId) {
        setFukidashi(selectedUserId, `${userList.get(selectedUserId).name} さん<br>一緒に移動しませんか?`)
        kittenList.get(selectedUserId).highLight = await addHighLight({
            x: selectedUserMesh.icon.position.x,
            y: selectedUserMesh.icon.position.z + 180,
        })
    }



    // catSound.play()
    kittenAudioInterval = setInterval(() => {
        catSound.play()
    }, 15 * 1000)


    setTimeout(() => {

        clearInterval(kittenAudioInterval)



        scene.remove(kitten.mesh);

        kitten.mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
            if (object.isMesh) { //その構成要素がメッシュだったら
                object.material.dispose();
                object.geometry.dispose();
            }
        });

        if (selectedUserId == ownUserId) {
            delFukidashi(selectedUserId)

            scene.remove(kitten.highLight);

            kitten.highLight.traverse((object) => { //モデルの構成要素をforEach的に走査
                if (object.isMesh) { //その構成要素がメッシュだったら
                    object.material.dispose();
                    object.geometry.dispose();
                }
            });
        }

        // 子ネコが格納されていたメッシュリストから削除
        kittenList.delete(kitten.state.selectedUserId)
    }, 40 * 1000)

}

// ユーザーが子ネコのグループ移動の提案を受け入れた
export function acceptNekoShuffle(selectedUserId) {
    if (!(kittenList.has(selectedUserId))) {
        return;
    }

    let kitten = kittenList.get(selectedUserId);
    let toGroupMesh = groupList.get(kitten.state.toGroupId)

    if (selectedUserId == ownUserId) {
        delFukidashi(selectedUserId)

        scene.remove(kitten.highLight);

        kitten.highLight.traverse((object) => { //モデルの構成要素をforEach的に走査
            if (object.isMesh) { //その構成要素がメッシュだったら
                object.material.dispose();
                object.geometry.dispose();
            }
        });
    }

    // 提案したグループに行く
    kitten.state.job = "goToGroup";
    kitten.state.name = "walk"
    kitten.state.iscomplete = false;
    kitten.state.toposition = {
        x: toGroupMesh.kotatsu.position.x,
        y: toGroupMesh.kotatsu.position.z,
    }

    // 歩くモーション再開
    kitten.actions[5].reset()
    kitten.actions[5].fadeIn()
    kitten.actions[5].play()
}


export async function setFukidashi(userId, fukidashiText) {
    if (kittenList.has(userId) == false) {
        console.error("Can't find kitten.")
        return;
    }

    // if (fukidashiList.has(groupId)) {
    //     delFukidashi(groupId);
    // }

    let kittenMesh = kittenList.get(userId).mesh;


    let [fukidashiMesh, fukidashiLabel] = await addFukidashi({
        x: kittenMesh.position.x,
        y: kittenMesh.position.z + 120,
    }, fukidashiText)

    let kittenFukidashiMeshList = {
        Mesh: fukidashiMesh,
        Label: fukidashiLabel,
        userId: userId,
    }


    kittenFukidashiList.set(userId, kittenFukidashiMeshList)
}

function delFukidashi(userId) {
    if (kittenFukidashiList.has(userId) == false) {
        console.log("Can't find user");
        return
    }

    let kittenFukidashiMeshList = kittenFukidashiList.get(userId);


    scene.remove(kittenFukidashiMeshList.Mesh);

    kittenFukidashiMeshList.Mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
        if (object.isMesh) { //その構成要素がメッシュだったら
            object.material.dispose();
            object.geometry.dispose();
        }
    });

    scene.remove(kittenFukidashiMeshList.Label);

    kittenFukidashiMeshList.Label.traverse((object) => { //モデルの構成要素をforEach的に走査
        if (object.isMesh) { //その構成要素がメッシュだったら
            object.material.dispose();
            object.geometry.dispose();
        }
    });

    kittenFukidashiList.delete(userId);
}

export function kittenFukidashiUpdate(kittenFukidashiMeshList) {
    const userId = kittenFukidashiMeshList.userId;

    if (kittenList.has(userId) == false) {
        console.log("Error!");
        return;
    }


    // let catPos = fukidashiMeshList.catMesh.position;
    let catPos = kittenList.get(userId).mesh.position;

    kittenFukidashiMeshList.Mesh.position.x = catPos.x;
    kittenFukidashiMeshList.Mesh.position.z = catPos.z + 120;
    kittenFukidashiMeshList.Label.position.x = catPos.x;
    kittenFukidashiMeshList.Label.position.z = catPos.z + 150;
}


