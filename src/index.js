const load_btn = document.getElementById('load-btn');
const camera_zoom = document.getElementById('camera_zoom');
const camera_angle_x = document.getElementById('camera_angle_x');
const camera_angle_y = document.getElementById('camera_angle_y');
const camera_angle_z = document.getElementById('camera_angle_z');
const tree = document.getElementById('tree');

function app() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (rootModel){
        rootModel.draw(renderer, gl);
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
        loadModel(e.target.result);
    }
    reader.readAsText(file)
}
 
function loadModel(object_string){
    const rawObject = JSON.parse(object_string);
    const newModel = new Model([], [], []);
    Object.assign(newModel, rawObject);
    rootModel = newModel;
    renderer.init(gl);
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