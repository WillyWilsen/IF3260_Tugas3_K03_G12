/**
 * Didapat dari Chapter 5: Viewing buku Interactive Computer Graphics
 */
function getPerspectiveProjection(fovy, aspect, near, far) {
    const top = near * Math.tan(fovy * Math.PI / 180);
    const right = top * aspect;

    return [
       near / right, 0 , 0, 0,
       0, near / top, 0, 0,
       0, 0, -(far+near) / (far-near), -2*far*near / (far-near),
       0, 0, -1, 0 
    ];
}

/**
 * Didapat dari Chapter 5: Viewing buku Interactive Computer Graphics
 */
function getOrthogonalProjection(left, right, bottom, top, near, far) {
    return [
        2 / (right-left), 0, 0, - (left+right) / (right-left),
        0, 2 / (top - bottom), 0, - (top+bottom) / (top-bottom),
        0, 0, - 2 / (far-near), - (far+near) / (far-near),
        0, 0, 0, 1
    ]
}

/**
 * Didapat dari Chapter 5: Viewing buku Interactive Computer Graphics
 */
function getObliqueProjection(theta, psi, xmin, xmax, ymin, ymax, near, far) {
    const cotTheta = 1 / Math.tan(theta * Math.PI / 180);
    const cotPsi = 1 / Math.tan(psi * Math.PI / 180);

    const left = xmin - near*cotTheta;
    const right = xmax - near*cotTheta;
    const top = ymax - near*cotPsi;
    const bottom = ymin - near*cotPsi;

    let H = [
        1, 0, cotTheta, 0,
        0, 1, cotPsi, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    let orth = getOrthogonalProjection(left, right, bottom, top, near, far);

    return matrixMultiplication(H, orth);
}

function matrixMultiplication(A, B) {
    let result = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += A[i*4+k] * B[k*4+j];
            }
            result.push(sum);
        }
    }
    return result;
}

function invertMatrix4(A){
    let inverse = [];

    let a00 = A[0], a01 = A[1], a02 = A[2], a03 = A[3];
    let a10 = A[4], a11 = A[5], a12 = A[6], a13 = A[7];
    let a20 = A[8], a21 = A[9], a22 = A[10], a23 = A[11];
    let a30 = A[12], a31 = A[13], a32 = A[14], a33 = A[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }

    det = 1.0 / det;

    inverse.push((a11 * b11 - a12 * b10 + a13 * b09) * det);
    inverse.push((-a01 * b11 + a02 * b10 - a03 * b09) * det);
    inverse.push((a31 * b05 - a32 * b04 + a33 * b03) * det);
    inverse.push((-a21 * b05 + a22 * b04 - a23 * b03) * det);
    inverse.push((-a10 * b11 + a12 * b08 - a13 * b07) * det);
    inverse.push((a00 * b11 - a02 * b08 + a03 * b07) * det);
    inverse.push((-a30 * b05 + a32 * b02 - a33 * b01) * det);
    inverse.push((a20 * b05 - a22 * b02 + a23 * b01) * det);
    inverse.push((a10 * b10 - a11 * b08 + a13 * b06) * det);
    inverse.push((-a00 * b10 + a01 * b08 - a03 * b06) * det);
    inverse.push((a30 * b04 - a31 * b02 + a33 * b00) * det);
    inverse.push((-a20 * b04 + a21 * b02 - a23 * b00) * det);
    inverse.push((-a10 * b09 + a11 * b07 - a12 * b06) * det);
    inverse.push((a00 * b09 - a01 * b07 + a02 * b06) * det);
    inverse.push((-a30 * b03 + a31 * b01 - a32 * b00) * det);
    inverse.push((a20 * b03 - a21 * b01 + a22 * b00) * det);
    
    return inverse;
}

function transposeMatrix(A) {
    let result = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result.push(A[j*4 + i]);
        }
    }
    return result;
}