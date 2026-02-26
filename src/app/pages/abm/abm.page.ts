import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.page.html',
  styleUrls: ['./abm.page.scss'],
})
export class AbmPage implements OnInit {

  constructor(
    private router: Router,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }
}
