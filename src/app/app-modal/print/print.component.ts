import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CartProduct, KEY_CODE } from 'src/bean/category';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {

  @Input() addedProducts : Array<CartProduct>;
  @Input() billNumber : string;

  totalQty : number = 0;
  totalPrice : number = 0;
  totalPriceNoGst : number = 0;
  cgst : number;
  sgst : number;
  date : Date;
  constructor() { 
    
  }

  ngOnInit(): void {
    this.date = new Date();

    console.log(this.addedProducts);
    this.addedProducts.forEach(c=>{
      this.totalQty += c.quantity;
      this.totalPrice +=(c.quantity*c.product.discountPrice)
      this.totalPriceNoGst += (c.quantity*c.product.discountPrice)*100/105;
    });
    this.cgst = (this.totalPriceNoGst*2.5)/100;
    this.sgst = (this.totalPriceNoGst*2.5)/100;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {  
    if (event.keyCode === KEY_CODE.ENTER) {
      this.printBillNew();
    }
  }

  printBillNew(){

  var elem = document.getElementById("billBorder");
   var mywindow = window.open('', 'PRINT', 'height=600,width=800');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('<style>');
    mywindow.document.write('@page { size: auto;  margin: 0mm; }');
    mywindow.document.write('.bill-border{margin: 10px;padding: 10px;border: 1px solid;border-radius: 5px;  }.thank{margin-top: 30px;text-align: center;margin-top: 20px;}table{width: 100%;}th{text-align: center;border-top: 1px solid !important;border-bottom: 1px solid !important;padding-top: 5px;padding-bottom: 5px;}td{text-align: center;padding: 5px 0px;}.sub-total{border-top: 1px solid !important;border-bottom: 1px solid !important;}.gst{font-size: 14px;}.amount{text-align: right;}.total{border-top: 1px solid !important;border-bottom: 1px solid !important;}.total-txt{text-align: left;font-weight: bold;}.print{margin-right: 5px;border: 1px solid var(--theme-color);background: var(--theme-color);padding: 8px;border-radius: 5px;color: white;   margin-left: 44%;margin-bottom: 10px; }.shop-name{margin-top: 20px;margin-bottom: 5px;text-align: center;font-size: 20px;font-weight: bold;}.shop-address{text-align: center;font-size: 14px;}.bill-no{margin-top: 10px;margin-bottom: 10px;}')
    mywindow.document.write('</style>');
    mywindow.document.write('</head><body style="padding-top: 20px;padding-bottom: 20px ;">');
    mywindow.document.write('<div id="printDiv"><div>');
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    var printBox = mywindow.document.getElementById("printDiv");
    var domClone = elem.cloneNode(true);
    printBox.innerHTML = "";
    printBox.appendChild(domClone);
    mywindow.focus(); // necessary for IE >= 10*/
    mywindow.print();
    mywindow.close();

    return true;

  }

  printBill(){
    var elem = document.getElementById("billBorder");
    var domClone = elem.cloneNode(true);
    
    var $printSection = document.getElementById("printSection");
    
    if (!$printSection) {
        let $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }
    
    $printSection.innerHTML = "";
    $printSection.appendChild(domClone);
    window.print();
  }

}
