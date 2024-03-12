import bcryps from  'bcrypt';


//registro
export const createHash = (passw) => {
    return bcryps.hashSync(passw, bcryps.genSaltSync(10))
}

//login
export const isValidatePassword = (user, password) => {
    return bcryps.compare(password, user.password);
}


// import bcrypt from 'bcrypt';

// // Registro: Crear hash de forma asincrónica
// export const createHash = (password) => {
//     return new Promise((resolve, reject) => {
//         bcrypt.hash(password, 10, (err, hash) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(hash);
//             }
//         });
//     });
// };

// // Login: Validar contraseña de forma asincrónica
// export const isValidatePassword = (user, password) => {
//     return new Promise((resolve, reject) => {
//         bcrypt.compare(password, user.password, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };
