import { scene } from "../mainController.js";

export function addHighLight(position) {
    return new Promise((resolve) => {
        let highlightMaterial = new THREE.MeshPhongMaterial({
            color: 0x29B6F6,
            transparent: true,
            opacity: 0.35,
        });

        let hightlightmesh = new THREE.Mesh(
            new THREE.CircleGeometry(90, 26),
            highlightMaterial,
        );


        hightlightmesh.rotation.x = Math.PI / 2;
        hightlightmesh.rotation.y = Math.PI;
        hightlightmesh.position.set(position.x, 250, position.y);
        scene.add(hightlightmesh);
        resolve(hightlightmesh)
    })
}