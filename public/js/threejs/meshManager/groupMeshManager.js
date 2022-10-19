import { getRandomInt, lerp } from "./../../voicecat/useful.js"
import { scene } from "../mainController.js";
import { catWalk, catRotate, catAction, setCatMaterial } from "./catMeshManager.js";

// こたつの追加
export function addKotatsu(position) {
    return new Promise((resolve) => {
        new THREE.TextureLoader().load(
            "/assets/env/group/kotatsu.png",
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                let kotatsuMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.99,
                });
    
                let groundMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(10, 10, 32),
                    kotatsuMaterial
                );
    
                groundMesh.rotation.x = Math.PI / 2;
                groundMesh.rotation.y = Math.PI;
                groundMesh.scale.set(60.0, 60.0, 60.0);
                groundMesh.position.set(position.x, -80, position.y);
                scene.add(groundMesh);
                
    
                resolve(groundMesh);
            }
        );
    })
}


// 1フレームごとに親ネコの動き計算
export function catUpdate(obj, delta) {
    if (obj.linearMove == null) {
        return;
    }
    let pos, rotation;
    obj.linearMove.elapsedTime += delta;
    if (obj.linearMove.end == true && obj.linearMove.elapsedTime / 0.1 >= 1) {
        //return;
        pos = {
            x: obj.linearMove.to.x,
            y: obj.linearMove.to.y,
        }
        rotation = {
            x: obj.linearMove.toRotate.x,
            y: obj.linearMove.toRotate.y,
            z: obj.linearMove.toRotate.z,
        }
    }
    else {
        pos = {
            x: lerp(obj.linearMove.from.x, obj.linearMove.to.x, obj.linearMove.elapsedTime / 0.1),
            y: lerp(obj.linearMove.from.y, obj.linearMove.to.y, obj.linearMove.elapsedTime / 0.1),
        }
        rotation = {
            x: lerp(obj.linearMove.fromRotate.x, obj.linearMove.toRotate.x, obj.linearMove.elapsedTime / 0.1),
            y: lerp(obj.linearMove.fromRotate.y, obj.linearMove.toRotate.y, obj.linearMove.elapsedTime / 0.1),
            z: lerp(obj.linearMove.fromRotate.z, obj.linearMove.toRotate.z, obj.linearMove.elapsedTime / 0.1),
        }
    }
    

    obj.mesh.position.x = pos.x;
    obj.mesh.position.z = pos.y;

    obj.mesh.rotation.x = rotation.x;
    obj.mesh.rotation.y = rotation.y;
    obj.mesh.rotation.z = rotation.z;

    if (obj.serverSyncData.actions.iscomplete == false) {
        catAction(obj, obj.serverSyncData.actions.num);
        obj.serverSyncData.actions.iscomplete = true;
    }

    if (obj.serverSyncData.kittenKind.iscomplete == false) {
        setCatMaterial(obj, obj.serverSyncData.kittenKind.name);
        obj.serverSyncData.kittenKind.iscomplete = true;
    }


    // if (obj.state.name == "walk") {
    //     catWalk(obj, delta);

    //     if (obj.state.iscomplete) {
    //         obj.state.name = "sit";
    //         obj.state.torotation = getRandomInt(130, 230) * Math.PI / 180;
    //         obj.state.iscomplete = false;
    //         catAction(obj, 4);
    //     }
        
    // }
    // if (obj.state.name == "sit") {
    //     catRotate(obj, obj.state.torotation);
    // }
    
}

