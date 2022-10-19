export let groupList = new Map();


import { getRandomInt, lerp } from "./useful.js"
import { addCat } from "./catManager.js"

const catScale = 60;
const catKinds = ["buchi", "gray", "hokke", "kutsushita", "mike", "white"] // ネコの種類

export function addGroup(groupId, position) {
    if (groupList.has(groupId)) {
        console.log("This group has already added");
        return;
    }

    // 少しずれた位置に親ネコ追加
    let cat1 = addCat("walk", {
        x: position.x - 150,
        y: getRandomInt(position.y - 50, position.y + 50),
    }, catKinds[getRandomInt(0, catKinds.length)], catScale);

    // 少しずれた位置に親ネコ追加
    let cat2 = addCat("walk", {
        x: position.x + 150,
        y: getRandomInt(position.y - 50, position.y + 50),
    }, catKinds[getRandomInt(0, catKinds.length)], catScale);

    // グループリストにメッシュを格納
    groupList.set(groupId, {
        cat: [cat1, cat2],
    });
}

export function delGroup(groupId) {
    if (groupList.has(groupId) == false) {
        console.log("Can't find group");
        return;
    }


    // メッシュが格納されていたグループリストからグループを削除
    groupList.delete(groupId);
}
