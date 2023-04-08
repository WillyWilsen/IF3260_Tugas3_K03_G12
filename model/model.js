class Model {
    constructor(vertices, colors, faces) {

        this.vertices = vertices;
        this.colors = colors;
        this.faces = faces;

        this.self_translation_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.self_rotation_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.self_scaling_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.from_parent_translation_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.from_parent_rotation_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.from_parent_scaling_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.childen = [];
    }

    setVertices(vertices) {
        this.vertices = vertices;
    }

    setColors(colors){
        this.colors = colors;
    }

    addChild(model){
        this.children.push(model);
    }

    getPoint(index) {
        const getIndex = index * 3

        return {
            x: this.vertices[getIndex],
            y: this.vertices[getIndex + 1],
            z: this.vertices[getIndex + 2]
        }

    }

    draw(renderer, gl){
        renderer.draw(gl, this);
        for (let i=0; i<this.childen.length; i++){
            renderer.draw(gl, this.children[i]);
        }
    }

    
}
