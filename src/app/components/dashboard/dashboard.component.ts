import { Component, ViewChild  , ViewEncapsulation} from '@angular/core';
import { addClass, remove, createElement, Ajax } from '@syncfusion/ej2-base';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import {
  EventSettingsModel, View, ResourceDetails, TreeViewArgs, GroupModel, PopupOpenEventArgs, ScheduleComponent, CurrentAction,
  RenderCellEventArgs, ActionEventArgs, CellClickEventArgs, WorkHoursModel, Schedule, EJ2Instance
} from '@syncfusion/ej2-angular-schedule';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { ConfigService } from '../../config/config.service';
import { Bookings } from '../../config/employees';
import { ButtonComponent } from '@syncfusion/ej2-angular-buttons';
import { Staff, StaffService } from 'app/config/staff';
import { ConfigStaffService } from 'app/config/config.staff.service';
import { isNullOrUndefined } from 'util';
import { environment } from 'environments/environment';
import { TextBox } from '@syncfusion/ej2-inputs';
import { interval, Observable } from 'rxjs';

declare var $: any;

@Component({
  selector: 'dashboard-cmp',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent {
  @ViewChild('treeObj') public treeObj: TreeViewComponent;
  @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent;
  @ViewChild("addButton") public addButton: ButtonComponent;

  public isTreeItemDropped = false;
  public draggedItemId = '';
  public profileImageUrl; string: any;
  public group: GroupModel = {
    resources: ['Employees']
  };
  MODEL_OPEN: boolean = false;
  CONFIRM_MODEL_OPEN: boolean = false;
  saveNewBooking: Bookings = {};
  bookingData: Record<string, any>[] = [];
  COLOR_LIST: any = [];
  public isloaded: boolean = false;
  private dateTime = new Date();
  public selectedDate: Date = new Date(this.dateTime.getFullYear(), this.dateTime.getMonth(), this.dateTime.getDate());
  public currentView: View = 'Day';
  // public workHours: WorkHoursModel = { start: '12:00', end: '18:00' };
  public workWeekDays: number[] = [2, 3, 4, 5, 6];
  public allowResizing = true;
  public allowDragDrop = true;
  public onAppointmentDrag = false;
  public STAFF_LIST: any = [];
  public staffServices: StaffService[] = [];
  public servicesList: string[] = [];
  public SERVICE_CATEGORY_LIST: string[] = [];
  public CATEGORIES: any = [];
  error: any;
  staffData: Staff[] = [];
  temp = true;
  serviceDuration = 15;
  public showQuickInfo: Boolean = true;
  public showHeaderBar = true;
  public allowMultipleEmployees: Boolean = true;
  private selectionTarget: Element;
  public resourceDataSource: Record<string, any>[] = [];
  public staffImages: any[] = [];
  public flag: boolean = true;
  public setDifferentWorkHoursFlag: boolean = false;
  public islayoutChanged: boolean = false;
  CLIENT_NAME: string;
  CLIENT_PHONE: any;
  MASSAGE_CLIENT: string;
  CLIENT_NAME_PHONE: string;
  RESPOND_MESSAGE: string;

  async getStaffAvailability(){
    await (await this.staffService._getStaffAvailability()).subscribe(
      async (response: any ) => {
        this.resourceDataSource = response;
      },
      async (error: any) => {
      }
    );
  }
  async getStaffRota() {
    await (await this.staffService._getStaffRota()).subscribe(
      async (response: any ) => {
      },
      async (error: any) => {
      }
    );
  }
  async getStaffImage(){
    await this.staffService.getStaff().subscribe(
      async (response: any) => {
        for (let staff of response){
          this.staffImages.push({employeeId:staff.employee_id, employeeImg:staff.employeeImg});
        }
      },
      async (error: any) => {
      }
  );
  }
  getStaffServices() {
    this.staffService.getStaffServices()
      .subscribe(data => {
        var counter = 0;
        for (let [key, value] of Object.entries(data)) {
          this.servicesList.push(value.serviceName);
          this.staffServices.push(value);
          counter++;
        }
      });
  }
  async getStaffCategories() {
    await (await this.staffService._getCategoryList()).subscribe(
      async (response: any ) => {
        this.CATEGORIES = response;
        for (let category of response){
          this.SERVICE_CATEGORY_LIST.push(category.categoryName);
        }
      },
      async (error: any) => {
      }
    );
  }

  getBookings() {
    const check = this.schedularService.getBookings()
      .subscribe(bookings => {
        this.bookingData = bookings;
      });

    return check
  }

  public eventSettings: EventSettingsModel = {
    dataSource: this.resourceDataSource,
    fields: {
      subject: { title: 'First Name', name: 'firstName', validation: { required: true } },
      location: { title: 'Last Name', name: 'lastName', validation: { required: true } },
      startTime: { title: 'From', name: 'startTime', validation: { required: true } },
      endTime: { title: 'To', name: 'endTime', validation: { required: true } },
      description: { title: 'Notes', name: 'description' },
    }
  };

  onCellClick(args: CellClickEventArgs): void {
    this.scheduleObj.closeQuickInfoPopup();   // To programmatically close the quick popup 
    this.scheduleObj.openEditor(args, 'Add');
  }

  constructor(private schedularService: ConfigService, private staffService: ConfigStaffService) {
  }

  public getEmployeeName(employeeId: any) {
    for (let [key, value] of Object.entries(this.resourceDataSource)) {
      if (value.id === employeeId) {
        return value.name;
      }
    }
  }
  public getEmployeeIndex(employeeId: any) {
    for (let [key, value] of Object.entries(this.resourceDataSource)) {
      if (value.id === employeeId) {
        return Number(key);
      }
    }
  }
  public getWorkerName(value: ResourceDetails): string {
    return ((value as ResourceDetails).resourceData) ?
      (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField] as string
      : value.resourceName;
  }
  public getEmployeeImageById(employeeId: any) {
    for (let [key, value] of Object.entries(this.staffImages)) {
      if (value.employeeId === employeeId) {
        return value.employeeImg;
      }
    }
  }
  public getWorkerImage(value: any) {
    let imgUrl = this.getEmployeeImageById(value.resourceData.id);
    if ("../../assets/img/staff-profiles/" + value.resourceData.id + ".jpg" && value.resourceData.id) {
      // this.profileImageUrl = "../../assets/img/staff-profiles/" + value.resourceData.id + ".jpg";
      this.profileImageUrl = imgUrl;
    } else {
      this.profileImageUrl = "../../assets/img/staff-profiles/0.jpg";
    }
    const resourceName: string = this.profileImageUrl;

    return resourceName;
  }


  public onActionBegin(args: ActionEventArgs): void {
     let isEventChange: boolean = (args.requestType === 'eventChange');
        if (args.requestType == "eventCreate" ||args.requestType == "eventChange" || args.requestType == "eventRemove" ) {
          this.flag = false;
        } else {
          this.flag = true;
        }
    this.scheduleObj.closeQuickInfoPopup();
    if ((args.requestType === 'eventCreate' && (args.data as Record<string, any>[]).length > 0) || args.requestType === 'eventChange') {

      let eventData: any = !isNullOrUndefined(args.data[0]) ? args.data[0] : args.data;
      let scheduleElement: Element = document.querySelector('.e-schedule');
      let scheduleObj: Schedule = ((scheduleElement as EJ2Instance).ej2_instances[0] as Schedule);
      let resourceIndex = this.getEmployeeIndex(eventData.employeeId);
      args.cancel = this.isValidateTime(eventData.startTime, eventData.endTime, eventData.employeeId);

      if (!args.cancel || args.requestType === "eventChange") {
        if (args.requestType === "eventCreate") {
          var sendBooking = [JSON.stringify(this.createBookingsObject(args.addedRecords[0]))];
          sendBooking.push()
          $.ajax({
            url: `${environment.auth.apiUri}/bookings/saveBooking`,
            type: 'POST',
            data: "[" + JSON.stringify(this.createBookingsObject(args.addedRecords[0])) + "]",
            headers: {
              'Content-Type': 'application/json'
            },
          })
        } else if (args.requestType === "eventChange") {
          let schObj = (document.querySelector(".e-schedule") as any)
            .ej2_instances[0];
          const ajax = new Ajax(
            `${environment.auth.apiUri}/bookings/updateBooking`,
            "POST",
            false
          );
          ajax.data = JSON.stringify(this.createBookingsObject(args.changedRecords[0]));

          ajax.onSuccess = (data: any) => {
            schObj.eventSettings.dataSource = JSON.parse(JSON.stringify(data));
          };
          ajax.send();
          this.getBookingsDisplayer();
        }
      } else {
        $('#invalidBookingModal').modal('show');
      }
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
      for (const element of [].slice.call(elements)) {
        remove(element);
      }
    } else if (args.requestType === "eventRemove") {
      this.schedularService.removeBooking(args.deletedRecords[0].id);
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
      this.getBookingsDisplayer();
    }
  }

  public onActionComplete(args: ActionEventArgs): void {
    if (args.requestType === "toolBarItemRendered" || args.requestType === "dateNavigate" || args.requestType === "viewNavigate") {
      this.islayoutChanged = true;
    }
  }

  public isValidateTime(startDate: Date, endDate: Date, resIndex: number): boolean {
    var staffDetails = this.scheduleObj.getResourceCollections()[0].dataSource;
    var year = startDate.getFullYear();
    var month = startDate.getMonth()+1;
    var day = startDate.getDate();
    var month_string;
    var day_string;
    if(month<10) {
      month_string = "0"+month;
    } else{
      month_string = ""+month;
    }
    if(day<10) {
      day_string = "0"+day;
    } else{ 
      day_string = day;
    }
    var date = year+"-"+month_string+"-"+day_string;
    console.log("this is date",date);
    for (let [key, value] of Object.entries(staffDetails)) {
      let startTime;
      let endTime;
      if (value.id === resIndex) {
        for(var i=0; i< value.workDays.length; i++){
          if(value.workDays[i] === date){
            startTime = value.availability[i].startTime;
            endTime = value.availability[i].endTime;
          }
        }
        if(startTime==undefined || endTime==undefined){
          return true;
        }
        else{
          const startHour: number = parseInt(startTime.toString().slice(0, 2), 10);
          const endHour: number = parseInt(endTime.toString().slice(0, 2), 10);
  
          if (startHour <= startDate.getHours() && endHour >= endDate.getHours()) {
            return false;
          } else {
            return true
          }
        }
      }
    }
    return true;
  }

  public isTimeSlotAvailible(startDate: Date, endDate: Date,): boolean {
    var processedCellData = this.scheduleObj.eventsProcessed;
    for (let [key, value] of Object.entries(processedCellData)) {
      if ((startDate.getTime() <= value.startTime.getTime() && endDate.getTime() >= value.startTime.getTime()) ||
        (startDate.getTime() <= value.endTime.getTime() && endDate.getTime() >= value.endTime.getTime()) ||
        (startDate.getTime() >= value.startTime.getTime() && endDate.getTime() <= value.endTime.getTime())) {

        return false;
      }
    }
    return true;
  }

  onRenderCell(args: RenderCellEventArgs):void {
    
  }

  showNotification(from, align) {
    var type = ['danger'];

    var color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "pe-7s-gift",
      message: "<b>This Time is not availible to book</b> - Please select a differant time slot."

    }, {
      type: type[color],
      timer: 4000,
      placement: {
        from: from,
        align: align
      }
    });
  }

  private createBookingsObject(newBooking: any) {
    /* TODO
    * This is the mother of all hacks to get over daylight savings 2022/2023
    * Fix soon as possible, will fail in 2023 winter daylight savings
    */
    let daylightsavingsforward = 1;
    if (newBooking.startTime.getTime() > 1667084400000 && newBooking.startTime.getTime() < 1679788800000) {
      daylightsavingsforward = 0;
    }
    this.saveNewBooking.employeeId = !(newBooking.employeeId === undefined) ? newBooking.employeeId : null;
    this.saveNewBooking.clientId = !(newBooking.clientId === undefined) ? newBooking.clientId : null;
    this.saveNewBooking.description = !(newBooking.description === undefined || newBooking.description === null) ? newBooking.description : " "
    this.saveNewBooking.endTime = new Date(new Date(newBooking.endTime).setHours(new Date(newBooking.endTime).getHours() + daylightsavingsforward)).toISOString();
    this.saveNewBooking.startTime = new Date(new Date(newBooking.startTime).setHours(new Date(newBooking.startTime).getHours() + daylightsavingsforward)).toISOString();
    this.saveNewBooking.id = newBooking.id;
    this.saveNewBooking.isAllDay = !(newBooking.IsAllDay === undefined) ? newBooking.IsAllDay : null;
    this.saveNewBooking.customer = !(newBooking.location === undefined) ? newBooking.location : null;
    // this.saveNewBooking.category = !(newBooking.category === undefined) ? newBooking.category : null;
    this.saveNewBooking.service = !(newBooking.service === undefined) ? newBooking.service : null;
    this.saveNewBooking.serviceId = this.getServiceID(newBooking.service);
    this.saveNewBooking.categoryId = this.getCategoryID(newBooking.categoryName);
    this.saveNewBooking.firstName = newBooking.firstName;
    this.saveNewBooking.lastName = newBooking.lastName;
    this.saveNewBooking.email = !(newBooking.email === undefined) ? newBooking.email : "";
    this.saveNewBooking.phoneNumber = !(newBooking.phoneNumber === undefined) ? newBooking.phoneNumber : null;

    return this.saveNewBooking;
  }

  getServiceID(serviceName: string) {
    for (let [key, value] of Object.entries(this.staffServices)) {
      if (value.serviceName === serviceName) {
        return value.id;
      }
    }
    return;
  }

  getCategoryID(categoryName: string) {
    for (let [key, value] of Object.entries(this.staffServices)) {
      if (value.categoryName === categoryName) {
        return value.id;
      }
    }
    return;
  }

  async _getColourList() {
    await (await this.staffService._getColourList()).subscribe(
      async (response: any) => {
        this.COLOR_LIST = response;
      },
      async (error: any) => {
        alert('server error occuered')
      }
    );
  }
  
  public getColorByCategory(categoryId) {
    let colourId;
    let colourValue;
    for (let category of this.CATEGORIES) {
      if ((category.id) === Number(categoryId)) {
        colourId = category.colourId;
      }
    }
    for (let color of this.COLOR_LIST) {
      if ((color.id) === colourId) {
        colourValue = color.colourCode;
        return colourValue;
      }
    }
  }
  public getCategoryByServiceName(serviceName) {
    let categoryName = "";
    for (let staffService of this.staffServices) {
      if ((staffService.serviceName) === serviceName) {
        categoryName = staffService.categoryName;
        return categoryName;
      }
    }
    
  }
  public getServiceByCategory(staffServices) {
    const categoryName = $("#categorySelected").val();
    this.servicesList = [];
    try {
      for (const k in this.staffServices) {
        if ((this.staffServices[k].categoryName) === categoryName) {
          this.servicesList.push(this.staffServices[k].serviceName);
        }
      }
      // return this.servicesList;
    } catch (e) {
      console.log(e.message)
    }
  }

  getServiceDuration(staffServices) {
    const serviceName = $("#serviceSelected").val();

    try {
      for (const k in staffServices) {
        if ((staffServices[k].serviceName) === serviceName) {
          this.serviceDuration = staffServices[k].serviceDuration;
          return staffServices[k].serviceDuration;
        }
      }
    } catch (e) {
      console.log(e.message)
    }
  }

  serviceInputEle: HTMLInputElement = createElement('input', {
    className: 'e-field', attrs: { name: 'service' }, id: "serviceSelected"
  }) as HTMLInputElement;
  categoryInputEle: HTMLInputElement = createElement('input', {
    className: 'e-field', attrs: { name: 'category' }, id: "categorySelected"
  }) as HTMLInputElement;

  public onPopupOpen(args: PopupOpenEventArgs): void {
    this.selectionTarget = null;
    this.selectionTarget = args.target;
    const classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
    let isCell = args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells');
    if (args.type === "QuickInfo" && isCell) {
      args.cancel = true;
    }
    if (args.type === 'Editor') {

      let endObj = (args.element.querySelector('.e-end') as any)
        .ej2_instances[0];
      let startObj = (args.element.querySelector('.e-start') as any)
        .ej2_instances[0];
      endObj.format = "d/M/yy h:mm a";
      startObj.format = "d/M/yy h:mm a";
      let categoryDropDownList: DropDownList;
      let ServiceInputdropDownList: DropDownList;

      // Create required custom elements in initial time
      if (!args.element.querySelector('.custom-field-row')) {
        let row: HTMLElement = createElement('div', { className: 'custom-field-row' });
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container' });

        container.appendChild(this.categoryInputEle);
        row.appendChild(container);    
        categoryDropDownList = new DropDownList({
          dataSource: this.SERVICE_CATEGORY_LIST,
          fields: { text: 'text', value: 'value' },
          value: args.data.categoryName,
          floatLabelType: 'Always',
          placeholder: 'Category Provided',
        });
        categoryDropDownList.appendTo(this.categoryInputEle);        
        // end serviceInput row
        let containerFlag = false;
        container.addEventListener('click', (e: Event) => {
          containerFlag = true;
        });
        formElement.addEventListener('click', (e: Event) => {
          if(containerFlag){
            this.getServiceByCategory(this.staffServices);
            const categoryName = $("#categorySelected").val();
            if (categoryName){
              this.serviceInputEle.value = "";
              ServiceInputdropDownList.dataSource = this.servicesList;
            }
          }
      });
      }
      else{
        if(args.data.categoryName){
          this.categoryInputEle.value = args.data.categoryName;
        }
        if(args.data.service){
          this.serviceInputEle.value = args.data.service;
        }
      }
      if (!args.element.querySelector('.custom-field-row3')) {
        // create serviceInput row 
        let ServiceInputrow: HTMLElement = createElement('div', { className: 'custom-field-row3' });
        let ServiceInputformElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        ServiceInputformElement.firstChild.insertBefore(ServiceInputrow, args.element.querySelector('.e-title-location-row'));
        let ServiceInputcontainer: HTMLElement = createElement('div', { className: 'custom-field-container3' });
        ServiceInputcontainer.appendChild(this.serviceInputEle);
        ServiceInputrow.appendChild(ServiceInputcontainer);

        ServiceInputdropDownList = new DropDownList({
          dataSource: this.servicesList,
          fields: { text: 'text', value: 'value' },
          value: args.data.service,
          floatLabelType: 'Always',
          placeholder: 'Service Provided',
        });
        ServiceInputdropDownList.appendTo(this.serviceInputEle);

        ServiceInputformElement.addEventListener('mouseover', (e: Event) => {
          args.duration = this.getServiceDuration(this.staffServices);
          endObj.value = new Date(
            endObj.value.setHours(startObj.value.getHours())
          );
          endObj.value = new Date(
            endObj.value.setMinutes(startObj.value.getMinutes() + this.serviceDuration)
          );
        });
      }
      else {
        if(args.data.service){
          this.serviceInputEle.value = args.data.service;
        }
      }
      if (!args.element.querySelector('.custom-field-row1')) {
        let row: HTMLElement = createElement('div', { className: 'custom-field-row1' });
        let formElement: HTMLElement = <HTMLElement>args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container1' });
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: { name: 'email' }
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let numeric: TextBox = new TextBox({ placeholder: 'Email Address', value: args.data.category });
        numeric.appendTo(inputEle);
        inputEle.setAttribute('name', 'email');
      }
      if (!args.element.querySelector('.custom-field-row2')) {
        let row: HTMLElement = createElement('div', { className: 'custom-field-row2' });
        let formElement: HTMLElement = <HTMLElement>args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container2' });
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: { name: 'phoneNumber' }
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let numeric: TextBox = new TextBox({ placeholder: 'Phone Number', value: args.data.phoneNumber });
        numeric.appendTo(inputEle);
        inputEle.setAttribute('name', 'phoneNumber');
      }
    }

  }
  public onEuroIconClick(event: any) {
    event.stopPropagation();
  }
  public onPencilIconClick(event: any, firstName: string, lastName: string, phoneNumber: any) {
    event.stopPropagation();
    this.MODEL_OPEN = true;
    this.MASSAGE_CLIENT = "";
    console.log("...",phoneNumber);
    this.CLIENT_NAME = firstName +" "+ lastName;
    this.CLIENT_PHONE = phoneNumber;
    this.CLIENT_NAME_PHONE = firstName +" "+ lastName+ "(" + phoneNumber + ")";
  }
  _closeModel(){
    this.MODEL_OPEN = false;
  }
  _closeConfirmModel(){
    this.CONFIRM_MODEL_OPEN = false;
  }
  async _sendMessageToClient(){
    console.log("this is phone number",this.CLIENT_PHONE);
    console.log("this is message",this.MASSAGE_CLIENT);
    this._closeModel();
    this.CONFIRM_MODEL_OPEN = true;
    let data = {
      phoneNumber: this.CLIENT_PHONE,
      smsMessage: this.MASSAGE_CLIENT
    }
    await (await this.schedularService.sendMessageToClient(data)).subscribe(
      async (response: any ) => {
        console.log("response",response);
        this.RESPOND_MESSAGE = "Message was sent successfully"
      },
      async (error: any) => {
        if(error.status==200){
          this.RESPOND_MESSAGE = error.error.text;
        }
        else{
          this.RESPOND_MESSAGE = "Message was not sent";
        }
      }
    );

  }
  public onEditClick(args: any): void {
    if (this.selectionTarget) {
    let eventData: { [key: string]: Object } = this.scheduleObj.getEventDetails(this.selectionTarget) as { [key: string]: Object };
    let currentAction: CurrentAction = 'Save';
    if (!isNullOrUndefined(eventData.RecurrenceRule) && eventData.RecurrenceRule !== '') {
        if (args.target.classList.contains('e-edit-series')) {
        currentAction = 'EditSeries';
        eventData = this.scheduleObj.eventBase.getParentEvent(eventData, true);
        } else {
        currentAction = 'EditOccurrence';
        }
    }
    this.scheduleObj.openEditor(eventData, currentAction);
    }
}
public onCloseClick(): void {
  this.scheduleObj.quickPopup.quickPopupHide();
}
public onDeleteClick(args: any): void {
    this.onCloseClick();
    // if (this.selectionTarget) {
      const eventData: { [key: string]: Object } = this.scheduleObj.getEventDetails(this.selectionTarget) as { [key: string]: Object };
      let currentAction: CurrentAction;
      if (!isNullOrUndefined(eventData.RecurrenceRule) && eventData.RecurrenceRule !== '') {
          currentAction = args.target.classList.contains('e-delete-series') ? 'DeleteSeries' : 'DeleteOccurrence';
        }
      this.scheduleObj.deleteEvent(eventData, currentAction);
    // }
}
  public onItemDrag(event: any): void {
    if (this.scheduleObj.isAdaptive) {
      const classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
      if (classElement) {
        classElement.classList.remove('e-device-hover');
      }
      if (event.target.classList.contains('e-work-cells')) {
        addClass([event.target], 'e-device-hover');
      }
    }
    if (document.body.style.cursor === 'not-allowed') {
      document.body.style.cursor = '';
    }
    if (event.name === 'nodeDragging') {
      const dragElementIcon: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
      for (const icon of [].slice.call(dragElementIcon)) {
        icon.style.display = 'nodeDragging';
      }
    }
  }
 
  onBound(args: any): void {
    if (this.temp) {
      let schObj = (document.querySelector(".e-schedule") as any)
        .ej2_instances[0];
      const ajax = new Ajax(
        `${environment.auth.apiUri}/bookings/retrieveBookings`,
        "GET",
        false
      );

      ajax.onSuccess = (data: any) => {
        schObj.eventSettings.dataSource = JSON.parse(data);
      };
      ajax.send();

      let verticalViews: boolean = ['Day', 'Week'].indexOf(this.scheduleObj.currentView) > - 1;
      let currTime: Date = new Date(); 
      let hour = currTime.getHours().toString();
      hour = (hour.length > 1 ? hour : '0' + hour) + ':';
      let minute = currTime.getMinutes().toString();
      let text = hour + (minute.length > 1 ? minute : '0' + minute);

      if (verticalViews) {
        this.scheduleObj.scrollTo(text, undefined);
      }
///////////////
      this.temp = false;
    }

    if (this.islayoutChanged) {
      var renderedDates = this.scheduleObj.activeView.getRenderDates();
      this.scheduleObj.resetWorkHours();
      for (var i = 0; i < renderedDates.length; i++) {
        var dayIndex = renderedDates[i].getDay();
        var year = renderedDates[i].getFullYear();
        var month = renderedDates[i].getMonth()+1;
        var day = renderedDates[i].getDate();
        var month_string;
        var day_string;
        if(month<10) {
          month_string = "0"+month;
        } else{
          month_string = ""+month;
        }
        if(day<10) {
          day_string = "0"+day;
        } else{ 
          day_string = day;
        }
        var date = year+"-"+month_string+"-"+day_string;
        for (let [key, value] of Object.entries(this.resourceDataSource)) {
          let cnt = Number(key);
          // this.getWorkHours(dayIndex, value, cnt);
          let startTime: any;
          let endTime: any;
          if(value.workDays.length>0){
            for (let j = 0; j < value.workDays.length; j++) {
              if (value.workDays[j] == date) {
                if(value.availability[j] && value.availability[j].startTime){
                  startTime = value.availability[j].startTime;
                  endTime = value.availability[j].endTime;
                  this.scheduleObj.setWorkHours(
                    [renderedDates[i]],
                    startTime,
                    endTime,
                    cnt
                  );
                  // workHours[cnt] = { startHour: startTime, endHour: endTime, groupIndex: cnt };
                  // console.log("this is workHours",workHours[cnt]);
                }
              }
            }
          }                                                       
          
        }
          
      }
    }
  }

  getBookingsDisplayer() {
    let schObj = (document.querySelector(".e-schedule") as any)
      .ej2_instances[0];
    const ajax = new Ajax(
      `${environment.auth.apiUri}/bookings/retrieveBookings`,
      "GET",
      false
    );
    ajax.onSuccess = (data: any) => {
      schObj.eventSettings.dataSource = JSON.parse(data);
    };
    ajax.send();
  }


  ngOnInit() {
    this.getStaffImage();
    this.getBookings();
    this.getStaffRota();
    this.getStaffAvailability();
    this.getStaffServices();
    this.getStaffCategories();
    this._getColourList();

    //in 60 seconds get bookings data
    interval(60000).subscribe(x => {
      this.getBookingsDisplayer();
    });
  }
}
