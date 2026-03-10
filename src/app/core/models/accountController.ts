export class Login {
    email: string;
    password: string;
}

export class LoginOrganizacion {
    organizacion: string;
}

export class LoginGenerateToken {
    email: string;
    password: string;
    organizacion: string;
}

export class Register {
    correoElectronico: string;
    nacionalidad: string;
    tipoDeUsuario: string;
    documentoDeIdentidad: string;
    numeroDeDocumento: string;
    codigoValidadorDocumento: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    sexoDeclarativo: string;
    sexoRegistral: string;
    fechaDeNacimiento: Date;
    contraseña: string;
    terminosYCondiciones: boolean;
}

export class ValidateEmail {
    userId: string;
    confirmationToken: string;
}

export class DatosUsuario {
    userId: string;
    confirmationToken: string;
}