class Model {
    constructor(id, name, vertices, colors, faces, level) {
        this.id = id;
        this.name = name;
        this.vertices = vertices;
        this.colors = colors;
        this.faces = faces;
        this.level = level;

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

        this.children = [];
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
        for (let i=0; i<this.children.length; i++){
            this.children[i].draw(renderer, gl);
        }
        renderer.draw(gl, this);
    }

    setButton(button){
        this.button = button;
    }

    
}
