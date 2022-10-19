import { camera, scene } from "./mainController.js"
// import { leaveMessege } from "./../voicecat/voicecat.js"

//canvasを取得
const container = document.querySelector('#labelCanvas');

let mouse;
let raycaster;
let clickFlg = false;
let moveFlg = false;
 

 
export function setControll(){
    mouse = new THREE.Vector2();
 
    //レイキャストを生成
    raycaster = new THREE.Raycaster();
    container.addEventListener('mousemove',handleMouseMove);
 
    //マウスイベントを登録
    container.addEventListener('click',handleClick);
 
    function handleMouseMove(event){
        moveFlg = true;
        const element = event.currentTarget;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        mouse.x = (x/w)*2-1;
        mouse.y = -(y/h)*2+1;
    }
 
    function handleClick(event){
        if(clickFlg){
            // leaveMessege();
        }
    }
}

export function lobbyClickCheck() {
    raycaster.setFromCamera(mouse,camera);
 
    //光線と交差したオブジェクトを取得
    const intersects = raycaster.intersectObjects(scene.children,false);
 
    //光線と交差したオブジェクトがある場合
    if(intersects.length > 0){
 
        //交差したオブジェクトを取得
        const obj = intersects[0].object;
        // console.log(intersects[0].point)
 
        //光線が球体と交差していた場合
        if(obj.name == 'lobby'){
            if(moveFlg){
                clickFlg = true;
            }
        }else{
            clickFlg = false;
        }
    }else{
        clickFlg = false;
    }

    if(clickFlg){
        container.style.cursor = 'pointer';
    }else{
        container.style.cursor = 'default';
    }
}