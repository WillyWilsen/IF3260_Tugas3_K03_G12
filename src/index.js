const save_btn = document.getElementById('save-btn');
const load_btn = document.getElementById('load-btn');
const camera_zoom = document.getElementById('camera_zoom');
const camera_angle_x = document.getElementById('camera_angle_x');
const camera_angle_y = document.getElementById('camera_angle_y');
const camera_angle_z = document.getElementById('camera_angle_z');
const tree = document.getElementById('div-tree');
const add_component_btn = document.getElementById('add-component-btn');
const selected_component = document.getElementById('selected-component');
const reset_btn = document.getElementById('reset-btn');
const mapping_dropdown = document.getElementById('dropdown-mapping');

function app() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (models.length){
        models[0].draw(renderer, gl);
    }
    setTimeout(app, 16);
}
setTimeout(app, 16);

function getSelectedChildIdx(model, child = []) {
    let findIdx = false;
    for(let i=0; i<model.children.length; i++){
        if (model.children[i].id === models[selectedIdx].id) {
            findIdx = true;
            child.push(i);
            childIdx = child;
            return true;
        }
    }

    if (!findIdx) {
        for(let i=0; i<model.children.length; i++){
            if (i !== 0) {
                child.splice(child.length - 1, 1);
            }
            child.push(i);
            if (getSelectedChildIdx(model.children[i], child)) {
                return true;
            }
        }   
    }
    return false;
}

save_btn.addEventListener("click", e => {
    const objectsToSave = models[selectedIdx];
  
     const objectsStr = JSON.stringify(objectsToSave);
     
     // Create download element
     const downloadElement = document.createElement('a');
     downloadElement.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(objectsStr));
     downloadElement.setAttribute('download', 'models');
     downloadElement.style.display = 'none';
     document.body.appendChild(downloadElement);
  
     // Click and remove download element
     downloadElement.click();
     document.body.removeChild(downloadElement);
})

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
        if (!models.length) {
            loadModel(rawObject, 0, true);
            changeSelected(0);
        } else {
            const idx = models.length;
            loadModel(rawObject, models[selectedIdx].level, false);
            changeSelected(idx);
        }
    }
    reader.readAsText(file)
}
 
function loadModel(rawObject, level, createNewModel, parentIdx=undefined){
    const newModel = new Model(models.length + 1, rawObject.name, [], [], [], level);
    let selectedParentIdx = null;
    if (!createNewModel) {
        getSelectedChildIdx(models[0]);
        let parentModel = 'models[0]';
        for (i = 0; i < childIdx.length - 1; i++) {
            parentModel += `.children[${childIdx[i]}]`;
        }
        selectedParentIdx = eval(`${parentModel}.id`);
        const changeModel = `${parentModel}.children[${childIdx[childIdx.length - 1]}]`;
        removeTree(models[selectedIdx]);
        eval(`${changeModel} = newModel`);
    }

    const children = rawObject.children;
    delete rawObject.children;

    Object.assign(newModel, rawObject);

    models.push(newModel);
    if (!createNewModel) {
        appendToTree(newModel, level*20+2, document.getElementById(`component-${selectedParentIdx}`));
    } else {
        appendToTree(newModel, level*20+2, parentIdx ? document.getElementById(`component-${parentIdx}`) : undefined);
    }

    for(let i=0; i<children.length; i++){
        newModel.addChild(loadModel(children[i], level+1, true, newModel.id));
    }

    return newModel;
}

function appendToTree(model, leftMargin, parentBtn=undefined){
    const modelButton = document.createElement("button");
    modelButton.id = `component-${model.id}`;
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

function removeTree(model) {
    const tree = document.getElementById(`component-${model.id}`);
    tree.remove();
    for(let i=0; i<model.children.length; i++){
        removeTree(model.children[i]);
    }
}

function changeSelected(idx){
    selectedIdx = idx;
    selected_component.innerHTML = models[selectedIdx].name;
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
    const newModel = new Model(models.length + 1, name, vertices, colors, faces, level);
    models[parentIdx].addChild(newModel);
    models.push(newModel);
    appendToTree(newModel, level*20+2, models[parentIdx].button);
    
}
add_component_btn.addEventListener("click", function(){
    addComponent(selectedIdx);
});

function reset() {
}
reset_btn.addEventListener("click", function(){
    cameraZoomHandler(5);
    cameraRotationHandler(0, "x");
    cameraRotationHandler(0, "y");
    cameraRotationHandler(0, "z");
    document.getElementById("camera_zoom").value = 5;
    document.getElementById("camera_angle_x").value = 0;
    document.getElementById("camera_angle_y").value = 0;
    document.getElementById("camera_angle_z").value = 0;
});

mapping_dropdown.addEventListener('change', (e) => {
    if (e.target.value == "none"){
        renderer.setMappingType(0);
    } else if (e.target.value == "texture"){
        renderer.prepareTexture();
        renderer.setMappingType(1);
    } else if (e.target.value == "environment"){
        renderer.prepareEnvironment();
        renderer.setMappingType(2);
    } else if (e.target.value == "bump"){
        renderer.setMappingType(3);
    }
});