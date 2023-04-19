class Model {
    constructor(id, name, vertices, colors, faces, level) {
        this.id = id;
        this.name = name;
        this.vertices = vertices;
        this.colors = colors;
        this.faces = faces;
        this.level = level;
        this.texCoords = [];
        this.expandedVertices = [];
        this.expandedColors = [];

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
        
        // fill texCoord
        if (this.texCoords.length == 0){
            this.generateTexCoords();
        }

        for (let i=0; i<this.children.length; i++){
            this.children[i].draw(renderer, gl);
        }
        renderer.draw(gl, this);
    }

    setButton(button){
        this.button = button;
    }

    generateTexCoords(){ // i*6 + j
        const texCoordsMatrix = [[0,0], [1,1], [1,0], [0,1]]
        const facesLen = this.faces.length;
        const verticesLen = this.faces.length;
        const n = facesLen / 6;
        for (let i=0; i<n; i++){
            let verticesIdxToTexCoord = {};
            let k = 0;
            for (let j=0; j<6; j++){
                const verticesIdx = this.faces[i*6+j];
                if (!verticesIdxToTexCoord[verticesIdx]){
                    verticesIdxToTexCoord[verticesIdx] = [texCoordsMatrix[k][0], texCoordsMatrix[k][1]];
                    k++;
                }
            }
            for (let j=0; j<6; j++){
                const x = this.vertices[this.faces[i*6+j]*3];
                const y = this.vertices[this.faces[i*6+j]*3 + 1];
                const z = this.vertices[this.faces[i*6+j]*3 + 2];
                const r = this.colors[this.faces[i*6+j]*3];
                const g = this.colors[this.faces[i*6+j]*3 + 1];
                const b = this.colors[this.faces[i*6+j]*3 + 2];
                const u = verticesIdxToTexCoord[this.faces[i*6+j]][0];
                const v = verticesIdxToTexCoord[this.faces[i*6+j]][1];
                this.expandedVertices.push(x,y,z);
                this.expandedColors.push(r,g,b);
                this.texCoords.push(u,v);
            }
        }
    }

    
}
