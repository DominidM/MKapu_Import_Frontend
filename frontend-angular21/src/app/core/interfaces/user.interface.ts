export interface User {
  userId:     number;
  idCuenta:   number;  
  username:   string;
  email:      string;
  roleId:     number;
  roleName:   string;
  idSede:     number;
  sedeNombre: string;
  permisos:   string[];
  nombres:    string;
  apellidos:  string;
}