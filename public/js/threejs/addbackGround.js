export function initBackgroud (scene) {

    // 床を追加
    new THREE.TextureLoader().load(
        "/assets/env/background.png",
        texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.offset.x = 90 / (2 * Math.PI);
            texture.repeat.set(18, 16);
            let carpetMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });

            let groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(4000, 2600, 32),
                carpetMaterial
            );
            groundMesh.receiveShadow = true;

            groundMesh.rotation.x = Math.PI / 2;
            // groundMesh.scale.set(400.0, 260.0, 30.0);
            groundMesh.position.set(30, -100, 0);
            scene.add(groundMesh);
        }
    );

    // 中央のロビーを追加
    new THREE.TextureLoader().load(
        "/assets/env/decoration/lobby.png",
        texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            let woodMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.99,
            });

            let groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(500, 500, 32),
                woodMaterial
            );

            groundMesh.rotation.x = Math.PI / 2;
            groundMesh.rotation.y = Math.PI;
            groundMesh.position.set(0, -95, 0);
            groundMesh.name = "lobby";
            scene.add(groundMesh);
            
            return groundMesh;
        }
    );

}