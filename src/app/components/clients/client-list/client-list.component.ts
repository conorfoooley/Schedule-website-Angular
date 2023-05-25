import { Component, OnInit, OnDestroy ,ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder , FormControl, FormGroup , Validators} from '@angular/forms';
import { ClientsService } from 'app/config/config.service.clients';

import {Subject} from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommanService } from 'app/config/comman.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfigStaffService } from 'app/config/config.staff.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {

  LIST = [];
  
  RESPONSE: any = [];
  ACTIVE_BUTTON: boolean = false;
  INACTIVE_BUTTON: any = false;
  SEARCH_TEXT: string = '';
  FILTER_SHOW: boolean = true;
  SEARCH_TEXT_TIMEOUT: any ;
  MODEL_OPEN: boolean = false;
  MESSAGE_MODEL_OPEN: boolean = false;
  ADD_CLINET_MODEL_OPEN: boolean = false;
  EDIT_CLINET_MODEL_OPEN: boolean = false;
  ADD_NOTE_DATE: string = '';
  ADD_NOTE_COMMENT: string = '';

  ADD_TRANSACTION_DATE: string = '';
  ADD_TRANSACTION_SERVICES: string = '';
  ADD_TRANSACTION_PRICE: string = '';

  MESSAGE_MODEL_TEXT: string = '';
  NOTES: boolean = true;
  TRANSACTION: boolean = false;
  REVIEWS: boolean = false;
  POP_EMAIL: string = '';
  POP_GENDER: string = '';
  POP_DOB: string = '';
  POP_NAME: string = '';
  POP_CLIENT_ID: string = '';
  ADD_CLIET_FORM: FormGroup;
  UPDATE_CLIENT_FORM: FormGroup;
  CLIENT_EMAIL: any ;
  CLIENT_GMID: any ;
  CLIENT_NOTES: any = [];
  CLIENT_TRANSACTION: any = [];
  CLIENT_REVIEWS: any = [
    { id: 1 , date: '15/09/2022' , time: '20:38' , comment: " great service today" , rating: 4, status: false},
    { id: 2 , date: '15/09/2022' , time: '20:38' , comment: " Long time waiting  for appointment today" , rating: 2,status: false},
    { id: 3 , date: '15/09/2022' , time: '20:38' , comment: " Hello testing" , rating: 1, status: false},
    { id: 4 , date: '15/09/2022' , time: '20:38' , comment: " Hello testing" , rating: 5, status: false},
  ]
;
  SPINNER_TEXT: string = 'Loading...';

  NOTES_LIST: any = [];

  TRANSACTION_LIST: any = [];


  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings =  {
    pagingType: 'full_numbers',
    pageLength: 20,
    order:[[0 , 'desc']],
    //ordering: false,
    searching: false,
    //lengthChange: false,
    lengthMenu : [5 , 10, 20 ,30 , 40],
    processing: true
  };
  dtTrigger: Subject<any> = new Subject();

  
  
  constructor (
    private fb: FormBuilder, 
    private clientService: ClientsService,
    private staffService: ConfigStaffService,
    private commanService: CommanService,
    private changeDetection: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
   
    ){
      
      this._initiateClientForm();
      this._initiateUpdateClientForm();
      this._getClients();
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

    this.FILTER_SHOW = false;
    this.changeDetection.detectChanges();
    this.FILTER_SHOW = false;
    

   // this.dtTrigger.unsubscribe();
  }

 
  
  // async _reinitiateTable() {

    

  //   this.dtOptions = {
  //       pagingType: 'full_numbers',
  //       pageLength: 5,
  //       //ordering: false,
  //       // searching: false,
  //       // lengthChange: false,
  //       // scrollX : true,
  //       lengthMenu : [5, 20, 25],
  //       processing: true
  //     };
    
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {

  //       // Destroy the table first
  //       dtInstance.destroy();
        
  //       // Call the dtTrigger to rerender again
  //       setTimeout(() => {
  //         this.dtTrigger.next();
  //       }, 4000); 
  //     }).then(()=>{

     

  //      });
  // }
  async _initiateClientForm() {

    this.ADD_CLIET_FORM = this.fb.group({

      name: ['', Validators.required],
      lastName: ['', Validators.required],
      //nickname: ['', Validators.required],
      //givenName: ['', Validators.required],
      // familyName: ['', Validators.required],
      gender: ['', Validators.required],
      phoneMobile: ['', Validators.required],
      dob: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]],
      //password: ['123456', Validators.required],
      // email: ['', [Validators.required, Validators.email]],
      // message: ['', [Validators.required, Validators.minLength(15)]],
    });
  }
  async _initiateUpdateClientForm() {

    this.UPDATE_CLIENT_FORM = this.fb.group({

      e_name: ['', Validators.required],
      e_familyName: ['', Validators.required],
      e_gender: ['', Validators.required],
      e_phoneMobile: ['', [Validators.required, Validators.maxLength(10)]],
      e_dob: ['', Validators.required],
      e_address: ['', Validators.required],
      e_email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]],
    });

  }

  async _getClientDetail () {

    await this.spinner.show();
    await (await this.clientService._getSingleClientDetail(this.CLIENT_EMAIL)).subscribe(
      async (response: any) => {
        if (response == null) {

          alert("Response didn't get from server side");
          return
        }

        let dob_value = '';

        if (response.hasOwnProperty('dateOfBirth')) {
          if(response.dateOfBirth){
            let [date , month , year] = response.dateOfBirth.split('/');
            dob_value = `${year}-${month}-${date}`;
          }
          
          // address = JSON.parse(response.user_metadata.addresses[0]).work_address;
        }
        console.log("this is responsive",response);
        this.CLIENT_GMID = response.userGMID;
        this.changeDetection.detectChanges();
        await this.UPDATE_CLIENT_FORM.patchValue({
          e_name : response.hasOwnProperty('givenName') ? response.givenName : '',
          e_familyName: response.hasOwnProperty('familyName') ? response.familyName : '',
          e_phoneMobile: response.hasOwnProperty('phoneMobile') ? response.phoneMobile : '',
          e_dob: response.hasOwnProperty('dateOfBirth')&&response.dateOfBirth ? response.dateOfBirth: '',
          e_address: response.hasOwnProperty('address') ? response.address : '',
          e_email: response.hasOwnProperty('email') ? response.email : '',
          e_gender: response.hasOwnProperty('gender')&&response.gender ?  response.gender.charAt(0).toUpperCase() + (response.gender.slice(1).toLowerCase()) : '',
        });

        await this.spinner.hide();
      },
      async (error: any) => {

        alert('something wrong on server side')
        
      }
    );
  }

  async _getClients () {
    console.log("i am")
    this.SPINNER_TEXT = 'Loading...';
    await this.spinner.show();

     ( await this.clientService.getClients()).subscribe(
        async (response: any) => {

            for (let value of response) {

                value.status = true;
            }

            this.changeDetection.detectChanges();
            this.LIST = response;
            
            this.RESPONSE = response

            
            this.dtTrigger.next();
            this.changeDetection.detectChanges();
            await this.spinner.hide();
        },
        async (error: any) => {

            //await this.spinner.hide();
            
        }
    );

  }

  async _searchBar () {

    clearTimeout(this.SEARCH_TEXT_TIMEOUT);
    this.SEARCH_TEXT_TIMEOUT = setTimeout( () => {
      this._filterData();
    }, 300);
  }

  async _showUser (email: string) {

    

    let user = await this.LIST.filter(data => data.email == email);
    
    if (user.length > 0){

      this.POP_EMAIL = user[0].email;
      this.POP_NAME = user[0].givenName+" "+user[0].familyName;
      this.POP_CLIENT_ID = user[0].userGMID;
      this.POP_GENDER = user[0].gender;
      this.POP_DOB = user[0].dateOfBirth;
    }

    this.ADD_NOTE_DATE = await  this._getCurrentDateTime();
    console.log('this.ADD_NOTE_DATE---' ,this.ADD_NOTE_DATE);
    

    await this._getClientNotes(user.length > 0 ? user[0].userGMID : 0);
    
    await this._getTrnasction();

    this.MODEL_OPEN = true;

    this.changeDetection.detectChanges();
  }

  async _getCurrentDateTime () {

    var currentdate = new Date(); 

    let year = currentdate.getFullYear();
    let month = (currentdate.getMonth()+1) < 10 ? "0"+(currentdate.getMonth()+1) : (currentdate.getMonth()+1);
    let date =  currentdate.getDate() < 10 ? "0" + currentdate.getDate() : currentdate.getDate();
    let hour = currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours();
    let minutes = currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes();
    let seconds = currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds();

    return await `${year}-${month}-${date}T${hour}:${minutes}:${seconds}`;
  }

  async _getTrnasction () {

    // let get_local_transaction: any = await localStorage.getItem('transaction_list');

    // if (get_local_transaction == undefined || get_local_transaction == null) {

    //   localStorage.setItem('transaction_list' , JSON.stringify([]))          
    // }

    // get_local_transaction = await JSON.parse(localStorage.getItem('transaction_list'));
    // this.TRANSACTION_LIST = get_local_transaction.reverse();

    // for (let value of this.TRANSACTION_LIST){

    //   value.date_time = `${value.date}T${value.time}`; 

    // }

    this.changeDetection.detectChanges();

    await (await this.staffService._getClientTransactionList()).subscribe(
      async (response:  any) => {

        console.log('this.TRANSACTION_LIST------response' , this.POP_CLIENT_ID ,response);
        this.TRANSACTION_LIST  = await response.filter(data => data.client_id == this.POP_CLIENT_ID);

        this.TRANSACTION_LIST = this.TRANSACTION_LIST.reverse()
        
        for (let value of this.TRANSACTION_LIST){

          value.transaction_date = value.transaction_date.split(' ').join('T'); 

        }

        console.log('this.TRANSACTION_LIST------' , this.TRANSACTION_LIST);

        this.changeDetection.detectChanges();
      }, 
      (error: any) => {

        this.CLIENT_NOTES = [];
      }
    );
  } 


  async _getClientNotes (client_id) {

    
    //client_id = 312;
    await (await this.clientService._getClientNotes()).subscribe(
      async (response:  any) => {


        this.CLIENT_NOTES  = await response.filter(data => data.clientId == this.POP_CLIENT_ID);

        this.CLIENT_NOTES = this.CLIENT_NOTES.reverse()
        
        for (let value of this.CLIENT_NOTES){

          value.date_time = `${value.date}T${value.time}`; 

        }

        console.log('this.CLIENT_NOTES---' , this.CLIENT_NOTES)

        //this.CLIENT_NOTES = response;
        this.changeDetection.detectChanges();
      }, 
      (error: any) => {

        this.CLIENT_NOTES = [];
      }
    );
  }

  

  async _filterData () {

    
    this.changeDetection.detectChanges();
    if (!this.ACTIVE_BUTTON && !this.INACTIVE_BUTTON && this.SEARCH_TEXT == '') {

        this.LIST = this.RESPONSE;
        
    } else if (!this.ACTIVE_BUTTON && !this.INACTIVE_BUTTON && this.SEARCH_TEXT != ''){

        
        this.LIST = this.RESPONSE.filter( data => 
                    (((data.hasOwnProperty('email') && data.email != undefined) ? data.email.toLocaleLowerCase() : '').indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1) 
                    || (((data.hasOwnProperty('familyName') && data.familyName != undefined)) ? data.familyName.toLocaleLowerCase() : '').indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1
                    || (((data.hasOwnProperty('givenName') && data.givenName != undefined)) ? data.givenName.toLocaleLowerCase() : '').indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1
                    || (((data.hasOwnProperty('phoneMobile') && data.phoneMobile != undefined)) ? data.phoneMobile.toLocaleLowerCase() : '').indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1
                    
                    );
        
    } else if (this.ACTIVE_BUTTON && this.SEARCH_TEXT != '') {

        this.LIST = this.RESPONSE.filter( data => ((data.email.toLocaleLowerCase()).indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1) && data.status == true);
        
    } else if (this.INACTIVE_BUTTON && this.SEARCH_TEXT != '') {

        this.LIST = this.RESPONSE.filter( data => ((data.email.toLocaleLowerCase()).indexOf(this.SEARCH_TEXT.toLocaleLowerCase()) != -1) && data.status == false);
    } else if (this.ACTIVE_BUTTON && this.SEARCH_TEXT == '') {

        this.LIST = this.RESPONSE.filter( data => data.status == true);
        
    } else if (this.INACTIVE_BUTTON && this.SEARCH_TEXT == '') {

        this.LIST = this.RESPONSE.filter( data => data.status == false);
    }  


    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {

      dtInstance.destroy();
      
      this.dtTrigger.next(); // Call the dtTrigger to rerender again
       
    }).then(async ()=>{

     });
  }

  async _activeButtonFilter (){

    this.ACTIVE_BUTTON =! this.ACTIVE_BUTTON;

    if (this.ACTIVE_BUTTON) {

        this.INACTIVE_BUTTON = false;
    }

    await this._filterData();
  }

  async _inActiveButtonFilter (){

    this.INACTIVE_BUTTON =! this.INACTIVE_BUTTON;

    if (this.ACTIVE_BUTTON) {

        this.ACTIVE_BUTTON = false;
    }
    
    await this._filterData();
  }

  async _editClientModalShow(email: string){
    this.CLIENT_EMAIL = email;
    await this._getClientDetail();
    this.EDIT_CLINET_MODEL_OPEN = true;
  }
  _closeEditClientModal(){
    this.EDIT_CLINET_MODEL_OPEN = false;
  }

  async _deleteUser (email: string) {
        
    if (confirm('Are you sure ? you want to delete this user.')) {

        this.SPINNER_TEXT = 'Deleting...';
        await this.spinner.show();

        await (await this.clientService._deleteClient(email)).subscribe(
            (response: any) => {

            },
            async (error: any) => {

                if (error.status == this.commanService.SUCCESS_CODE) {
                  await this.spinner.hide();
                    
                    this.MESSAGE_MODEL_TEXT = "Client deleted successfully !"
                    this.MESSAGE_MODEL_OPEN = true;
                    this.changeDetection.detectChanges(); 
                    

                    
                    // this.LIST = [];
                    // this.RESPONSE = [];
                    // this.FULL_RESPONSE = [];

                    // await this._getClients();
                } else{

                    if (<any>(String(email)
                    .toLowerCase()
                    .match(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) == 'null') {

                        alert('email is not valid')
                    } else {


                        alert('Something went wrong on server side. Please try again later')
                        this.spinner.hide();
                        this.changeDetection.detectChanges(); 
                    }
                }

            }
        );
    }
    
  }

  async _closeModel () {

    this.ADD_NOTE_DATE = '';
    this.ADD_NOTE_COMMENT = '';
    this.ADD_TRANSACTION_DATE = '';
    this.ADD_TRANSACTION_SERVICES = '';
    this.MODEL_OPEN = false;
    this.changeDetection.detectChanges(); 
  }

  async _closeMessageModel () {

    this.MESSAGE_MODEL_OPEN = false;
    this.changeDetection.detectChanges(); 
    setTimeout(() => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {

        // Destroy the table first
        dtInstance.destroy();
        
        // Call the dtTrigger to rerender again
        // setTimeout(() => {
        //   this.dtTrigger.next();
        // }, 4000); 
      }).then(async ()=>{
        await this._getClients();

       });
    }, 200);
  }

  async _changeTabs (number: any) {

    this.NOTES = false;
    this.TRANSACTION = false;
    this.REVIEWS = false;

    if (number == 1) this.NOTES = true;
    if (number == 2) this.TRANSACTION = true;
    if (number == 3) this.REVIEWS = true;
    this.changeDetection.detectChanges();
  }

  


  async _addNote() {

    if (this.ADD_NOTE_DATE == '' || this.ADD_NOTE_COMMENT == '') {

      alert('field can\'t be empy')
      return;
    }

    let [date , time] = this.ADD_NOTE_DATE.split('T');

    let data = {

      clientId: this.POP_CLIENT_ID,
      date: date , 
      time: time ,
      comment: this.ADD_NOTE_COMMENT,
      status: true,
    };


    await (await this.staffService._addClientNote(data)).subscribe(
      async (response:  any) => {

      },
      async (error: any) => {

        if (error.status == 200) {

          this.ADD_NOTE_DATE = '';
          this.ADD_NOTE_COMMENT = '';
          this.changeDetection.detectChanges();

          this._showUser(this.POP_EMAIL);
        } else {

          alert('server error occurred')
        }
        
      }

    );

    
    

  }

  async _noteInputChange (note_id , index , key_name , value) {

    this.CLIENT_NOTES[index][key_name] = value;

    
    let data = [
                  {
                      "id":note_id,
                      "clientId": 1051,
                      "comment": "Updated Client Note"
                  }
               ];

  }

  async _transactionInputChange (transaction_id , index , key_name , value) {

    
    this.TRANSACTION_LIST[index][key_name] = value.replace('€','');;
  }


  // async _addTransaction () {

  //   let [date , time] = this.ADD_TRANSACTION_DATE.split('T');

  //   if (this.ADD_TRANSACTION_DATE == '' || this.ADD_TRANSACTION_SERVICES == '' || this.ADD_TRANSACTION_PRICE == '') {

  //     alert('field can\'t be empy')
  //     return;
  //   }

  //   let get_user = await this.LIST.filter(data => data.email == this.POP_EMAIL);
  //   let get_local_transaction = await JSON.parse(localStorage.getItem('transaction_list'));

  //   get_local_transaction.push({

      
  //     date: date , 
  //     time: time ,
  //     services_name: this.ADD_TRANSACTION_SERVICES,
  //     price: this.ADD_TRANSACTION_PRICE,
  //     id: Date.now() + Math.random(),
  //     status: true,
  //   });

  //   await localStorage.setItem('transaction_list' , JSON.stringify(get_local_transaction));

  //   // let data = {

  //   //   clientId: get_user.length > 0 ? get_user[0].userGMID : 0,
  //   //   date_time: date,
  //   //   services_name : this.ADD_TRANSACTION_SERVICES,
  //   //   time: time+":00"
  //   // }

  //   this.ADD_TRANSACTION_SERVICES = '';
  //   this.ADD_TRANSACTION_DATE = '';
  //   this.ADD_TRANSACTION_PRICE = '';

  //   this._getTrnasction()
  // }

  // async _updateTransaction (id: any) {

  //   return
  //   let get_transaction = await this.TRANSACTION_LIST.filter( data => data.id == id);
    
  //   let get_local_transaction = await JSON.parse(localStorage.getItem('transaction_list'));

  //   for (let value of get_local_transaction) {

  //     if (value.id == id) {

  //       let [date , time] = get_transaction[0].date_time.split('T');


  //       value.date = date;
  //       value.time = time;
  //       value.services_name = get_transaction[0].services_name;
  //       value.price = get_transaction[0].price.replace('€','');
  //     }
  //   }

  //   localStorage.setItem('transaction_list' , JSON.stringify(get_local_transaction));
  //   this._getTrnasction()
  // }


  async _updateNote(note_id : any) {

    
    let get_note = await this.CLIENT_NOTES.filter( data => data.id == note_id);

    let update_data = [{
      id: note_id,
      clientId: this.POP_CLIENT_ID,
      comment: get_note.length > 0 ? get_note[0].comment : '',
    }];

    await (await this.staffService._updateClientNote(update_data)).subscribe(
      async (response:  any) => {

      },
      async (error: any) => {

        if (error.status == 200) {

          this._showUser(this.POP_EMAIL);
        } else {

          alert('server error occurred')
        }
      }

    );

    
  }

  async _deleteTranaction (id) {

    return;

    if (confirm("Are you sure? you want to delete this transaction")) {

      
      this.TRANSACTION_LIST = await this.TRANSACTION_LIST.filter(data => data.id != id);

      // let get_local_transaction = await JSON.parse(localStorage.getItem('transaction_list'));
      // get_local_transaction = await get_local_transaction.filter( data => data.id != id);

      // localStorage.setItem('transaction_list' , JSON.stringify(get_local_transaction));
    
      await (await this.staffService._deleteClientTransaction(id)).subscribe(
        async (response:  any) => {
  
        },
        async (error: any) => {
  
          if (error.status == 200) {
  
            this._showUser(this.POP_EMAIL);
          } else {
  
            alert('server error occurred')
          }
        }
  
      );
      return

    }
  }

  async _deleteNote (id: any) {

    if (confirm("Are you sure? you want to delete this note")) {

      
      this.CLIENT_NOTES = await this.CLIENT_NOTES.filter(data => data.id != id);
    
      this.changeDetection.detectChanges(); 
      
      await (await this.staffService._deleteClientNote(id)).subscribe(
        async (response:  any) => {
  
        },
        async (error: any) => {
  
          if (error.status == 200) {
  
            this._showUser(this.POP_EMAIL);
          } else {
  
            alert('server error occurred')
          }
        }
  
      );

    }
    

    
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  _addClientModalShow(){
    this.ADD_CLINET_MODEL_OPEN = true;
  }
  _closeAddClientModal(){
    this.ADD_CLINET_MODEL_OPEN = false;
  }

  async _addClient(form: any) {
    if (!form.valid) return;

    let [year , month , date] = this.ADD_CLIET_FORM.value.dob.split('-');
    console.log("this is dob",this.ADD_CLIET_FORM.value.dob);
    let data = {
      //name: this.ADD_CLIET_FORM.value.name,
      familyName: this.ADD_CLIET_FORM.value.lastName,
      //nickname: this.ADD_CLIET_FORM.value.nickname,
      givenName: this.ADD_CLIET_FORM.value.name,
      // familyName: this.ADD_CLIET_FORM.value.familyName,
      //phoneLandline: this.ADD_CLIET_FORM.value.phoneLandline,
      phoneMobile: this.ADD_CLIET_FORM.value.phoneMobile,
      email: this.ADD_CLIET_FORM.value.email,
      dateOfBirth: this.ADD_CLIET_FORM.value.dob,
      // dateOfBirth: `${date}/${month}/${year}`,
      address: this.ADD_CLIET_FORM.value.address,
      gender: this.ADD_CLIET_FORM.value.gender,
      // user_metadata: {
      //     dob: `${date}/${month}/${year}`,
      //     addresses: [this.ADD_CLIET_FORM.value.address],
      //     gender: this.ADD_CLIET_FORM.value.gender.toUpperCase(),
      // }
    }
    console.log("this is data",data);

    await (await this.staffService._addClient(data)).subscribe(
      async (response: any) => {

        
        this.ADD_CLIET_FORM.reset();
        this.ADD_CLINET_MODEL_OPEN = false;
        this.MESSAGE_MODEL_TEXT = "Client added successfully !"
        this.MESSAGE_MODEL_OPEN = true;
      },
      async (error: any) => {

        if (error.status == 200) {

         if (error.error.text.indexOf('Successfully') == -1){

          alert(error.error.text);
         } else {
            this.ADD_CLINET_MODEL_OPEN = false;
            this.MESSAGE_MODEL_TEXT = "Client added successfully !";
            this.MESSAGE_MODEL_OPEN = true; 
            this.changeDetection.detectChanges();
            this.ADD_CLIET_FORM.reset();
         }
          
          
        } else {

          alert('Client not added. Server error occuered Please try again later')
        }
        
      }
    );
  }

  async _updateClient (form: any) {

    let [year , month , date] = this.UPDATE_CLIENT_FORM.value.e_dob.split('-');
    
    let data = {
                  email: this.UPDATE_CLIENT_FORM.value.e_email,
                  givenName : this.UPDATE_CLIENT_FORM.value.e_name,
                  //given_name : this.UPDATE_CLIENT_FORM.value.givenName,
                  familyName : this.UPDATE_CLIENT_FORM.value.e_familyName,
                  phoneMobile : this.UPDATE_CLIENT_FORM.value.e_phoneMobile,
                  // dob: `${date}/${month}/${year}`,
                  dateOfBirth: this.UPDATE_CLIENT_FORM.value.e_dob,
                  address: this.UPDATE_CLIENT_FORM.value.e_address,
                  gender: this.UPDATE_CLIENT_FORM.value.e_gender,
                  userGMID: this.CLIENT_GMID,
                  // user_metadata: {
                  //   dob: `${date}/${month}/${year}`,
                  //   addresses: [
                  //     this.UPDATE_CLIENT_FORM.value.e_address
                  //   ],
                  //   gender: this.UPDATE_CLIENT_FORM.value.e_gender.toUpperCase(),
                  // }
              };
    console.log("this is email",this.CLIENT_EMAIL);
    console.log("this is data",data);
    await (await this.staffService._updateClient(data)).subscribe(
      (response: any) => {
        console.log("this is response",response)
        if ( response.familyName != '' ) {
          // alert('Client updated successfully----s');
          this.EDIT_CLINET_MODEL_OPEN = false;
          this.MESSAGE_MODEL_TEXT = "Client updated successfully !";
          this.MESSAGE_MODEL_OPEN = true; 
          this.changeDetection.detectChanges();
          this.UPDATE_CLIENT_FORM.reset();
        } else {
          alert('Something wrong on server side. Please try again later');
        }
      }, 
      (error: any) => {

        if (error.status == 200) {

          // alert('Client updated successfully');
          this.EDIT_CLINET_MODEL_OPEN = false;
          this.MESSAGE_MODEL_TEXT = "Client updated successfully !";
          this.MESSAGE_MODEL_OPEN = true; 
          this.changeDetection.detectChanges();
          this.ADD_CLIET_FORM.reset();
          
        } else {
          alert('Something wrong on server side. Please try again later');
        }

      }
    );

  }

  public errorMesages = {

    name: [
      { type: 'required', message: " Name is required" },
      // { type: 'maxlength', message: "Name cant be longer  than 100 characters" },
    ],
    lastName: [
      { type: 'required', message: "Last name is required" },
    ],
    nickname: [
      { type: 'required', message: "Nick name is required" },
    ],
    givenName: [
      { type: 'required', message: "Given name is required" },
    ],
    familyName: [
      { type: 'required', message: "Family name is required" },
    ],
    address: [
      { type: 'required', message: "Address is required" },
    ],
    phoneLandline: [
      { type: 'required', message: "Phone landline is required" },
    ],
    phoneMobile: [
      { type: 'required', message: "Phone mobile is required" },
      { type: 'maxlength', message: "Phone cant be longer  than 10 digit" }
    ],
    dob: [
      { type: 'required', message: "Date of birth is required" },
    ],
    gender: [
      { type: 'required', message: "Gender is required" },
    ],
    email: [
      { type: 'required', message: "Email is required" },
      { type: 'pattern', message: "Please enter a valid email address" },
    ],

  }

  get name() {
    return this.ADD_CLIET_FORM.get('name');
  }

  get lastName() {
    return this.ADD_CLIET_FORM.get('lastName');
  }

  get familyName() {
    return this.ADD_CLIET_FORM.get('familyName');
  }

  get phoneMobile() {
    return this.ADD_CLIET_FORM.get('phoneMobile');
  }

  get dob() {
    return this.ADD_CLIET_FORM.get('dob');
  }

  get address() {
    return this.ADD_CLIET_FORM.get('address');
  }
  
  get email() {
    return this.ADD_CLIET_FORM.get('email');
  }
  get gender() {
    return this.ADD_CLIET_FORM.get('gender');
  }



  get e_name() {
    return this.UPDATE_CLIENT_FORM.get('e_name');
  }

  get e_lastName() {
    return this.UPDATE_CLIENT_FORM.get('e_lastName');
  }

  get e_nickname() {
    return this.UPDATE_CLIENT_FORM.get('e_nickname');
  }

  get e_givenName() {
    return this.UPDATE_CLIENT_FORM.get('e_givenName');
  }

  get e_familyName() {
    return this.UPDATE_CLIENT_FORM.get('e_familyName');
  }
  
  get e_gender() {
    return this.UPDATE_CLIENT_FORM.get('e_gender');
  }

  get e_phoneLandline() {
    return this.UPDATE_CLIENT_FORM.get('e_phoneLandline');
  }

  get e_phoneMobile() {
    return this.UPDATE_CLIENT_FORM.get('e_phoneMobile');
  }

  get e_dob() {
    return this.UPDATE_CLIENT_FORM.get('e_dob');
  }

  get e_address() {
    return this.UPDATE_CLIENT_FORM.get('e_address');
  }
  
  get e_email() {
    return this.UPDATE_CLIENT_FORM.get('e_email');
  }
}
