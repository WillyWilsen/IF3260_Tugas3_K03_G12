const save_btn = document.getElementById('save-btn');
const load_btn = document.getElementById('load-btn');
const play_animation = document.getElementById('play-animation');
const pause_animation = document.getElementById('pause-animation');
const reverse_animation = document.getElementById('reverse-animation');
const reply_animation = document.getElementById('reply-animation');
const loopable_animation = document.getElementById('loopable-animation');

const fps = document.getElementById('fps');

const dropdown_projection = document.getElementById('dropdown_projection');
const camera_zoom = document.getElementById('camera_zoom');
const camera_angle_x = document.getElementById('camera_angle_x');
const camera_angle_y = document.getElementById('camera_angle_y');
const camera_angle_z = document.getElementById('camera_angle_z');

const model_translation_x = document.getElementById('model_translation_x');
const model_translation_y = document.getElementById('model_translation_y');
const model_translation_z = document.getElementById('model_translation_z');

const model_angle_x = document.getElementById('model_angle_x');
const model_angle_y = document.getElementById('model_angle_y');
const model_angle_z = document.getElementById('model_angle_z');

const model_scale_x = document.getElementById('model_scale_x');
const model_scale_y = document.getElementById('model_scale_y');
const model_scale_z = document.getElementById('model_scale_z');

const tree = document.getElementById('div-tree');
const add_component_btn = document.getElementById('add-component-btn');
const selected_component = document.getElementById('selected-component');
const reset_btn = document.getElementById('reset-btn');
const mapping_dropdown = document.getElementById('dropdown-mapping');

function app() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (models.length){
        models[0].draw(renderer, gl, identityMatrix());
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
    state.selectedIdx = idx;
    state.selectedModel = models[state.selectedIdx];
    selectedIdx = idx;
    
    selected_component.innerHTML = state.selectedModel.name;
    syncSliderValues();
}

function syncSliderValues() {
    const model = state.selectedModel;

    model_translation_x.value = model.translation.x;
    model_translation_y.value = model.translation.y;
    model_translation_z.value = model.translation.z;

    model_angle_x.value = model.rotation.x;
    model_angle_y.value = model.rotation.y;
    model_angle_z.value = model.rotation.z;

    model_scale_x.value = model.scale.x;
    model_scale_y.value = model.scale.y;
    model_scale_z.value = model.scale.z;
}

// Camera viewing control
function projectionHandler(projection){
    renderer.setProjection(projection);
}
dropdown_projection.addEventListener("change", (e) => {
    renderer.setProjection(e.target.value);
});

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

// Model Transformations
/// Translation
function modelTranslationHandler(x, y, z){
    const model = state.selectedModel;
    model.setTranslation(x, y, z);
}
model_translation_x.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setTranslation(parseFloat(e.target.value), model.translation.y, model.translation.z);
});
model_translation_y.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setTranslation(model.translation.x, parseFloat(e.target.value), model.translation.z);
});
model_translation_z.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setTranslation(model.translation.x, model.translation.y, parseFloat(e.target.value));
});

/// Rotation
function modelRotationHandler(degreeX, degreeY, degreeZ){
    const model = state.selectedModel;
    model.setRotation(degreeX, degreeY, degreeZ);
}
model_angle_x.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setRotation(parseFloat(e.target.value), model.rotation.y, model.rotation.z);
});
model_angle_y.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setRotation(model.rotation.x, parseFloat(e.target.value), model.rotation.z);
});
model_angle_z.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setRotation(model.rotation.x, model.rotation.y, parseFloat(e.target.value));
});

/// Scale
function modelScalenHandler(x, y, z){
    const model = state.selectedModel;
    model.setScale(x, y, z);
}
model_scale_x.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setScale(parseFloat(e.target.value), model.scale.y, model.scale.z);
});
model_scale_y.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setScale(model.scale.x, parseFloat(e.target.value), model.scale.z);
});
model_scale_z.addEventListener("input", (e) => {
    const model = state.selectedModel;
    model.setScale(model.scale.y, model.scale.y, parseFloat(e.target.value));
});


function addComponent(parentIdx){
    const name = "Cube " + models.length.toString();
    const vertices = [-1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1];
    const colors = [1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1];
    const faces = [1,3,0, 1,2,3, 5,7,4, 5,6,7, 4,3,7, 4,0,3, 6,1,5, 6,2,1, 5,0,4, 5,1,0, 7,2,6, 7,3,2];
    const level = models[parentIdx].level + 1;
    const newModel = new Model(models.length + 1, name, vertices, colors, faces, level);
    models[parentIdx].addChild(newModel);
    models.push(newModel);
    appendToTree(newModel, level*20+2, models[parentIdx].button);
    
}
add_component_btn.addEventListener("click", function(){
    addComponent(selectedIdx);
});

reset_btn.addEventListener("click", function(){
    projectionHandler("perspective");
    cameraZoomHandler(5);
    cameraRotationHandler(0, "x");
    cameraRotationHandler(0, "y");
    cameraRotationHandler(0, "z");
    modelTranslationHandler(0, 0, 0);
    modelRotationHandler(0, 0, 0);
    modelScalenHandler(1, 1, 1);
    renderer.setMappingType(0);
    getfps(30);
    document.getElementById("dropdown_projection").value = "perspective";
    document.getElementById("camera_zoom").value = 5;
    document.getElementById("camera_angle_x").value = 0;
    document.getElementById("camera_angle_y").value = 0;
    document.getElementById("camera_angle_z").value = 0;
    document.getElementById("model_translation_x").value = 0;
    document.getElementById("model_translation_y").value = 0;
    document.getElementById("model_translation_z").value = 0;
    document.getElementById("model_angle_x").value = 0;
    document.getElementById("model_angle_y").value = 0;
    document.getElementById("model_angle_z").value = 0;
    document.getElementById("model_scale_x").value = 1;
    document.getElementById("model_scale_y").value = 1;
    document.getElementById("model_scale_z").value = 1;
    document.getElementById("dropdown-mapping").value = "none";
    document.getElementById("fps").value = 30;
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
        renderer.prepareBump();
        renderer.setMappingType(3);
    }
});

// Animation
function getfps(frame){
    return frame;
 }

play_animation.addEventListener('click', (e) => {
    frame = getfps(fps.value);
    time_per_frame = 1000 / frame;
    total_frame = models[0].total_frame;
    if (current_frame >= total_frame && !isAnimationReversed) {
        current_frame = 0;
    }
    if (current_frame < 0 && isAnimationReversed) {
        current_frame = total_frame - 1;
    }
    isAnimationPaused = false;
    animate()
});

pause_animation.addEventListener('click', (e) => {
    total_frame = models[0].total_frame;
    isAnimationPaused = true;
});

reverse_animation.addEventListener('change', (e) => {
    total_frame = models[0].total_frame;
    if (reverse_animation.checked) {
        isAnimationReversed = true;
        if (current_frame >= total_frame) {
            current_frame = total_frame - 1;
        }
    } else {
        isAnimationReversed = false;
        if (current_frame < 0) {
            current_frame = 0;
        }
    }
});

reply_animation.addEventListener('click', async (e) => {
    time_per_frame = 1000 / fps.value;
    total_frame = models[0].total_frame;
    if (!isAnimationReversed) {
        current_frame = 0;
    } else {
        current_frame = total_frame - 1;
    }
    isAnimationPaused = false;
    animate()
});

loopable_animation.addEventListener('change', (e) => {
    if (loopable_animation.checked) {
        isAnimationLoopable = true;
    } else {
        isAnimationLoopable = false;
    }
});

const animate = () => {
    if (current_frame === 0 && !isAnimationReversed) {
        time = Date.now();
        animationModel(models[0], current_frame);
        current_frame++;
    }
    if (current_frame === total_frame - 1 && isAnimationReversed) {
        time = Date.now();
        animationModel(models[0], current_frame);
        current_frame--;
    }

    if (current_frame < total_frame && !isAnimationReversed) {
        if (!isAnimationPaused) {
            if (Date.now() - time >= time_per_frame) {
                time = Date.now();
                animationModel(models[0], current_frame);
                current_frame++;
            }
            requestAnimationFrame(animate);
        }
    } else if (current_frame >= 0 && isAnimationReversed) {
        if (!isAnimationPaused) {
            if (Date.now() - time >= time_per_frame) {
                time = Date.now();
                animationModel(models[0], current_frame);
                current_frame--;
            }
            requestAnimationFrame(animate);
        }
    } else {
        if (Date.now() - time >= time_per_frame) {
            resetAnimationModel(models[0]);
            if (isAnimationLoopable) {
                time_per_frame = 1000 / fps.value;
                total_frame = models[0].total_frame;
                if (!isAnimationReversed) {
                    current_frame = 0;
                } else {
                    current_frame = total_frame - 1;
                }
                requestAnimationFrame(animate);
            }
        } else {
            requestAnimationFrame(animate);
        }
    }
};

const animationModel = (model, frameIdx) => {
    model.setTranslation(model.animation.translation[frameIdx].x, model.animation.translation[frameIdx].y, model.animation.translation[frameIdx].z);
    model.setRotation(model.animation.rotation[frameIdx].x, model.animation.rotation[frameIdx].y, model.animation.rotation[frameIdx].z);
    model.setScale(model.animation.scale[frameIdx].x, model.animation.scale[frameIdx].y, model.animation.scale[frameIdx].z);
    for(let i=0; i<model.children.length; i++){
        animationModel(model.children[i], frameIdx);
    }
}

const resetAnimationModel = (model) => {
    model.setTranslation(0, 0, 0);
    model.setRotation(0, 0, 0);
    model.setScale(1, 1, 1);
    for(let i=0; i<model.children.length; i++){
        resetAnimationModel(model.children[i]);
    }
}