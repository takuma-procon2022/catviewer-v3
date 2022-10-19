import { scene } from "../mainController.js"

export function addFukidashi(position, fukidashiText) {
    let promiseFukidashi = [];
    promiseFukidashi.push(new Promise((resolve) => {
        new THREE.TextureLoader().load(
            "./../../../assets/env/group/fukidashi.png",
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                let fukidashiMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.85,
                });;

                let fukidashiMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(280, 152, 32),
                    fukidashiMaterial
                );

                fukidashiMesh.rotation.x = Math.PI / 2;
                // groundMesh.scale.set(400.0, 260.0, 30.0);
                fukidashiMesh.position.set(position.x, 400, position.y);
                scene.add(fukidashiMesh);
                resolve(fukidashiMesh);
            }
        );
    }))

    promiseFukidashi.push(new Promise((resolve) => {
        const fukidashiDiv = document.createElement("div");
        fukidashiDiv.style.margin = "auto";
        fukidashiDiv.style.height = "120px";
        fukidashiDiv.style.width = "250px";
        // fukidashiDiv.style.top = "34%";
        fukidashiDiv.style.position = "relative"
        fukidashiDiv.style.zIndex = 0;
        const fukidashiTextDiv = document.createElement("div");
        fukidashiTextDiv.style.width = "240px";
        fukidashiTextDiv.style.height = "40px";
        fukidashiTextDiv.style.textAlign = "center";
        fukidashiTextDiv.style.display = "flex";
        fukidashiTextDiv.style.alignItems = "center";
        fukidashiTextDiv.style.fontSize = "1.2em";


        fukidashiTextDiv.style.justifyContent = "center";
        fukidashiTextDiv.style.position = "absolute";
        fukidashiTextDiv.style.top = "50%"
        fukidashiTextDiv.style.bottom = "50%"
        fukidashiTextDiv.style.flexDirection = "center"
        
        fukidashiDiv.appendChild(fukidashiTextDiv);

        if (fukidashiText == "" || fukidashiText == null) {
            fukidashiTextDiv.innerText = "Error";
            fukidashiTextDiv.style.color = "gray";
        } else {
            fukidashiTextDiv.innerHTML = fukidashiText;
            fukidashiTextDiv.style.color = "black";
        }

        const fukidashiLabel = new THREE.CSS3DObject(fukidashiDiv);
        fukidashiLabel.position.set(position.x, 400, position.y+30);
        fukidashiLabel.rotation.x = Math.PI / 2;
        fukidashiLabel.rotation.y = Math.PI;
        scene.add(fukidashiLabel);

        resolve(fukidashiLabel);

    }))

    return Promise.all(promiseFukidashi);

}