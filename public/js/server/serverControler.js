import { getRandomInt, lerp } from "./useful.js"
import { addGroup } from "./groupManager.js";
import * as client from "../threejs/groupManager.js";

window.addGroup = addGroup
window.clientaddGroup = client.addGroup;

function getRandomIntMax(max) {
    return Math.floor(Math.random() * max);
}


export function clickAddCat() {

    console.log("test")
    let groupId = getRandomIntMax(10000000);
    let groupPos = {
        x: getRandomInt(-1, 1),
        y: getRandomInt(-1, 1),
    }
    addGroup(groupId, groupPos)
    client.addGroup(groupId, groupPos)
}