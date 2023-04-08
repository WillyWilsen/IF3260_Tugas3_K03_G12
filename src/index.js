const load_btn = document.getElementById('load-btn');
const camera_zoom = document.getElementById('camera_zoom');
const camera_angle_x = document.getElementById('camera_angle_x');
const camera_angle_y = document.getElementById('camera_angle_y');
const camera_angle_z = document.getElementById('camera_angle_z');

function app() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for(let i = 0; i < objects.length; ++i) {
       renderer.draw(gl, objects[i]);
    }
    setTimeout(app, 16)
 }
 setTimeout(app, 16)

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
        loadObjects(e.target.result, true, false);
    }
    reader.readAsText(file)
}
 
function loadObjects(object_string){
    const rawObject = JSON.parse(object_string);
    if (Array.isArray(rawObject)) {
        for (let i = 0; i < rawObject.length; i++) {
            loadSingleObject(rawObject[i]);
        }
    } else {
        loadSingleObject(rawObject);
    }
}
 
function loadSingleObject(rawObject) {
    const model = new Model([], [], []);
    
    Object.assign(model, rawObject);
    renderer.init(gl);
 
    objects.push(model);
}

function cameraZoomHandler(distance){
    renderer.moveCameraTo(distance);
}
camera_zoom.addEventListener("input", (e) => {
    cameraZoomHandler(e.target.value);
})

function cameraRotationHandler(degree, axis){
    renderer.rotateCamera(degree, axis);
}
camera_angle_x.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "x");
})
camera_angle_y.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "y");
})
camera_angle_z.addEventListener("input", (e) => {
    cameraRotationHandler(e.target.value, "z");
})