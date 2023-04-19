class Renderer{
    constructor() {

        this.vertexShaderCode = 
        `attribute vec3 position;
        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;
        attribute vec3 color;
        varying vec3 vColor;
        attribute vec2 texCoord;

        attribute vec3 normal;
        uniform mat4 TransformNormalMatrix;
        varying vec3 vLighting;

        uniform bool shadingOn;

        varying vec2 vTexCoord;

        varying vec3 v_worldPosition;
        varying vec3 v_worldNormal;

        void main(void) { 
            gl_Position = vec4(position, 1)*Mmatrix*Vmatrix*Pmatrix;
            vColor = color;

            // for texture mapping
            vTexCoord = texCoord;

            // for environment mapping
            v_worldPosition = (Mmatrix * vec4(position, 1)).xyz;
            v_worldNormal = mat3(Mmatrix) * normal;

            if (shadingOn){
                vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                vec3 directionalLightColor = vec3(0.35, 0.35, 0.35);
                vec3 directionalVector = normalize(vec3(1, 1, 1));
    
                vec4 transformedNormal = TransformNormalMatrix * vec4(normal, 1.0);

                float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
                vLighting = ambientLight + (directionalLightColor * directional);
            } else {
                vLighting = vec3(1,1,1);
            }
        }
        `

        this.fragmentShaderCode = `
        precision mediump float;
        varying vec3 vColor;

        varying vec3 vLighting;

        // for texture mapping
        varying vec2 vTexCoord;
        uniform sampler2D uSampler;

        // for environment mapping
        varying vec3 v_worldPosition;
        varying vec3 v_worldNormal;
        uniform samplerCube uSamplerCube;
        uniform vec3 uWorldCameraPosition;

        uniform int mappingType;

        void main() {
            if (mappingType == 0){ // no mapping
                gl_FragColor = vec4(vColor.rgb * vLighting, 1.0);
            } else if (mappingType == 1){ // texture mapping
                vec4 texelColor = texture2D(uSampler, vTexCoord);
                gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            } else if (mappingType == 2){ // environment mapping
                vec3 worldNormal = normalize(v_worldNormal);
                vec3 eyeToSurfaceDir = normalize(v_worldPosition - uWorldCameraPosition);
                vec3 direction = reflect(eyeToSurfaceDir,worldNormal);

                vec4 texelColor = textureCube(uSamplerCube, direction);
                gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            }
        }
        `

        this.program = undefined
        this.vertexShader = undefined
        this.fragmentShader = undefined

        this.setProjection('perspective')
        
        this.view_matrix = undefined;

        this.transform_normal_matrix = undefined

        this.camera_properties = {
            "distance": 5,
            "x_radian": 0,
            "y_radian": 0,
            "z_radian": 0,
        }

        this.cameraPosition = [0,0,0]

        this.init(gl)

        this.mappingType = 0
    }

    init(gl) {
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(this.vertexShader, this.vertexShaderCode)
        gl.compileShader(this.vertexShader)
        if(!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.vertexShader))
        }

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(this.fragmentShader, this.fragmentShaderCode)
        gl.compileShader(this.fragmentShader)
        if(!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.fragmentShader))
        }

        this.program = gl.createProgram()

        gl.attachShader(this.program, this.vertexShader)
        gl.attachShader(this.program, this.fragmentShader)
        gl.linkProgram(this.program)

        this._Pmatrix = gl.getUniformLocation(this.program, "Pmatrix");
        this._Vmatrix = gl.getUniformLocation(this.program, "Vmatrix");
        this._Mmatrix = gl.getUniformLocation(this.program, "Mmatrix");
        this._TransformNormalMatrix = gl.getUniformLocation(this.program, "TransformNormalMatrix");
        this._ShadingOn = gl.getUniformLocation(this.program, "shadingOn");
        this._Sampler = gl.getUniformLocation(this.program, "uSampler");
        this._Mapping = gl.getUniformLocation(this.program, "mappingType");
        this._SamplerCube = gl.getUniformLocation(this.program, "uSamplerCube");
        this._WorldCameraPositionLocation = gl.getUniformLocation(this.program, "uWorldCameraPosition");
    }

    draw(gl, model, cumulativeModelMatrix) {

        this.setViewMatrix();
        this.setTransformNormalMatrix(cumulativeModelMatrix);
        this.setCameraPosition();

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.expandedVertices), gl.STATIC_DRAW);

        const vertexPosition = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(vertexPosition);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

        const fragmentBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, fragmentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.expandedColors), gl.STATIC_DRAW);

        const colorPosition = gl.getAttribLocation(this.program, 'color');
        gl.enableVertexAttribArray(colorPosition);
        gl.vertexAttribPointer(colorPosition, 3, gl.FLOAT, false, 0, 0);

        const normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        
        const normalLocation = gl.getAttribLocation(this.program, 'normal');
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texCoords), gl.STATIC_DRAW);

        const textureCoord = gl.getAttribLocation(this.program, "texCoord");
        gl.enableVertexAttribArray(textureCoord);
        gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(this.program)

        gl.uniformMatrix4fv(this._Pmatrix, false, this.proj_matrix);
        gl.uniformMatrix4fv(this._Vmatrix, false, this.view_matrix);
        gl.uniformMatrix4fv(this._Mmatrix, false, cumulativeModelMatrix);
        gl.uniformMatrix4fv(this._TransformNormalMatrix, false, this.transform_normal_matrix);

        gl.uniform3fv(this._WorldCameraPositionLocation, this.cameraPosition);

        gl.uniform1i(this._ShadingOn, false); // TODO: toggle for shading
        gl.uniform1i(this._Mapping, this.mappingType); // TODO: change mapping type

        gl.activeTexture(gl.TEXTURE0);

        if (this.mappingType == 0 || this.mappingType == 1){
            gl.uniform1i(this._Sampler, 0);
            gl.uniform1i(this._SamplerCube, 1);
        } else if (this.mappingType == 2){
            gl.uniform1i(this._Sampler, 1);
            gl.uniform1i(this._SamplerCube, 0);
        }


        gl.drawArrays(gl.TRIANGLES, 0, model.expandedVertices.length);
    }

    moveCameraTo(distance){
        this.camera_properties.distance = parseFloat(distance);
    }

    rotateCamera(degree, axis){
        const radian = degree * Math.PI / 180;
        if (axis === "x"){
            this.camera_properties.x_radian = radian;
        }
        if (axis === "y"){
            this.camera_properties.y_radian = radian;
        }
        if (axis === "z"){
            this.camera_properties.z_radian = radian;
        }
    }

    setViewMatrix(){

        const translation = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, -1*this.camera_properties.distance,
            0, 0, 0, 1,
        ];

        const rotation_x = [
            1, 0, 0, 0,
            0, Math.cos(this.camera_properties.x_radian), -1*Math.sin(this.camera_properties.x_radian), 0,
            0, Math.sin(this.camera_properties.x_radian), Math.cos(this.camera_properties.x_radian), 0,
            0, 0, 0, 1,
        ];

        const rotation_y = [
            Math.cos(this.camera_properties.y_radian), 0, Math.sin(this.camera_properties.y_radian), 0,
            0, 1, 0, 0,
            -1*Math.sin(this.camera_properties.y_radian), 0, Math.cos(this.camera_properties.y_radian), 0,
            0, 0, 0, 1,
        ];

        const rotation_z = [
            Math.cos(this.camera_properties.z_radian), -1*Math.sin(this.camera_properties.z_radian), 0, 0,
            Math.sin(this.camera_properties.z_radian), Math.cos(this.camera_properties.z_radian), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];

        this.view_matrix = matrixMultiplication(translation, rotation_x);
        this.view_matrix = matrixMultiplication(this.view_matrix, rotation_y);
        this.view_matrix = matrixMultiplication(this.view_matrix, rotation_z);

    }

    setTransformNormalMatrix(cumulativeModelMatrix){
        const modelViewMatrix = matrixMultiplication(cumulativeModelMatrix, this.view_matrix);
        this.transform_normal_matrix = transposeMatrix(invertMatrix4(modelViewMatrix));
    }

    setCameraPosition(){
        const x = this.camera_properties.distance * Math.sin(this.camera_properties.y_radian) * Math.cos(this.camera_properties.x_radian);
        const y = this.camera_properties.distance * Math.sin(this.camera_properties.y_radian) * Math.sin(this.camera_properties.x_radian);
        const z = this.camera_properties.distance * Math.cos(this.camera_properties.y_radian);
        this.cameraPosition = [x, y, z];
        // console.log(this.cameraPosition);
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    prepareTexture(){
        const _texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, _texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255])); // fallback
        const image = new Image();
        image.crossOrigin = "";
        image.src = "https://images.pexels.com/photos/6976103/pexels-photo-6976103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, _texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
    }

    prepareEnvironment(){
        const _envTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, _envTexture);

        const faceInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-x.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-x.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-y.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-y.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-z.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
                url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-z.jpg',
            },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;
            gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
            const image = new Image();
            image.crossOrigin = "";
            image.src = url;
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, _envTexture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        
    }

    setMappingType(type){
        this.mappingType = type;
    }

    setProjection(type) {
        if (type == 'orthographic') {
            this.proj_matrix = getOrthogonalProjection(-4, 4, -4, 4, 0.1, 15);
            console.log('Orthographic!');
        } else if (type == 'oblique') {
            this.proj_matrix = getObliqueProjection(45, 45, -6, 2, -6, 2, -2, 10);
            console.log('Oblique!');
        } else {
            this.proj_matrix = getPerspectiveProjection(45, canvas.width/canvas.height, 0.1, 15);
            console.log('Perspective!');
        }
    }
}
