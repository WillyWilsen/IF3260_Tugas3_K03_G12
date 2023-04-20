class Model {
    constructor(id, name, vertices, colors, faces, level, animation=undefined) {
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
        this.tangents = [];
        this.bitangents = [];
        
        if (!animation){
            this.setDefaultAnimation();
        }

        this.translation = { x: 0, y: 0, z: 0 }
        this.rotation = { x: 0, y: 0, z: 0 }
        this.scale = { x: 1, y: 1, z: 1 }

        this.model_matrix = identityMatrix()

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

    draw(renderer, gl, cumulativeModelMatrix){
        
        // fill texCoord
        if (this.texCoords.length == 0){
            this.generateTexCoords();
        }

        // fill Normal
        if (this.normals.length == 0){
            this.generateNormal();
        }

        // fill tangents and bitangents
        if (this.tangents.length == 0){
            this.generateTangent();
        }

        // calculate cumulative model matrix
        cumulativeModelMatrix = matrixMultiplication(cumulativeModelMatrix, this.model_matrix)

        // render with the cumulative model matrix
        renderer.draw(gl, this, cumulativeModelMatrix);

        // recursively render children
        for (let i=0; i<this.children.length; i++){
            this.children[i].draw(renderer, gl, cumulativeModelMatrix);
        }
    }

    setTranslation(x, y, z) {
        this.translation = { x, y, z }
        this.recalculateModelMatrix()
    }

    setRotation(x, y, z) {
        this.rotation = { x, y, z }
        this.recalculateModelMatrix()
    }

    setScale(x, y, z) {
        this.scale = { x, y, z }
        this.recalculateModelMatrix()
    }

    recalculateModelMatrix() {
        const translation = this.translation;
        const scale = this.scale;

        const rotation = this.rotation;
        const rotationRad = {
            x: rotation.x * Math.PI / 180,
            y: rotation.y * Math.PI / 180,
            z: rotation.z * Math.PI / 180
        }

        const translation_matrix = [
            1, 0, 0, translation.x,
            0, 1, 0, translation.y,
            0, 0, 1, translation.z,
            0, 0, 0, 1
        ];

        const scaling_matrix = [
            scale.x, 0, 0, 0,
            0, scale.y, 0, 0,
            0, 0, scale.z, 0,
            0, 0, 0, 1
        ];

        const rotation_z_matrix = [
            Math.cos(rotationRad.z), -Math.sin(rotationRad.z), 0, 0,
            Math.sin(rotationRad.z), Math.cos(rotationRad.z), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        const rotation_y_matrix = [
            Math.cos(rotationRad.y), 0, Math.sin(rotationRad.y), 0,
            0, 1, 0, 0,
            -Math.sin(rotationRad.y), 0, Math.cos(rotationRad.y), 0,
            0, 0, 0, 1
        ];

        const rotation_x_matrix = [
            1, 0, 0, 0,
            0, Math.cos(rotationRad.x), -Math.sin(rotationRad.x), 0,
            0, Math.sin(rotationRad.x), Math.cos(rotationRad.x), 0,
            0, 0, 0, 1
        ]

        const rotation_matrix = matrixMultiplication(rotation_z_matrix, matrixMultiplication(rotation_y_matrix, rotation_x_matrix));

        this.model_matrix = matrixMultiplication(translation_matrix, matrixMultiplication(rotation_matrix, scaling_matrix));
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

    generateTangent() {
        for (let i = 0; i < this.expandedVertices.length/9; i += 1) {
            const v0 = [this.expandedVertices[i*9], this.expandedVertices[i*9 + 1], this.expandedVertices[i*9 + 2]];
            const v1 = [this.expandedVertices[i*9 + 3], this.expandedVertices[i*9 + 4], this.expandedVertices[i*9 + 5]];
            const v2 = [this.expandedVertices[i*9 + 6], this.expandedVertices[i*9 + 7], this.expandedVertices[i*9 + 8]];
    
            const uv0 = [this.texCoords[i*6], this.texCoords[i*6 + 1]];
            const uv1 = [this.texCoords[i*6 + 2], this.texCoords[i*6 + 3]];
            const uv2 = [this.texCoords[i*6 + 4], this.texCoords[i*6 + 5]];
    
            const deltaPos1 = subtractVector3(v1, v0);
            const deltaPos2 = subtractVector3(v2, v0);
    
            const deltaUV1 = subtractVector2(uv1, uv0);
            const deltaUV2 = subtractVector2(uv2, uv0);
    
            const f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
    
            const tangent = scaleVector3(subtractVector3(scaleVector3(deltaPos1, deltaUV2[1]), scaleVector3(deltaPos2, deltaUV1[1])), f);
            const bitangent = scaleVector3(subtractVector3(scaleVector3(deltaPos2, deltaUV1[0]), scaleVector3(deltaPos1, deltaUV2[0])), f);

            for (var j = 0; j < 3; j++) {
                this.tangents.push(tangent[0], tangent[1], tangent[2]);
                this.bitangents.push(bitangent[0], bitangent[1], bitangent[2]);
            }
        }
    }

    setDefaultAnimation(){
        this.animation = {
            "translation": [
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0}
            ],
            "rotation": [
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0},
                {"x": 0, "y": 0, "z": 0}
            ],
            "scale": [
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1},
                {"x": 1, "y": 1, "z": 1}
            ]
        }
    }

    
}
