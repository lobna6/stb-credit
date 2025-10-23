import { Customer } from "./customer.entity";


export interface Account {
  id: number;
  firstname:string,
  lastname:string,
  email: string;
  password:string,
  phone:string,
  clientNumber:number,
  role: string;
  enabled: boolean;
  customer: Customer;
  agence: string;
  username : string;
}
