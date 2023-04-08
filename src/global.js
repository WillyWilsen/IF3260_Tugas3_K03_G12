const canvas = document.getElementById("canvas")
const gl = canvas.getContext("webgl")

let objects = []
let default_objects_string = []
let selectedIdx = 0
let projectionMode = 'perspective'
let renderer = new Renderer();