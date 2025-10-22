// src/app/components/sign-pre-contract/sign-pre-contract.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SignaturePad } from 'angular2-signaturepad';
import { switchMap } from 'rxjs';
import { Document } from 'src/app/entities/document.entity';
import { LoanRequest } from 'src/app/entities/loan-request.entity';
import { Signature } from 'src/app/entities/signature.entity';
import { DocumentService } from 'src/app/services/document.service';
import { LoanRequestService } from 'src/app/services/loan-request.service';
import { SignatureServiceService } from 'src/app/services/Signature/signature-service.service';
import { SharedService } from 'src/app/shared/shared.service';


@Component({
  selector: 'app-sign-pre-contract',
  templateUrl: './sign-pre-contract.component.html',
  styleUrls: ['./sign-pre-contract.component.scss']
})
export class SignPreContractComponent implements OnInit {
  documents: Document[] = [];
  isLoading = false;
  public role !: string;
  public loan !: LoanRequest

  // Pour la signature
  signatureFile!: File | null;
  signaturePreview: string | null = null;

  isSigned = false;
  mode: 'draw' | 'file' = 'draw';
@ViewChild(SignaturePad) signaturePad!: SignaturePad;
signaturePadOptions = {
  minWidth: 2,
  canvasWidth: 400,
  canvasHeight: 150,
};
  drawnSignature: string | null = null;



  constructor(
    private sharedService: SharedService,
    private documentService: DocumentService,
    private router: Router,
    private loanService: LoanRequestService,
    private signatureService: SignatureServiceService

  ) { }

  ngOnInit(): void {
    this.role = this.sharedService.getAccount().role;
    this.loan = this.sharedService.getLoanRequest();
    console.log(this.loan.id);
    if (this.loan) {
      this.loadDocuments(this.loan);
      this.loadActiveSignature();

    }
  }

  loadDocuments(loan: LoanRequest) {
    this.isLoading = true;
    let doc = new Document();
    if (loan.customer?.id) doc.customerId = loan.customer?.id;
    if (loan?.id) doc.loanRequestId = loan.id;

    this.documentService.findByLoanAndCustomer(doc).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isSigned = docs.some(d => d.name.includes('Signed'));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load documents', err);
        this.isLoading = false;
      }
    });
  }

  viewDocument(doc: Document) {
    if (doc.fileBytes) {
      const blob = this.base64ToBlob(doc.fileBytes, 'application/pdf');
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }

  private base64ToBlob(base64: string, mime: string) {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }
  nextStep() {
    if (this.loan?.id !== undefined) {
      this.loan.step = 2;
      this.loan.libelle = 'check-score';
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
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    this.signatureFile = input.files[0];
    this.drawnSignature = null;
    const reader = new FileReader();
    reader.onload = () => this.signaturePreview = reader.result as string;
    reader.readAsDataURL(this.signatureFile);
  }
}

saveSignature() {
  let file: File;
  if (this.drawnSignature) {
    const blob = this.dataURItoBlob(this.drawnSignature);
    file = new File([blob], 'signature.png', { type: 'image/png' });
  } else if (this.signatureFile) {
    file = this.signatureFile;
  } else {
    return;
  }

  this.signatureService.uploadSignature(file).pipe(
    switchMap(sig => this.signatureService.attachSignature(this.loan.id!, sig.signatureUrl))
  ).subscribe({
    next: () => {
      alert('Contract signed successfully!');
      this.router.navigate(['/request-list']);   
    },
    error: err => console.error('Signature flow failed', err)
  });
}
loadActiveSignature() {
  this.signatureService.getMySignature().subscribe({
    next: (sig: Signature | null) => {
      if (sig) {
        this.signaturePreview = sig.signatureUrl;
        this.urlToFile(sig.signatureUrl, 'signature.png', 'image/png')
          .then(file => this.signatureFile = file)
          .catch(() => this.signatureFile = null);
      } else {
        this.signaturePreview = null;
        this.signatureFile = null;
      }
    },
    error: () => {
      this.signaturePreview = null;
      this.signatureFile = null;
    }
  });
}

private async urlToFile(url: string, filename: string, mimeType: string): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}


drawComplete() {
  this.drawnSignature = this.signaturePad.toDataURL('image/png');
  this.signaturePreview = this.drawnSignature;
  this.signatureFile = null;
}

clearPad() {
  this.signaturePad.clear();
  this.drawnSignature = null;
  this.signaturePreview = null;
}



private dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

}
