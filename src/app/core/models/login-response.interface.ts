export interface LoginResponseInterface {
    sub:      string;
    RolUnico: ClaveUnicaRolUnico;
    name:     ClaveUnicaName;
}

interface ClaveUnicaRolUnico{
    numero: number;
    DV:     string;
    tipo:   string;
}

interface ClaveUnicaName{
    apellidos: string[];
    nombres:   string[];
}