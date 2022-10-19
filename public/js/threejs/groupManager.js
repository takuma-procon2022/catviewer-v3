import { scene, groupList, catKinds, catScale, fukidashiList } from "./mainController.js";
import { addCat } from "./meshManager/catMeshManager.js";
import { addKotatsu } from "./meshManager/groupMeshManager.js";
import { addKanban, delKanban } from "./meshManager/kanbanMeshManager.js";
import { getRandomInt, lerp } from "/js/voicecat/useful.js"
// import { sendKanbanText } from "/js/voicecat/kanban.js"
import { addFukidashi } from "./meshManager/fukidashiMeshManager.js";



// グループ追加
export async function addGroup(groupId, position, kanbanText) {
    if (groupList.has(groupId)) {
        console.log("This group has already added");
        return;
    }

    // グループ中心にこたつ配置
    // let kotatsu = await addKotatsu(position);

    // 少しずれた位置に親ネコ追加
    let cat1 = await addCat("walk", {
        x: position.x - 150,
        y: getRandomInt(position.y - 50, position.y + 50),
    }, catKinds[getRandomInt(0, catKinds.length)], getRandomInt(40, 70));

    // 少しずれた位置に親ネコ追加
    let cat2 = await addCat("walk", {
        x: position.x + 150,
        y: getRandomInt(position.y - 50, position.y + 50),
    }, catKinds[getRandomInt(0, catKinds.length)], getRandomInt(40, 70));

    // let [kanbanImgMesh, kanbanLabel] = await addKanban(groupId, {
    //     x: position.x - 200,
    //     y: position.y + 250,
    // }, kanbanText)


    // グループリストにメッシュを格納
    groupList.set(groupId, {
        kotatsu: null,
        cat: [cat1, cat2],
        kanban: {
            imgMesh: null,
            label: null,
        },
        // kanban: {
        //     imgMesh: kanbanImgMesh,
        //     label: kanbanLabel,
        // },
    });

}

// グループ削除
export function delGroup(groupId) {
    if (groupList.has(groupId) == false) {
        console.log("Can't find group");
        return;
    }

    let group = groupList.get(groupId);

    // こたつをシーンから削除
    // scene.remove(group.kotatsu);
    // group.kotatsu.material.dispose();
    // group.kotatsu.geometry.dispose();

    // 親ネコをシーンから削除
    group.cat.forEach(cat => {
        scene.remove(cat.mesh);

        cat.mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
            if (object.isMesh) { //その構成要素がメッシュだったら
                object.material.dispose();
                object.geometry.dispose();
            }
        });
    });

    // delKanban(groupId);
    delFukidashi(groupId);

    // メッシュが格納されていたグループリストからグループを削除
    groupList.delete(groupId);
}

export function editKanban(e) {
    let kanbanText = window.prompt("新しい話題名を入力してください", e.srcElement.innerText)
    console.log(kanbanText)
    if (kanbanText == null) {
        return;
    }

    e.currentTarget.children[0].children[0].style.color = "black";
    e.currentTarget.children[0].children[0].innerText = kanbanText;

    sendKanbanText(e.currentTarget.className, kanbanText);
}

export function setKanbanText(groupId, kanbanText) {
    document.getElementById(groupId + "_kanban").children[0].children[0].style.color = "black";
    document.getElementById(groupId + "_kanban").children[0].children[0].innerText = kanbanText;
}



export async function setFukidashi(groupId, fukidashiText) {
    if (groupList.has(groupId) == false) {
        console.error("Can't find group.")
        return;
    }

    if (fukidashiList.has(groupId)) {
        delFukidashi(groupId);
    }

    let catMesh = groupList.get(groupId).cat[1].mesh;


    let [fukidashiMesh, fukidashiLabel] = await addFukidashi({
        x: catMesh.position.x,
        y: catMesh.position.z + 180,
    }, fukidashiText)

    let fukidashiMeshList = {
        Mesh: fukidashiMesh,
        Label: fukidashiLabel,
        groupId: groupId,
    }


    fukidashiList.set(groupId, fukidashiMeshList)

    setTimeout(()=> {
        delFukidashi(groupId)
    }, 10 * 1000)
}

function delFukidashi(groupId) {
    if (fukidashiList.has(groupId) == false) {
        console.log("Can't find group");
        return
    }

    let fukidashiMeshList = fukidashiList.get(groupId);


    scene.remove(fukidashiMeshList.Mesh);

    fukidashiMeshList.Mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
        if (object.isMesh) { //その構成要素がメッシュだったら
            object.material.dispose();
            object.geometry.dispose();
        }
    });

    scene.remove(fukidashiMeshList.Label);

    fukidashiMeshList.Label.traverse((object) => { //モデルの構成要素をforEach的に走査
        if (object.isMesh) { //その構成要素がメッシュだったら
            object.material.dispose();
            object.geometry.dispose();
        }
    });

    fukidashiList.delete(groupId);
}

export function fukidashiUpdate(fukidashiMeshList) {
    const groupId = fukidashiMeshList.groupId;

    if (groupList.has(groupId) == false) {
        console.log("Error!");
        return;
    }


    // let catPos = fukidashiMeshList.catMesh.position;
    let catPos = groupList.get(groupId).cat[1].mesh.position;

    fukidashiMeshList.Mesh.position.x = catPos.x;
    fukidashiMeshList.Mesh.position.z = catPos.z + 180;
    fukidashiMeshList.Label.position.x = catPos.x;
    fukidashiMeshList.Label.position.z = catPos.z + 210;
}

export function syncGroup(rGroupList) {
    rGroupList.forEach((group, key) =>{
        if (groupList.has(key) == false) {
            console.log("none");
            return;
        }
        rGroupList.get(key).cat.forEach((rcatObj, catnum) => {

            groupList.get(key).cat[catnum].linearMove = {
                elapsedTime: 0,
                end: true,
                from: {
                    x: groupList.get(key).cat[catnum].mesh.position.x,
                    y: groupList.get(key).cat[catnum].mesh.position.z,
                },
                fromRotate: {
                    x: groupList.get(key).cat[catnum].mesh.rotation.x,
                    y: groupList.get(key).cat[catnum].mesh.rotation.y,
                    z: groupList.get(key).cat[catnum].mesh.rotation.z,
                },
                to: {
                    x: rcatObj.mesh.position.x,
                    y: rcatObj.mesh.position.z,
                },
                toRotate: {
                    x: rcatObj.mesh.rotation.x,
                    y: rcatObj.mesh.rotation.y,
                    z: rcatObj.mesh.rotation.z,
                }
            }

            if (groupList.get(key).cat[catnum].serverSyncData.actions.num != rcatObj.actions) {
                groupList.get(key).cat[catnum].serverSyncData.actions = {
                    num: rcatObj.actions,
                    iscomplete: false,
                }
                console.log(groupList.get(key).cat[catnum].serverSyncData.actions)
            }
            if (groupList.get(key).cat[catnum].serverSyncData.kittenKind.name != rcatObj.kittenKind) {
                groupList.get(key).cat[catnum].serverSyncData.kittenKind = {
                    name: rcatObj.kittenKind,
                    iscomplete: false,
                }
            }
        })
    })
}