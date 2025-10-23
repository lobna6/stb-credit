import { creditType } from "./Credit-Type.entity";

export class CreditSimulationRequest {
  public loanAmount!: number;
  public loanTermMonths!: number;
  public gracePeriodMonths!: number;
    public creditTypeId?: number;
}

export class CreditSimulationResponse {
  public id !: number;
  public loanAmount!: number;
  public loanTermMonths!: number;
  public gracePeriodMonths!: number;
  public monthlyPayment!: number;
  public totalCost!: number;
  public totalInterest!: number;
  public apr!: number;
  public schedule!: AmortizationLine[];
  public customerId?: number;
  public creditTypeId?: number;
  public creditTypeLabel?: string;
    public creditType?: creditType;

}

export class AmortizationLine {
  public period!: number;
  public openingBalance!: number;
  public payment!: number;
  public interest!: number;
  public principal!: number;
  public closingBalance!: number;
}
