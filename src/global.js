const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

let models = [];
let selectedIdx = undefined;
let childIdx = [];
let projectionMode = 'perspective';
let renderer = new Renderer();
let time = undefined;
let time_per_frame = undefined;
let current_frame = 0;
let total_frame = undefined;
let isAnimationPaused = undefined;
let isAnimationReversed = false;
let isAnimationLoopable = false;

const state = {
    models: models,
    topLevelModels: [],
    selectedIdx: undefined,
    /**@type {Model} */ selectedModel: undefined
}