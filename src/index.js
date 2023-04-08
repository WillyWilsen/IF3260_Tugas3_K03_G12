const load_btn = document.getElementById('load-btn');
const camera_zoom = document.getElementById('camera_zoom');
const camera_angle_x = document.getElementById('camera_angle_x');
const camera_angle_y = document.getElementById('camera_angle_y');
const camera_angle_z = document.getElementById('camera_angle_z');
const tree = document.getElementById('div-tree');
const add_component_btn = document.getElementById('add-component-btn');

function app() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (models.length != 0){
        models[0].draw(renderer, gl);
    }
    setTimeout(app, 16);
}
setTimeout(app, 16);

load_btn.addEventListener("click", e => {
    const uploadElement = document.createElement('input');
    uploadElement.type = "file";
    uploadElement.accept = "application/json";
    uploadElement.style.display = 'none';
    document.body.appendChild(uploadElement);

    uploadElement.onchange = fileUploaded;
    uploadElement.click();

    document.body.removeChild(uploadElement);
})
 
function fileUploaded(e) {
    const files = e.target.files
    if (files.length == 0) {
        return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const rawObject = JSON.parse(e.target.result);
        loadModel(rawObject, 0);
        selectedIdx = 0;
    }
    reader.readAsText(file)
}
 
function loadModel(rawObject, level){
    const newModel = new Model(rawObject.name, [], [], [], level);

    const children = rawObject.children;
    delete rawObject.children;

    Object.assign(newModel, rawObject);

    models.push(newModel);
    appendToTree(newModel, level*20+2);

    for(let i=0; i<children.length; i++){
        newModel.addChild(loadModel(children[i], level+1));
    }
    
    return newModel;
}

function appendToTree(model, leftMargin, parentBtn=undefined){
    const modelButton = document.createElement("button");
    modelButton.textContent = model.name;
    modelButton.style.marginLeft = leftMargin.toString()+"px";
    modelButton.classList.add("block");
    const idx = models.length - 1;
    modelButton.addEventListener("click", function(){
        changeSelected(idx);
    });
    model.setButton(modelButton);
    if (parentBtn){
        parentBtn.insertAdjacentElement("afterend", modelButton);
    } else {
        tree.appendChild(modelButton);
    }
}

function changeSelected(idx){
    selectedIdx = idx;
    console.log(models[selectedIdx]);
}

function cameraZoomHandler(distance){
    renderer.moveCameraTo(distance);
}
camera_zoom.addEventListener("input", (e) => {
    cameraZoomHandler(e.target.value);
});

function cameraRotationHandler(degree, axis){
    renderer.rotateCamera(degree, axis);
}
camera_angle_x.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "x");
});
camera_angle_y.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "y");
});
camera_angle_z.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "z");
});

function addComponent(parentIdx){
    const name = "Cube " + models.length.toString();
    const vertices = [-1.2,-1.2, 1.2, 1.2,-1.2, 1.2, 1.2, 1.2, 1.2, -1.2, 1.2, 1.2, -1.2,-1.2,-1.2, 1.2,-1.2,-1.2, 1.2, 1.2,-1.2, -1.2, 1.2,-1.2];
    const colors = [1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1];
    const faces = [0,1,2, 0,2,3, 4,5,6, 4,6,7, 0,3,4, 3,4,7, 1,2,5, 2,5,6, 0,1,4, 1,4,5, 2,3,6, 3,6,7];
    const level = models[parentIdx].level + 1;
    const newModel = new Model(name, vertices, colors, faces, level);
    models[parentIdx].addChild(newModel);
    models.push(newModel);
    appendToTree(newModel, level*20+2, models[parentIdx].button);
    
}
add_component_btn.addEventListener("click", function(){
    addComponent(selectedIdx);
});