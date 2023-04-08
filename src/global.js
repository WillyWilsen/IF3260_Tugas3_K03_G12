const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

let rootModel = undefined;
let selectedModel = undefined;
let projectionMode = 'perspective';
let renderer = new Renderer();