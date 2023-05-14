import { Component, OnInit, Renderer2, ViewChild, ElementRef, Directive, Inject } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { DOCUMENT, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ClientsService } from 'app/config/config.service.clients';
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
    private listTitles: any[];
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;
    flag = false;
    searchText: string = "";
    public client_name: string[] = [];

    @ViewChild("navbar-cmp") button;
    @ViewChild('searchClient') searchClient: ElementRef;

    constructor(
        location: Location, 
        private renderer: Renderer2, 
        private element: ElementRef, 
        @Inject(DOCUMENT) public document: Document, 
        public auth: AuthService, 
        @Inject(DOCUMENT) private doc: Document,
        private clientService: ClientsService,
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

}
