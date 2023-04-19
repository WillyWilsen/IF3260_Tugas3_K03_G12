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

        void main(void) { 
            gl_Position = vec4(position, 1)*Mmatrix*Vmatrix*Pmatrix;
            vColor = color;
            vTexCoord = texCoord;

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

        varying vec2 vTexCoord;
        uniform sampler2D uSampler;

        uniform int mappingType;

        void main() {
            if (mappingType == 0){ // no mapping
                gl_FragColor = vec4(vColor.rgb * vLighting, 1.0);
            } else if (mappingType == 1){ // texture mapping
                gl_FragColor = texture2D(uSampler, vTexCoord);
            }
        }
        `

        this.program = undefined
        this.vertexShader = undefined
        this.fragmentShader = undefined

        this.proj_matrix = getOrthogonalProjection(-4, 4, -4, 4, 0.1, 15);
        this.model_matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        this.view_matrix = undefined;

        this.camera_properties = {
            "distance": 5,
            "x_radian": 0,
            "y_radian": 0,
            "z_radian": 0,
        }

        this.init(gl);

        this.image = new Image();
        this.image.src = "../asset/texture.jpg";
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
    }

    draw(gl, model) {

        this.setViewMatrix();

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

        // const normal_buffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal), gl.STATIC_DRAW);
        
        // const normalLocation = gl.getAttribLocation(this.program, 'normal');
        // gl.enableVertexAttribArray(normalLocation);
        // gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        if (this.isPowerOf2(this.image.width) && this.isPowerOf2(this.image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texCoords), gl.STATIC_DRAW);

        const textureCoord = gl.getAttribLocation(this.program, "texCoord");
        gl.enableVertexAttribArray(textureCoord);
        gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(this.program)

        gl.uniformMatrix4fv(this._Pmatrix, false, this.proj_matrix);
        gl.uniformMatrix4fv(this._Vmatrix, false, this.view_matrix);
        gl.uniformMatrix4fv(this._Mmatrix, false, this.model_matrix);
        // gl.uniformMatrix4fv(this._TransformNormalMatrix, false, this.transform_normal_matrix);

        // gl.uniform1i(this._ShadingOn, this.shadingOn);
        gl.uniform1i(this._Mapping, 1); // change mapping type

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this._Sampler, 0);

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

    prepareImage(){
        const texture = gl.createTexture();
        
        this.image.onload = () => {
            
        };
        
        
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

}