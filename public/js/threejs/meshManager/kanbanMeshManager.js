import { groupList, scene } from "../mainController.js"
import { editKanban } from "../groupManager.js";

export function addKanban(groupId, position, kanbanText) {
    let promiseKanban = [];
    promiseKanban.push(new Promise((resolve) => {
        new THREE.TextureLoader().load(
            "./../../../assets/env/group/board.png",
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                let kanbanMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.85,
                });;

                let kanbanMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(271, 203, 32),
                    kanbanMaterial
                );

                kanbanMesh.rotation.x = Math.PI / 2;
                // groundMesh.scale.set(400.0, 260.0, 30.0);
                kanbanMesh.position.set(position.x, 500, position.y);
                scene.add(kanbanMesh);
                resolve(kanbanMesh);
            }
        );
    }))

    promiseKanban.push(new Promise((resolve) => {
        const kanbanParent = document.createElement("div");
        kanbanParent.style.height = "200px";
        kanbanParent.style.cursor = "pointer"
        kanbanParent.id = groupId + "_kanban";
        kanbanParent.className = groupId;
        kanbanParent.style.zIndex = 1;
        const kanbanDiv = document.createElement("div");
        kanbanDiv.style.margin = "auto";
        kanbanDiv.style.height = "120px";
        kanbanDiv.style.width = "250px";
        kanbanDiv.style.top = "34%";
        kanbanDiv.style.position = "relative"
        const kanbanTextDiv = document.createElement("div");
        kanbanTextDiv.style.width = "240px";
        kanbanTextDiv.style.height = "20px";
        kanbanTextDiv.style.textAlign = "center";
        kanbanTextDiv.style.display = "flex";
        kanbanTextDiv.style.alignItems = "center";
        kanbanTextDiv.style.fontSize = "2em";


        kanbanTextDiv.style.justifyContent = "center";
        kanbanTextDiv.style.position = "absolute";
        kanbanTextDiv.style.top = "50%"
        kanbanTextDiv.style.bottom = "50%"
        kanbanTextDiv.style.flexDirection = "center"
        // const kanbanTextBox = document.createElement("input");
        // kanbanTextBox.type = "text";
        // kanbanTextBox.innerText = "こんにちは"
        // kanbanTextBox.style.margin = "auto";
        // kanbanTextBox.style.height = "120px";
        // kanbanTextBox.style.width = "250px";

        kanbanDiv.appendChild(kanbanTextDiv);
        kanbanParent.appendChild(kanbanDiv);

        if (kanbanText == "" || kanbanText == null) {
            kanbanTextDiv.innerText = "ここをクリックして話題を入力";
            kanbanTextDiv.style.color = "gray";
        } else {
            kanbanTextDiv.innerText = kanbanText;
            kanbanTextDiv.style.color = "black";
        }

        kanbanParent.addEventListener("pointerdown", editKanban)

        const kanbanLabel = new THREE.CSS3DObject(kanbanParent);
        kanbanLabel.position.set(position.x, 500, position.y);
        kanbanLabel.rotation.x = Math.PI / 2;
        kanbanLabel.rotation.y = Math.PI;
        scene.add(kanbanLabel);

        resolve(kanbanLabel);

    }))

    return Promise.all(promiseKanban);

}

export function delKanban(groupId) {
    if (groupList.has(groupId) == false) {
        console.log("Error! Kanban has not generated");
    }

    let kanbanMeshList = groupList.get(groupId).kanban;
    
    Object.keys(kanbanMeshList).forEach(key => {
        scene.remove(kanbanMeshList[key]);
        kanbanMeshList[key].traverse((object) => { //モデルの構成要素をforEach的に走査
            if (object.isMesh) { //その構成要素がメッシュだったら
                object.material.dispose();
                object.geometry.dispose();
            }
        });
    });

    
}