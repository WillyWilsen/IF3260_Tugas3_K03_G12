class Model {
    constructor(id, name, vertices, colors, faces, level) {
        this.id = id;
        this.name = name;
        this.vertices = vertices;
        this.colors = colors;
        this.faces = faces;
        this.level = level;
        this.texCoords = [];
        this.normals = [];
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

        // fill Normal
        if (this.normals.length == 0){
            this.generateNormal();
        }

        for (let i=0; i<this.children.length; i++){
            this.children[i].draw(renderer, gl);
        }
        renderer.draw(gl, this);
    }

    setButton(button){
        this.button = button;
    }

    generateTexCoords(){ 
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

    generateNormal(){

        let p1, p2, p3;
        let v21, v31;
        let n, l;

        for(let i=0; i<this.faces.length; i+=3){
            
            p1 = {
                x: this.vertices[this.faces[i]*3],
                y: this.vertices[this.faces[i]*3+1],
                z: this.vertices[this.faces[i]*3+2],
            }
            p2 = {
                x: this.vertices[this.faces[i+1]*3],
                y: this.vertices[this.faces[i+1]*3+1],
                z: this.vertices[this.faces[i+1]*3+2],
            }
            p3 = {
                x: this.vertices[this.faces[i+2]*3],
                y: this.vertices[this.faces[i+2]*3+1],
                z: this.vertices[this.faces[i+2]*3+2],
            }

            v21 = {
                x: p2.x - p1.x,
                y: p2.y - p1.y,
                z: p2.z - p1.z,
            }
            v31 = {
                x: p3.x - p1.x,
                y: p3.y - p1.y,
                z: p3.z - p1.z,
            }

            n = {
                x: ((v21.y*v31.z) - (v21.z*v31.y)),
                y: ((v21.z*v31.x) - (v21.x*v31.z)),
                z: ((v21.x*v31.y) - (v21.y*v31.x)),
            }

            l = Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z);
            n.x /= l;
            n.y /= l;
            n.z /= l;

            this.normals.push(n.x, n.y, n.z);
            this.normals.push(n.x, n.y, n.z);
            this.normals.push(n.x, n.y, n.z);

        }
    }

    
}
