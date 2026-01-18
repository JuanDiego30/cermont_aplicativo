import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Iconos SVG reutilizables
const ICONS = {
  dashboard: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>`,
  ordenes: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 2C4.11929 2 3 3.11929 3 4.5V19.5C3 20.8807 4.11929 22 5.5 22H18.5C19.8807 22 21 20.8807 21 19.5V4.5C21 3.11929 19.8807 2 18.5 2H5.5ZM4.5 4.5C4.5 3.94772 4.94772 3.5 5.5 3.5H18.5C19.0523 3.5 19.5 3.94772 19.5 4.5V19.5C19.5 20.0523 19.0523 20.5 18.5 20.5H5.5C4.94772 20.5 4.5 20.0523 4.5 19.5V4.5ZM7 7.25C7 6.83579 7.33579 6.5 7.75 6.5H16.25C16.6642 6.5 17 6.83579 17 7.25C17 7.66421 16.6642 8 16.25 8H7.75C7.33579 8 7 7.66421 7 7.25ZM7.75 10.5C7.33579 10.5 7 10.8358 7 11.25C7 11.6642 7.33579 12 7.75 12H16.25C16.6642 12 17 11.6642 17 11.25C17 10.8358 16.6642 10.5 16.25 10.5H7.75ZM7 15.25C7 14.8358 7.33579 14.5 7.75 14.5H12.25C12.6642 14.5 13 14.8358 13 15.25C13 15.6642 12.6642 16 12.25 16H7.75C7.33579 16 7 15.6642 7 15.25Z" fill="currentColor"></path></svg>`,
  hes: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2L3 7V17L12 22L21 17V7L12 2ZM5 8.5L12 4.5L19 8.5V15.5L12 19.5L5 15.5V8.5ZM12 7C11.4477 7 11 7.44772 11 8V12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12V8C13 7.44772 12.5523 7 12 7ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor"></path></svg>`,
  planeacion: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C8.41421 2 8.75 2.33579 8.75 2.75V3.75H15.25V2.75C15.25 2.33579 15.5858 2 16 2C16.4142 2 16.75 2.33579 16.75 2.75V3.75H18.5C19.7426 3.75 20.75 4.75736 20.75 6V9V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19V9V6C3.25 4.75736 4.25736 3.75 5.5 3.75H7.25V2.75C7.25 2.33579 7.58579 2 8 2ZM8 5.25H5.5C5.08579 5.25 4.75 5.58579 4.75 6V8.25H19.25V6C19.25 5.58579 18.9142 5.25 18.5 5.25H16H8ZM19.25 9.75H4.75V19C4.75 19.4142 5.08579 19.75 5.5 19.75H18.5C18.9142 19.75 19.25 19.4142 19.25 19V9.75Z" fill="currentColor"></path></svg>`,
  ejecucion: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8H18C19.1046 8 20 8.89543 20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10C4 8.89543 4.89543 8 6 8H8V6ZM14 6H10V8H14V6ZM6 10H18V18H6V10ZM9 13C9 12.4477 9.44772 12 10 12H14C14.5523 12 15 12.4477 15 13C15 13.5523 14.5523 14 14 14H10C9.44772 14 9 13.5523 9 13Z" fill="currentColor"></path></svg>`,
  evidencias: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM5 5H19V15.5858L16.7071 13.2929C16.3166 12.9024 15.6834 12.9024 15.2929 13.2929L13 15.5858L10.7071 13.2929C10.3166 12.9024 9.68342 12.9024 9.29289 13.2929L5 17.5858V5ZM5 19H19V17.4142L16 14.4142L13.7071 16.7071C13.3166 17.0976 12.6834 17.0976 12.2929 16.7071L10 14.4142L5 19.4142V19ZM8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" fill="currentColor"></path></svg>`,
  reportes: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM5 5H19V19H5V5ZM7 16V10H9V16H7ZM11 16V7H13V16H11ZM15 16V12H17V16H15Z" fill="currentColor"></path></svg>`,
  tecnicos: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4ZM6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8ZM8 18C6.34315 18 5 19.3431 5 21C5 21.5523 4.55228 22 4 22C3.44772 22 3 21.5523 3 21C3 18.2386 5.23858 16 8 16H16C18.7614 16 21 18.2386 21 21C21 21.5523 20.5523 22 20 22C19.4477 22 19 21.5523 19 21C19 19.3431 17.6569 18 16 18H8Z" fill="currentColor"></path></svg>`,
  clientes: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6C5 5.44772 5.44772 5 6 5ZM12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8ZM8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10ZM9 16C8.44772 16 8 16.4477 8 17C8 17.5523 8.44772 18 9 18H15C15.5523 18 16 17.5523 16 17C16 16.4477 15.5523 16 15 16H9Z" fill="currentColor"></path></svg>`,
  checklists: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6ZM5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6ZM15.7071 9.29289C16.0976 9.68342 16.0976 10.3166 15.7071 10.7071L11.7071 14.7071C11.3166 15.0976 10.6834 15.0976 10.2929 14.7071L8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929C8.68342 10.9024 9.31658 10.9024 9.70711 11.2929L11 12.5858L14.2929 9.29289C14.6834 8.90237 15.3166 8.90237 15.7071 9.29289Z" fill="currentColor"></path></svg>`,
  facturacion: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM6 4H13V8C13 8.55228 13.4477 9 14 9H18V20H6V4ZM15 5.41421L16.5858 7H15V5.41421ZM8 12C8 11.4477 8.44772 11 9 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H9C8.44772 13 8 12.5523 8 12ZM9 15C8.44772 15 8 15.4477 8 16C8 16.5523 8.44772 17 9 17H13C13.5523 17 14 16.5523 14 16C14 15.4477 13.5523 15 13 15H9Z" fill="currentColor"></path></svg>`,
  kpis: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM12 6C8.68629 6 6 8.68629 6 12H12V6Z" fill="currentColor"></path></svg>`,
  alertas: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C8.13401 2 5 5.13401 5 9V12.5858L3.29289 14.2929C3.10536 14.4804 3 14.7348 3 15V17C3 17.5523 3.44772 18 4 18H9C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18H20C20.5523 18 21 17.5523 21 17V15C21 14.7348 20.8946 14.4804 20.7071 14.2929L19 12.5858V9C19 5.13401 15.866 2 12 2ZM13 18H11C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18ZM7 9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V13C17 13.2652 17.1054 13.5196 17.2929 13.7071L19 15.4142V16H5V15.4142L6.70711 13.7071C6.89464 13.5196 7 13.2652 7 13V9Z" fill="currentColor"></path></svg>`,
  configuracion: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M10.7673 2.01176C11.1673 1.96275 11.5789 1.99996 12 1.99996C12.4212 1.99996 12.8328 1.96275 13.2328 2.01176L13.6006 2.05678C14.4084 2.15561 15.087 2.70557 15.3524 3.47914L15.6855 4.44961C15.7988 4.77969 16.0545 5.04158 16.3768 5.17119L16.4062 5.18301C16.7172 5.30792 17.0722 5.29854 17.3765 5.15715L18.3112 4.72307C19.0475 4.38109 19.9208 4.4933 20.5458 5.00631L20.8244 5.23494C21.5766 5.85253 21.8692 6.87189 21.5626 7.80237L21.2511 8.74788C21.1466 9.06468 21.175 9.41106 21.3304 9.69809L21.3457 9.72643C21.5002 9.99923 21.7664 10.1982 22.0775 10.2748L23.0476 10.5138C23.8878 10.7208 24.5008 11.4608 24.5001 12.3271V12.673C24.5008 13.5393 23.8878 14.2793 23.0476 14.4863L22.0775 14.7253C21.7664 14.8019 21.5002 15.0009 21.3457 15.2737L21.3304 15.302C21.175 15.589 21.1466 15.9354 21.2511 16.2522L21.5626 17.1977C21.8692 18.1282 21.5766 19.1476 20.8244 19.7651L20.5458 19.9938C19.9208 20.5068 19.0475 20.619 18.3112 20.277L17.3765 19.8429C17.0722 19.7015 16.7172 19.6922 16.4062 19.8171L16.3768 19.8289C16.0545 19.9585 15.7988 20.2204 15.6855 20.5505L15.3524 21.5209C15.087 22.2945 14.4084 22.8445 13.6006 22.9433L13.2328 22.9883C12.8328 23.0373 12.4212 23.0001 12 23.0001C11.5789 23.0001 11.1673 23.0373 10.7673 22.9883L10.3994 22.9433C9.59168 22.8445 8.91308 22.2945 8.6477 21.5209L8.31456 20.5505C8.20129 20.2204 7.94556 19.9585 7.6233 19.8289L7.59383 19.8171C7.28285 19.6922 6.92784 19.7015 6.62358 19.8429L5.68888 20.277C4.95254 20.619 4.07926 20.5068 3.45427 19.9938L3.1757 19.7651C2.42346 19.1476 2.13084 18.1282 2.43747 17.1977L2.74895 16.2522C2.85348 15.9354 2.82506 15.589 2.67066 15.302L2.65534 15.2737C2.50087 15.0009 2.2347 14.8019 1.92357 14.7253L0.953458 14.4863C0.113287 14.2793 -0.499734 13.5393 -0.499023 12.673V12.3271C-0.499734 11.4608 0.113287 10.7208 0.953458 10.5138L1.92357 10.2748C2.2347 10.1982 2.50087 9.99923 2.65534 9.72643L2.67066 9.69809C2.82506 9.41106 2.85348 9.06468 2.74895 8.74788L2.43747 7.80237C2.13084 6.87189 2.42346 5.85253 3.1757 5.23494L3.45427 5.00631C4.07926 4.4933 4.95254 4.38109 5.68888 4.72307L6.62358 5.15715C6.92784 5.29854 7.28285 5.30792 7.59383 5.18301L7.6233 5.17119C7.94556 5.04158 8.20129 4.77969 8.31456 4.44961L8.6477 3.47914C8.91308 2.70557 9.59168 2.15561 10.3994 2.05678L10.7673 2.01176ZM12 3.99996C11.8024 3.99996 11.6067 4.01132 11.4138 4.03367L11.046 4.07869C10.9474 4.09074 10.8643 4.16064 10.8359 4.25476L10.5027 5.22523C10.2285 6.02507 9.61792 6.66539 8.83268 6.98123L8.80321 6.99305C8.03148 7.30268 7.16303 7.27736 6.41049 6.92767L5.47579 6.49359C5.38854 6.45312 5.2858 6.4724 5.21853 6.54165L4.93996 6.77028C4.88209 6.8175 4.86095 6.89651 4.88635 6.96642L5.19783 7.91193C5.4607 8.70921 5.38591 9.5826 4.99121 10.3122L4.97589 10.3405C4.58813 11.0574 3.91761 11.5881 3.12907 11.7823L2.159 12.0213C2.06753 12.0439 2.00019 12.1261 2.00019 12.22V12.78C2.00019 12.874 2.06753 12.9562 2.159 12.9788L3.12907 13.2178C3.91761 13.412 4.58813 13.9427 4.97589 14.6596L4.99121 14.6879C5.38591 15.4175 5.4607 16.2909 5.19783 17.0882L4.88635 18.0337C4.86095 18.1036 4.88209 18.1826 4.93996 18.2298L5.21853 18.4584C5.2858 18.5277 5.38854 18.547 5.47579 18.5065L6.41049 18.0724C7.16303 17.7227 8.03148 17.6974 8.80321 18.007L8.83268 18.0189C9.61792 18.3347 10.2285 18.975 10.5027 19.7749L10.8359 20.7453C10.8643 20.8395 10.9474 20.9094 11.046 20.9214L11.4138 20.9664C11.6067 20.9888 11.8024 21.0001 12 21.0001C12.1977 21.0001 12.3934 20.9888 12.5863 20.9664L12.954 20.9214C13.0527 20.9094 13.1357 20.8395 13.1642 20.7453L13.4973 19.7749C13.7716 18.975 14.3821 18.3347 15.1674 18.0189L15.1968 18.007C15.9686 17.6974 16.837 17.7227 17.5896 18.0724L18.5243 18.5065C18.6115 18.547 18.7143 18.5277 18.7815 18.4584L19.0601 18.2298C19.118 18.1826 19.1391 18.1036 19.1137 18.0337L18.8022 17.0882C18.5394 16.2909 18.6142 15.4175 19.0089 14.6879L19.0242 14.6596C19.4119 13.9427 20.0825 13.412 20.871 13.2178L21.8411 12.9788C21.9325 12.9562 21.9999 12.874 21.9999 12.78V12.22C21.9999 12.1261 21.9325 12.0439 21.8411 12.0213L20.871 11.7823C20.0825 11.5881 19.4119 11.0574 19.0242 10.3405L19.0089 10.3122C18.6142 9.5826 18.5394 8.70921 18.8022 7.91193L19.1137 6.96642C19.1391 6.89651 19.118 6.8175 19.0601 6.77028L18.7815 6.54165C18.7143 6.4724 18.6115 6.45312 18.5243 6.49359L17.5896 6.92767C16.837 7.27736 15.9686 7.30268 15.1968 6.99305L15.1674 6.98123C14.3821 6.66539 13.7716 6.02507 13.4973 5.22523L13.1642 4.25476C13.1357 4.16064 13.0527 4.09074 12.954 4.07869L12.5863 4.03367C12.3934 4.01132 12.1977 3.99996 12 3.99996Z" fill="currentColor"></path></svg>`,
  perfil: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
  admin: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C9.23858 2 7 4.23858 7 7V10H6C4.89543 10 4 10.8954 4 12V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V12C20 10.8954 19.1046 10 18 10H17V7C17 4.23858 14.7614 2 12 2ZM15 10V7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V10H15ZM6 12H18V20H6V12ZM12 14C11.4477 14 11 14.4477 11 15V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V15C13 14.4477 12.5523 14 12 14Z" fill="currentColor"></path></svg>`,
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, SidebarWidgetComponent],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  public readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================================
  // MENÚ PRINCIPAL - Módulos de CERMONT
  // =====================================================
  navItems: NavItem[] = [
    {
      icon: ICONS.dashboard,
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: ICONS.ordenes,
      name: 'Órdenes de Trabajo',
      path: '/dashboard/orders',
    },
    {
      icon: ICONS.perfil,
      name: 'Mi Perfil',
      path: '/dashboard/perfil',
    },
  ];

  // =====================================================
  // SECCIÓN OTHERS - Administración
  // =====================================================
  othersItems: NavItem[] = [
    {
      icon: ICONS.admin,
      name: 'Administración',
      path: '/admin',
    },
  ];

  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  // readonly isExpanded$: Observable<boolean>; // Removed
  // readonly isMobileOpen$: Observable<boolean>; // Removed
  // readonly isHovered$: Observable<boolean>; // Removed

  private subscription: Subscription = new Subscription();

  constructor() {
    // Register effect for UI updates if needed (Angular Signals auto-update template, but keeping logic for CDR if OnPush)
    // Actually, Default change detection works, but if we need manual trigger:
    /*
    effect(() => {
      const expanded = this.sidebarService.isExpanded();
      const mobile = this.sidebarService.isMobileOpen();
      const hovered = this.sidebarService.isHovered();
      if (!expanded && !mobile && !hovered) {
        // logic
      }
    });
    */
  }

  ngOnInit() {
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async onSidebarMouseEnter(): Promise<void> {
    const expanded = this.sidebarService.isExpanded();
    if (!expanded) {
      this.sidebarService.setHovered(true);
    }
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (currentUrl === subItem.path || currentUrl.startsWith(subItem.path + '/')) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        }
      });
    });
  }

  async onSubmenuClick(): Promise<void> {
    const isMobile = this.sidebarService.isMobileOpen();
    if (isMobile) {
      this.sidebarService.setMobileOpen(false);
    }
  }
}
