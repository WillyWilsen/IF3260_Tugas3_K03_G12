const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

let models = [];
let selectedIdx = undefined;
let childIdx = [];
let projectionMode = 'perspective';
let renderer = new Renderer();