import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoanRequest } from 'src/app/entities/loan-request.entity';
import { LoanRequestService } from 'src/app/services/loan-request.service';
import { ScoringService } from 'src/app/services/scoring.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-check-score',
  templateUrl: './check-score.component.html',
  styleUrls: ['./check-score.component.scss']
})
export class CheckScoreComponent implements OnInit {

  role: 'CLIENT' | 'BANQUIER' = 'BANQUIER';

  /* result fields */
  score = 0;
  riskLabel = '';
  riskColor = '';
  scoreCalculated = false;
  isLoading = false;
  // customerScore !:number | undefined
  /* current loan to score */
  public loan: LoanRequest;

  constructor(
    private scoringService: ScoringService,
    private sharedService: SharedService,
    private loanService: LoanRequestService,
    private router: Router,
    
  ) {
    /* grab the loan we want to score */
    this.loan = this.sharedService.getLoanRequest(); // or however you store it
  }
  ngOnInit(): void {
    if (this.loan.customer?.score){ this.score =this.loan.customer?.score ;
    this.scoreCalculated = true
    }
  }

  calculateScore(): void {
    if (!this.loan) { return; }
    this.isLoading = true;

    this.scoringService.calculateCustomerScore(this.loan)
      .subscribe({
        next: res => {
          this.score = res.score;
          this.riskLabel = res.riskLabel;
          this.riskColor = res.riskColor;
          this.scoreCalculated = true;
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
  nextStep(){
        if (this.loan?.id !== undefined) {
      this.loan.step = 3;
      this.loan.libelle = 'add-documents';
      this.loanService.updateLoanRequest(this.loan.id, this.loan).subscribe({
        next: () => {
          this.router.navigate(['/'])
        },
        error: (err) => console.error(err)
      });
    }

  }
    rejectLoan() {
  if (this.loan?.id !== undefined) {
    this.loan.step = -1;
    this.loan.libelle = 'rejected';
    this.loanService.updateLoanRequest(this.loan.id, this.loan).subscribe({
      next: () => {
        this.router.navigate(['/'])
      },
      error: (err) => console.error(err)
    });
  }
}

}
