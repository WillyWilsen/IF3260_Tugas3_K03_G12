const model_selected = document.getElementById('model_selected')
const model_list = document.getElementById('model_list')
const ortographic_btn = document.getElementById('orthographic-btn')
const perspective_btn = document.getElementById('perspective-btn')
const oblique_btn = document.getElementById('oblique-btn')
const model_angle_x = document.getElementById('model_angle_x')
const model_angle_y = document.getElementById('model_angle_y')
const model_angle_z = document.getElementById('model_angle_z')
const model_input_angle_x = document.getElementById('model_input_angle_x')
const model_input_angle_y = document.getElementById('model_input_angle_y')
const model_input_angle_z = document.getElementById('model_input_angle_z')
const model_translation_x = document.getElementById('model_translation_x')
const model_translation_y = document.getElementById('model_translation_y')
const model_translation_z = document.getElementById('model_translation_z')
const model_input_translation_x = document.getElementById('model_input_translation_x')
const model_input_translation_y = document.getElementById('model_input_translation_y')
const model_input_translation_z = document.getElementById('model_input_translation_z')
const model_scale_x = document.getElementById('model_scale_x')
const model_scale_y = document.getElementById('model_scale_y')
const model_scale_z = document.getElementById('model_scale_z')
const model_input_scale_x = document.getElementById('model_input_scale_x')
const model_input_scale_y = document.getElementById('model_input_scale_y')
const model_input_scale_z = document.getElementById('model_input_scale_z')
const save_btn = document.getElementById('save-btn')
const load_btn = document.getElementById('load-btn')
const camera_zoom = document.getElementById('camera_zoom')
const camera_angle_x = document.getElementById('camera_angle_x')
const camera_angle_y = document.getElementById('camera_angle_y')
const camera_angle_z = document.getElementById('camera_angle_z')
const reset = document.getElementById('reset')
const shadingCheckbox = document.getElementById('shadingCheckbox')

function app() {
   gl.enable(gl.DEPTH_TEST);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   for(let i = 0; i < objects.length; ++i) {
      objects[i].draw(gl)
   }
   setTimeout(app, 16)
}
setTimeout(app, 16)

/**
 * Handle on projection change
 * @param {Event} e 
 * @param {string} type 
 */
function projectionEventListener(e, type) {
   projectionMode = type;
   ortographic_btn.style = 'font-weight: normal;';
   perspective_btn.style = 'font-weight: normal;';
   oblique_btn.style = 'font-weight: normal;';

   if (type == 'orthographic') {
      objects.forEach(model => {
         model.proj_matrix = getOrthogonalProjection(-4, 4, -4, 4, 0.1, 15);
      });
      ortographic_btn.style = 'font-weight: bold;';
   } else if (type == 'perspective') {
      objects.forEach(model => {
         model.proj_matrix = getPerspectiveProjection(45, canvas.width/canvas.height, 0.1, 15);
      });
      perspective_btn.style = 'font-weight: bold;';
   } else if (type == 'oblique') {
      objects.forEach(model => {
         model.proj_matrix = getObliqueProjection(45, 45, -6, 2, -6, 2, -2, 10);
      });
      oblique_btn.style = 'font-weight: bold;';
   }
}

ortographic_btn.addEventListener('click', (e) => projectionEventListener(e, 'orthographic'));
perspective_btn.addEventListener('click', (e) => projectionEventListener(e, 'perspective'));
oblique_btn.addEventListener('click', (e) => projectionEventListener(e, 'oblique'));
perspective_btn.click();

/**
 * Handle rotating model with object as center of rotation
 * @param {String} degree 
 * @param {String} axis 
 */
function modelRotationHandler(degree, axis){
   objects[selectedIdx].rotateModel(parseFloat(degree), axis);
}
model_angle_x.addEventListener("input", (e) => {
   modelRotationHandler(e.target.value, "x");
})
model_angle_y.addEventListener("input", (e) => {
   modelRotationHandler(e.target.value, "y");
})
model_angle_z.addEventListener("input", (e) => {
   modelRotationHandler(e.target.value, "z");
})
model_input_angle_x.addEventListener("change", (e) => {
    modelRotationHandler(e.target.value, "x");
 })
 model_input_angle_y.addEventListener("change", (e) => {
    modelRotationHandler(e.target.value, "y");
 })
 model_input_angle_z.addEventListener("change", (e) => {
    modelRotationHandler(e.target.value, "z");
 })

/**
 * Handle moving model
 * @param {String} distance 
 * @param {String} axis 
 */
function modelMoveHandler(distance, axis){
   objects[selectedIdx].moveModel(distance, axis);
}
model_translation_x.addEventListener("input", (e) => {
   modelMoveHandler(e.target.value, "x");
})
model_translation_y.addEventListener("input", (e) => {
   modelMoveHandler(e.target.value, "y");
})
model_translation_z.addEventListener("input", (e) => {
   modelMoveHandler(e.target.value, "z");
})
model_input_translation_x.addEventListener("change", (e) => {
    modelMoveHandler(parseFloat(e.target.value), "x");
 })
 model_input_translation_y.addEventListener("change", (e) => {
    modelMoveHandler(parseFloat(e.target.value), "y");
 })
 model_input_translation_z.addEventListener("change", (e) => {
    modelMoveHandler(parseFloat(e.target.value), "z");
 })

/**
 * Handle scaling model
 * @param {String} k 
 * @param {String} axis 
 */
function modelScaleModel(k, axis){
   objects[selectedIdx].scaleModel(k, axis);
}
model_scale_x.addEventListener("input", (e) => {
   modelScaleModel(e.target.value, "x");
})
model_scale_y.addEventListener("input", (e) => {
   modelScaleModel(e.target.value, "y");
})
model_scale_z.addEventListener("input", (e) => {
   modelScaleModel(e.target.value, "z");
})
model_input_scale_x.addEventListener("change", (e) => {
    modelScaleModel(parseFloat(e.target.value), "x");
 })
 model_input_scale_y.addEventListener("change", (e) => {
    modelScaleModel(parseFloat(e.target.value), "y");
 })
 model_input_scale_z.addEventListener("change", (e) => {
    modelScaleModel(parseFloat(e.target.value), "z");
 })


/**
* Handle on change selected model
* @param {Event} e
*/
function changeSelected(idx) {
   selectedIdx = idx
   model_selected.innerHTML = `Model Selected: <b>Model ${selectedIdx + 1}</b>`
   model_angle_x.value = objects[selectedIdx].model_angle_x
   model_angle_y.value = objects[selectedIdx].model_angle_y
   model_angle_z.value = objects[selectedIdx].model_angle_z
   model_input_angle_x.value = objects[selectedIdx].model_angle_x
   model_input_angle_y.value = objects[selectedIdx].model_angle_y
   model_input_angle_z.value = objects[selectedIdx].model_angle_z
   model_translation_x.value = objects[selectedIdx].model_translation_x
   model_translation_y.value = objects[selectedIdx].model_translation_y
   model_translation_z.value = objects[selectedIdx].model_translation_z
   model_input_translation_x.value = objects[selectedIdx].model_translation_x
   model_input_translation_y.value = objects[selectedIdx].model_translation_y
   model_input_translation_z.value = objects[selectedIdx].model_translation_z
   model_scale_x.value = objects[selectedIdx].model_scale_x
   model_scale_y.value = objects[selectedIdx].model_scale_y
   model_scale_z.value = objects[selectedIdx].model_scale_z
   model_input_scale_x.value = objects[selectedIdx].model_scale_x
   model_input_scale_y.value = objects[selectedIdx].model_scale_y
   model_input_scale_z.value = objects[selectedIdx].model_scale_z
   camera_zoom.value = objects[selectedIdx].camera_zoom
   camera_angle_x.value = objects[selectedIdx].camera_angle_x
   camera_angle_y.value = objects[selectedIdx].camera_angle_y
   camera_angle_z.value = objects[selectedIdx].camera_angle_z
}

/**
 * Handle on reset selected model
 */
function resetSelected(isResetting) {
   model_angle_x.value = 0
   model_angle_y.value = 0
   model_angle_z.value = 0
   model_input_angle_x.value = 0
   model_input_angle_y.value = 0
   model_input_angle_z.value = 0
   model_translation_x.value = 0
   model_translation_y.value = 0
   model_translation_z.value = 0
   model_input_translation_x.value = 0
   model_input_translation_y.value = 0
   model_input_translation_z.value = 0
   model_scale_x.value = 1
   model_scale_y.value = 1
   model_scale_z.value = 1
   model_input_scale_x.value = 1
   model_input_scale_y.value = 1
   model_input_scale_z.value = 1
   if (isResetting){
       camera_zoom.value = 5
       camera_angle_x.value = 0
       camera_angle_y.value = 0
       camera_angle_z.value = 0
   }
}

//////   Save & Load    //////
/**
 * Handle load file event listener
 */
load_btn.addEventListener("click", e => {
   load()
})

save_btn.addEventListener("click", e => {
   save()
})

/**
 * Save model(s)
 */
function save() {
   /** @type {Model[]} */
   const objectsToSave = objects.map(object => {
      return {
         vertices: object.getTransformedVertices(),
         colors: object.colors,
         faces: object.faces
      }  
   });

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
}

/**
 * Load
 */
function load() {
   // Create upload element
   const uploadElement = document.createElement('input');
   uploadElement.type = "file";
   uploadElement.accept = "application/json";
   uploadElement.style.display = 'none';
   document.body.appendChild(uploadElement);

   // Set onchange listener, then click the element
   uploadElement.onchange = fileUploaded;
   uploadElement.click();

   // Remove from body
   document.body.removeChild(uploadElement);
}

/**
* Handle when a file has been uploaded
* @param {Event} e 
*/
function fileUploaded(e) {
   // Check whether files empty
   /** @type {FileList} */
   const files = e.target.files
   if (files.length == 0) {
       return;
   }

   // Create file reader
   const file = files[0];
   const reader = new FileReader();

   // Setting file reader on load
   reader.onload = (e) => {
        loadObjects(e.target.result, true, false);
   }
   
   // Begin reading
   reader.readAsText(file)
}

/**
 * Load object_string to objects
 * @param {String} object_string 
 * @param {Boolean} isLoading 
 */
function loadObjects(object_string, isLoading, isResetting){
   const rawObject = JSON.parse(object_string);

   if (Array.isArray(rawObject)) {
      for (let i = 0; i < rawObject.length; i++) {
         loadSingleObject(rawObject[i]);
      }
   } else {
      loadSingleObject(rawObject);
   }

   if (isLoading){
      default_objects_string.push(object_string);
   }

   model_selected.innerHTML = `Model Selected: <b>Model ${objects.length}</b>`
   
   selectedIdx = objects.length - 1;
   resetSelected(isResetting);
   projectionEventListener(null, projectionMode);
}

function loadSingleObject(rawObject) {
   const model = new Model([], [], []);
   
   Object.assign(model, rawObject);
   model.init(gl);
   console.log(model);

   centerModel(model);

   if (shadingCheckbox.checked){
    model.setShadingOn(true);
   } else {
    model.setShadingOn(false);
   }

   model.moveCameraTo(camera_zoom.value);
   model.rotateCamera(parseFloat(camera_angle_x.value), "x");
   model.rotateCamera(parseFloat(camera_angle_y.value), "y");
   model.rotateCamera(parseFloat(camera_angle_z.value), "z");

   objects.push(model);
   model_list.innerHTML += `
   <button onclick="changeSelected(${objects.length - 1})">
      Model ${objects.length}
   </button>
   `
}

/**
 * Center model's vertices so that they are centered to origin, then translate so it looks like original model. Why? To make sure rotation is centered to object
 */
function centerModel(model) {
   let vertAvg = [0, 0, 0];
   let vertCount = model.vertices.length/3;

   for (let i = 0; i < model.vertices.length; i += 3) {
      vertAvg[0] += model.vertices[i];
      vertAvg[1] += model.vertices[i + 1];
      vertAvg[2] += model.vertices[i + 2];
   }

   vertAvg[0] /= vertCount;
   vertAvg[1] /= vertCount;
   vertAvg[2] /= vertCount;

   for (let i = 0; i < model.vertices.length; i += 3) {
      model.vertices[i] -= vertAvg[0];
      model.vertices[i + 1] -= vertAvg[1];
      model.vertices[i + 2] -= vertAvg[2];
   }

   model.moveModel(vertAvg[0], 'x');
   model.moveModel(vertAvg[1], 'y');
   model.moveModel(vertAvg[2], 'z');
}

/**
 * Handle from moving camera to z = distance
 * @param {String} distance 
 */
function cameraZoomHandler(distance){
   objects.forEach(object => {
      object.moveCameraTo(distance);
   })
}
camera_zoom.addEventListener("input", (e) => {
    cameraZoomHandler(e.target.value);
})

/**
 * Handle rotating camera with object as center of rotation
 * @param {String} degree 
 * @param {String} axis 
 */
function cameraRotationHandler(degree, axis){
   objects.forEach(object => {
      object.rotateCamera(parseFloat(degree), axis);
   })
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

/**
 * Handle reset
 */
reset.addEventListener("click", (e) => {
    objects = [];
    model_list.innerHTML = ``;
    default_objects_string.forEach(default_object_string => {
        loadObjects(default_object_string, false, true);
    });
    shadingCheckbox.checked = false;
    objects.forEach(object => {
        object.resetMMatrix();
        object.resetVMatrix();
    });
    projectionEventListener(null, 'perspective');

})

shadingCheckbox.addEventListener('change', function() {
    if(this.checked) {
        objects.forEach(object => {
            object.setShadingOn(true);
        });
    } else {
        objects.forEach(object => {
            object.setShadingOn(false);
        });
    }
  });
