export class Customer {
  id!: number;


  fullName!: string;
  email!: string;
  phone!: string;
accountNumber !: string;

idType!: string;
  idNumber!: string;
  idIssueDate!: Date;
  fiscalNumber!: string;
age!: number;                  
monthlyExpenses!: number;      
monthlyIncome!: number;        
  employer!: string;
  profession!: string;

  address!: string;
  city!: string;
  postalCode!: string;


  spouseName?: string;
  spouseEmail?: string;
  spousePhone?: string;
  spouseIdType?: string;
  spouseIdNumber?: string;
  spouseIdIssueDate?: Date;
  spouseFiscalNumber?: string;
  spouseEmployer?: string;
  spouseProfession?: string;
  spouseAddress?: string;
  spouseCity?: string;
  spousePostalCode?: string;

  score ?: number;
}
