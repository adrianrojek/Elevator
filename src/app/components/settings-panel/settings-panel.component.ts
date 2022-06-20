import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {Floor} from "../../models/Floor";
import {QueueRecord} from "../../models/QueueRecord";

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css']
})
export class SettingsPanelComponent implements OnInit {
  @Input() floors : Floor[] = [];
  @Input() currentDestinations : number[] = [];
  @Input() queue : QueueRecord[] = [];
  @Input() actualPosition : number = 0;
  @Input() notice: string = "";
  @Input() actualDirection: "UP"|"DOWN"|null = null;
  elevatorLimit : number = 5;

  constructor() { }

  ngOnInit(): void {
  }

  //PRIDAVANIE POSCHODIA
  addFloor() {
    if (this.floors.length == 0){
      this.floors.push({
        isActive: true,
        id: this.floors.length,
        isCalledHere: false
      })
    }else{
      this.floors.push({
        isActive: false,
        id: this.floors.length,
        isCalledHere: false
      })
    }
  }
  //VYMAZANIE POSCHODIA
  deleteFloor() {
    this.floors.pop();
  }
}
