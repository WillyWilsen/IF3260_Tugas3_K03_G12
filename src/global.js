const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

let models = [];
let selectedIdx = undefined;
let childIdx = [];
let projectionMode = 'perspective';
let renderer = new Renderer();
let time = undefined;
let time_per_frame = undefined;
let current_frame = undefined;
let total_frame = undefined;

const state = {
    models: models,
    topLevelModels: [],
    selectedIdx: undefined,
    /**@type {Model} */ selectedModel: undefined
}