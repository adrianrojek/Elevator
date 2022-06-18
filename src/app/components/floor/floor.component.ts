import { Component, OnInit } from '@angular/core';
import {Floor} from "../../models/Floor";
import {QueueRecord} from "../../models/QueueRecord";

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css']
})
export class FloorComponent implements OnInit {
  public floors: Floor[] = [];
  public callQueue: QueueRecord[] = [];
  public actualDestinations: number[] = [];
  actualPosition: number = 0;
  actualDirection: "UP"|"DOWN" = "UP";



  constructor() { }

  ngOnInit(): void {
  }

  addFloor() {
    if (this.floors.length == 0){
      this.floors.push({
        isActive: true,
        id: this.floors.length,
      })
    }else{
      this.floors.push({
        isActive: false,
        id: this.floors.length,
      })
    }
  }

  deleteFloor() {
    this.floors.pop();
  }

  delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async moveOneFloor(direction : "UP"|"DOWN"){
    if(direction === "UP"){
      this.floors[this.actualPosition].isActive = false;
      this.floors[this.actualPosition + 1].isActive = true;
    }else{
      this.floors[this.actualPosition].isActive = false;
      this.floors[this.actualPosition - 1].isActive = true;
    }
  }

  async callElevator(floor:number,direction : "UP"|"DOWN") {
    this.callQueue.push({
      floorNumber: floor,
      direction: direction
    });
    if(this.actualDestinations.length == 0){
      if (this.floors[this.actualPosition].isActive) {
        let currentDestination : QueueRecord = <QueueRecord>this.callQueue.pop();
        if(currentDestination.floorNumber > this.actualPosition ){
          while (this.actualPosition != currentDestination.floorNumber) {
            this.moveOneFloor("UP");
            this.actualPosition++;
            await this.delay(2500);
          }
        }else{
          while (currentDestination.floorNumber != this.actualPosition ) {
            this.moveOneFloor("DOWN");
            this.actualPosition--;
            await this.delay(2500);
          }
        }
      }
      console.log(this.floors);
    }
  }

  async destinationChosen(id: number) {
    this.actualDestinations.push(id);
    while(this.actualDestinations.length!=0){
      if (id < this.actualPosition){
        while (this.actualPosition != Math.min(...this.actualDestinations) && this.actualDestinations.length!=0){
          this.moveOneFloor("DOWN");
          this.actualPosition--;
          await this.delay(4500);
          for (let i = 0; i < this.callQueue.length; i++) {
            console.log(this.callQueue[i]);
            if(this.callQueue[i].direction === "DOWN" && this.callQueue[i].floorNumber == this.actualPosition){
              this.callQueue.splice(i,1);
              return;
            }
          }
          for (let i = 0; i < this.actualDestinations.length; i++) {
            if(this.actualDestinations[i] == this.actualPosition){
              this.actualDestinations.splice(i,1);
            }
          }
        }
      }else if (id > this.actualPosition){
        while (this.actualPosition != Math.max(...this.actualDestinations) && this.actualDestinations.length!=0){
          this.moveOneFloor("UP");
          this.actualPosition++;
          await this.delay(4500);
          for (let i = 0; i < this.callQueue.length; i++) {
            console.log(this.callQueue[i]);
            if(this.callQueue[i].direction === "UP" && this.callQueue[i].floorNumber == this.actualPosition){
              this.callQueue.splice(i,1);
              return;
            }
          }
          for (let i = 0; i < this.actualDestinations.length; i++) {
            if(this.actualDestinations[i] == this.actualPosition){
              this.actualDestinations.splice(i,1);
            }
          }
        }
      }
      if (this.callQueue.length != 0){
        const nextPassenger: QueueRecord = <QueueRecord> this.callQueue.pop();
        this.callElevator(nextPassenger.floorNumber, nextPassenger.direction);
      }
    }
  }
}
