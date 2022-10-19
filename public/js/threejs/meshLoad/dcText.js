// 文字表示
// https://discourse.threejs.org/t/an-example-of-text-to-canvas-to-texture-to-material-to-mesh-not-too-difficult/13757


export function dcText(txt, hWorldTxt, hWorldAll, hPxTxt, fgcolor, bgcolor) {

    var kPxToWorld = hWorldTxt / hPxTxt;                // Px to World multplication factor
    // hWorldTxt, hWorldAll, and hPxTxt are given; get hPxAll
    var hPxAll = Math.ceil(hWorldAll / kPxToWorld);     // hPxAll: height of the whole texture canvas
    // create the canvas for the texture
    var txtcanvas = document.createElement("canvas"); // create the canvas for the texture
    var ctx = txtcanvas.getContext("2d");
    ctx.font = hPxTxt + "px sans-serif";
    // now get the widths
    var wPxTxt = ctx.measureText(txt).width;         // wPxTxt: width of the text in the texture canvas
    var wWorldTxt = wPxTxt * kPxToWorld;               // wWorldTxt: world width of text in the plane
    var wWorldAll = wWorldTxt + (hWorldAll - hWorldTxt); // wWorldAll: world width of the whole plane
    var wPxAll = Math.ceil(wWorldAll / kPxToWorld);    // wPxAll: width of the whole texture canvas
    // next, resize the texture canvas and fill the text
    txtcanvas.width = wPxAll;
    txtcanvas.height = hPxAll;


    if (bgcolor != undefined) { // fill background if desired (transparent if none)
        ctx.fillStyle = "#" + bgcolor.toString(16).padStart(6, '0');
        ctx.fillRect(0, 0, wPxAll, hPxAll);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#" + fgcolor.toString(16).padStart(6, '0'); // fgcolor
    ctx.font = hPxTxt + "px sans-serif";   // needed after resize
    ctx.fillText(txt, wPxAll / 2, hPxAll / 2); // the deed is done
    // next, make the texture
    var texture = new THREE.Texture(txtcanvas); // now make texture
    texture.minFilter = THREE.LinearFilter;     // eliminate console message
    texture.needsUpdate = true;                 // duh
    // and make the world plane with the texture
    let geometry = new THREE.PlaneGeometry(wWorldAll, hWorldAll);
    var material = new THREE.MeshBasicMaterial(
        { side: THREE.DoubleSide, map: texture, transparent: true, opacity: 1.0 });
    // and finally, the mesh
    var mesh = new THREE.Mesh(geometry, material);
    mesh.wWorldTxt = wWorldTxt; // return the width of the text in the plane
    mesh.wWorldAll = wWorldAll; //    and the width of the whole plane
    mesh.wPxTxt = wPxTxt;       //    and the width of the text in the texture canvas
    // (the heights of the above items are known)
    mesh.wPxAll = wPxAll;       //    and the width of the whole texture canvas
    mesh.hPxAll = hPxAll;       //    and the height of the whole texture canvas
    mesh.ctx = ctx;             //    and the 2d texture context, for any glitter

    return mesh;
}