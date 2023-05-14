import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ClientsService } from 'app/config/config.service.clients'
import { HighlightDirective } from '../directives/highlight.directive';
import { FilterPipe } from '../pipes/filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [ NavbarComponent,HighlightDirective,FilterPipe ],
    imports: [ RouterModule, CommonModule, FormsModule, ReactiveFormsModule ],
    exports: [ NavbarComponent ],
    providers: [ ClientsService]
})

export class NavbarModule {}
