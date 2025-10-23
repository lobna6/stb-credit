import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from 'src/app/entities/document.entity';
import { LoanRequest } from 'src/app/entities/loan-request.entity';
import { DocumentService } from 'src/app/services/document.service';
import { LoanRequestService } from 'src/app/services/loan-request.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-add-documents',
  templateUrl: './add-documents.component.html',
  styleUrls: ['./add-documents.component.scss']
})
export class AddDocumentsComponent implements OnInit {
  documents: Document[] = [];
  isLoading = false;
  role = 'BANQUIER';
  public loan !: LoanRequest
  constructor(
      private sharedService: SharedService,
      private documentService: DocumentService,
      private router: Router,
      private loanService: LoanRequestService,
    ){}
  ngOnInit(): void {
    this.role = this.sharedService.getAccount().role;
    this.loan = this.sharedService.getLoanRequest();
      let doc = new Document();
    if (this.loan.customer?.id) doc.customerId = this.loan.customer?.id;
    if (this.loan?.id) doc.loanRequestId = this.loan.id;
    doc.listName = ['CIN','domiciliation de salaire','Fiche de paie']
    this.documentService.findByLoanAndCustomer(doc).subscribe({
      next: (docs) => {
        this.documents = docs;
      }})
  }

  onView(doc: Document): void {
    if (doc.fileBytes) {
      const byteCharacters = atob(doc.fileBytes);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.contentType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }

  onFileSelected(event: any, doc: Document): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        doc.fileBytes = base64;
        // doc.fileName = file.name;
        doc.contentType = file.type;
        console.log('File uploaded for doc:', doc);
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.documents.some(d => !d.fileBytes)) {
      alert('Please upload all required documents before saving.');
      return;
    }

    this.isLoading = true;
    this.documentService.saveDocuments(this.documents).subscribe({
      next: (savedDocs) => {
        this.isLoading = false;
        console.log('Documents saved successfully', savedDocs);
        this.router.navigate(['/request-list']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving documents', err);
        alert('Failed to save documents');
      }
    });
  }


  nextStep(){
        if (this.loan?.id !== undefined) {
      this.loan.step = 4;
      this.loan.libelle = 'sign-contract';
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
