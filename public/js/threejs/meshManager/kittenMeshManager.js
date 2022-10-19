import { scene, userMeshList, kittenList } from "../mainController.js";
import { catWalk, catRotate } from "./catMeshManager.js";
import { acceptNekoShuffle } from "../kittenShuffle.js";

// 1フレームごとに子ネコの動き計算
export function kittenUpdate(obj, delta) {

    let selectedUserMesh = userMeshList.get(obj.state.selectedUserId);

    // 歩くか
    if (obj.state.name == "walk") {
        catWalk(obj, delta);

        // 目的地に到達して仕事が完了したか
        if (obj.state.iscomplete) {
            if (obj.state.job == "goNearUser") {
                // ユーザーに十分近づいた

                // 提案してユーザーの近くで待つ
                obj.state.name = "wait";
                obj.state.job = "shuffleSuggestWait";
                obj.state.iscomplete = false;

                // 歩行を止め立ったまま
                obj.actions[5].fadeOut(1);
            }

            if (obj.state.job == "goToGroup") {
                // 提案したグループに到着した

                // 子ネコを削除
                scene.remove(obj.mesh);

                obj.mesh.traverse((object) => { //モデルの構成要素をforEach的に走査
                    if (object.isMesh) { //その構成要素がメッシュだったら
                        object.material.dispose();
                        object.geometry.dispose();
                    }
                });

                // 子ネコが格納されていたメッシュリストから削除
                kittenList.delete(obj.state.selectedUserId)
            }

        }
    }

    // 待つか
    if (obj.state.name == "wait") {
        catRotate(obj, obj.state.torotation)

        if (obj.state.job == "shuffleSuggestWait") {
            // ユーザーに提案して待つ

            // ユーザーの方向を常に向く
            let todiffposition = {
                x: selectedUserMesh.icon.position.x - obj.mesh.position.x,
                y: selectedUserMesh.icon.position.z - obj.mesh.position.z,
            }

            let torotation = Math.atan((-todiffposition.y) / todiffposition.x) + (Math.PI / 2);
            if (todiffposition.x < 0) {
                torotation += Math.PI;
            }

            // 計算した方向を代入
            obj.state.torotation = torotation;

            if (Math.abs(obj.mesh.position.x - selectedUserMesh.icon.position.x) < 90 && Math.abs(obj.mesh.position.z - selectedUserMesh.icon.position.z) < 90) {
                // 子ネコに近づきユーザーが提案を承認したと判断
                acceptNekoShuffle(obj.state.selectedUserId);
            }
        }
    }

    // 座って待つ
    if (obj.state.name == "sit") {
        catRotate(obj, obj.state.torotation);

    }
}