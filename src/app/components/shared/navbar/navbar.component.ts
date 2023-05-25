import { Component, OnInit, Renderer2, ViewChild, ElementRef, Directive, Inject, ChangeDetectorRef } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { DOCUMENT, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ClientsService } from 'app/config/config.service.clients';
import { ConfigStaffService } from 'app/config/config.staff.service';
import { AuthService } from '@auth0/auth0-angular';

import { FormBuilder , FormControl, FormGroup , Validators} from '@angular/forms';

var misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
}
declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    styleUrls: ['navbar.component.css'],
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit {
    LIST = [];
    private listTitles: any[];
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;
    flag = false;
    searchText: string = "";
    public client_name: string[] = [];
    MODEL_OPEN: boolean = false;
    NOTES: boolean = true;
    TRANSACTION: boolean = false;
    REVIEWS: boolean = false;
    POP_EMAIL: string = '';
    POP_NAME: string = '';
    POP_GENDER: string = '';
    POP_DOB: string = '';
    POP_CLIENT_ID: string = '';
    ADD_NOTE_DATE: string = '';
    ADD_NOTE_COMMENT: string = '';

    ADD_TRANSACTION_DATE: string = '';
    ADD_TRANSACTION_SERVICES: string = '';
    ADD_TRANSACTION_PRICE: string = '';
    CLIENT_TRANSACTION: any = [];
    CLIENT_REVIEWS: any = [
        { id: 1 , date: '15/09/2022' , time: '20:38' , comment: " great service today" , rating: 4, status: false},
        { id: 2 , date: '15/09/2022' , time: '20:38' , comment: " Long time waiting  for appointment today" , rating: 2,status: false},
        { id: 3 , date: '15/09/2022' , time: '20:38' , comment: " Hello testing" , rating: 1, status: false},
        { id: 4 , date: '15/09/2022' , time: '20:38' , comment: " Hello testing" , rating: 5, status: false},
    ];
    NOTES_LIST: any = [];
    TRANSACTION_LIST: any = [];
    CLIENT_NOTES: any = [];

    @ViewChild("navbar-cmp") button;
    @ViewChild('searchClient') searchClient: ElementRef;

    constructor(
        location: Location, 
        private changeDetection: ChangeDetectorRef,
        private renderer: Renderer2, 
        private element: ElementRef, 
        @Inject(DOCUMENT) public document: Document, 
        public auth: AuthService, 
        @Inject(DOCUMENT) private doc: Document,
        private clientService: ClientsService,
        private staffService: ConfigStaffService,
    ) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        this._getClients();
        this.renderer.listen('window', 'click',(e:Event)=>{
            if(e.target !== this.searchClient.nativeElement){
                this.flag = false;
            }
        });
    }

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);

        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        if ($('body').hasClass('sidebar-mini')) {
            misc.sidebar_mini_active = true;
        }
        $('#minimizeSidebar').click(function () {
            var $btn = $(this);

            if (misc.sidebar_mini_active == true) {
                $('body').removeClass('sidebar-mini');
                misc.sidebar_mini_active = false;

            } else {
                setTimeout(function () {
                    $('body').addClass('sidebar-mini');

                    misc.sidebar_mini_active = true;
                }, 300);
            }

            // we simulate the window Resize so the staff will get updated in realtime.
            var simulateWindowResize = setInterval(function () {
                window.dispatchEvent(new Event('resize'));
            }, 180);

            // we stop the simulation of Window Resize after the animations are completed
            setTimeout(function () {
                clearInterval(simulateWindowResize);
            }, 1000);
        });
    }
    async _getClients () {
        await ( await this.clientService.getClients()).subscribe(
            async (response: any) => {
                this.LIST = response;
                for (let value of response) {
                    value.status = true;
                }
                for (let item of response) {
                  if(item.givenName){
                    this.client_name.push(item.givenName+" "+item.familyName+"  "+item.phoneMobile);
                  }
                }
            },
            (error: any) => {
                console.log('error--', error);
            }
        );
    }
    
    insertInput(){
        this.flag = true;
    }
    insertList(item: any){
        this.flag = false;
        this.searchText = item;
        this.showClientDetail(item);
    }
    showClientDetail(searchItem: string){
        for (let item of this.LIST){
            let itemQuery = item.givenName+" "+item.familyName+"  "+item.phoneMobile;
            
            if(itemQuery == searchItem){
                this._showUser(item.email);
            }
          }
    }
    isMobileMenu() {
        if ($(window).width() < 991) {
            return false;
        }
        return true;
    }

    sidebarOpen() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');
        this.sidebarVisible = true;
    }
    sidebarClose() {
        var body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    }
    sidebarToggle() {
        if (this.sidebarVisible == false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    }

    getTitle() {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(1);
        }
        
        for (let i = 0; i < this.listTitles.length; i++) {
            //if (this.listTitles[i].type === "link" && this.listTitles[i].path === titlee) {
            if (titlee.indexOf('edit') !== -1) { // When url comes with edit 
                
                let [first , second , third] = titlee.split('/');
                titlee = `/${second}/${third}`;
            }

            if (this.listTitles[i].type === "link" && this.listTitles[i].path.indexOf(titlee) !== -1 ) {
                return this.listTitles[i].title;
            } else if (this.listTitles[i].type === "sub") {
                for (let j = 0; j < this.listTitles[i].children.length; j++) {
                    let subtitle = this.listTitles[i].path + '/' + this.listTitles[i].children[j].path;
                    if (subtitle === titlee) {
                        console.log('sub titlee--' , this.listTitles[i].children[j].title)
                        return this.listTitles[i].children[j].title;
                    }
                }
            }
        }
        return 'Dashboard';
    }

    getPath() {
        return this.location.prepareExternalUrl(this.location.path());
    }


    logout(): void {
        this.auth.logout({ returnTo: this.doc.location.origin });
    }

    async _showUser (email: string) {

    

        let user = await this.LIST.filter(data => data.email == email);
        
        if (user.length > 0){
    
          this.POP_EMAIL = user[0].email;
          this.POP_NAME = user[0].givenName+" "+user[0].familyName;
          this.POP_GENDER = user[0].gender;
          this.POP_DOB = user[0].dateOfBirth;

          this.POP_CLIENT_ID = user[0].userGMID;
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

      async _closeModel () {

        this.ADD_NOTE_DATE = '';
        this.ADD_NOTE_COMMENT = '';
        this.ADD_TRANSACTION_DATE = '';
        this.ADD_TRANSACTION_SERVICES = '';
        this.MODEL_OPEN = false;
        this.changeDetection.detectChanges(); 
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
}
