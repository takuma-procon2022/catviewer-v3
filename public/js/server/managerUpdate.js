import { catUpdate } from "./catManager.js";
import { groupList } from "./groupManager.js";

import { syncGroup } from "./../threejs/groupManager.js"

const delta = 0.05;



export function startUpdateGroup() {
    // setInterval(() => {
        groupList.forEach((meshList, groupId) => { // 親ネコごとの更新
            if (meshList != undefined) {
                meshList.cat.forEach((catMesh, num) => {
                    if (catMesh != undefined) {
                        // catMesh.mixer.update(delta); // アニメーション更新
                        catUpdate(catMesh, delta)
                        // console.log(catMesh.mesh.position)
                    }
                })
            }
        })

        syncGroup(groupList);
    // }, delta * 1000)


    
}

