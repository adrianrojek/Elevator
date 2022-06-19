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
  actualDirection: "UP"|"DOWN"|null = null;
  isOccupied : boolean = false;
  elevatorLimit: number = 4;
  peopleCount: number = 0;

  constructor() { }

  ngOnInit(): void {
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
    if(this.actualDestinations.length == 0 && !this.isOccupied){
      this.actualDirection = direction;
      this.isOccupied = true;
      if (this.floors[this.actualPosition].isActive) {
        let currentDestination : QueueRecord = <QueueRecord>this.callQueue.shift();
        this.floors[currentDestination.floorNumber].isCalledHere = true;
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
    }
  }

  async destinationChosen(id: number) {
    this.floors[this.actualPosition].isCalledHere = false;
    this.actualDestinations.push(id);
    while(this.actualDestinations.length!=0){
      if (id < this.actualPosition){
        while (this.actualPosition != Math.min(...this.actualDestinations) && this.actualDestinations.length!=0){
          await this.delay(4500);
          this.moveOneFloor("DOWN");
          this.actualPosition--;
          this.actualDestinations = this.actualDestinations.filter(destination => destination != this.actualPosition);
          for (let i = 0; i < this.callQueue.length; i++) {
            if(this.callQueue[i].direction === "DOWN" && this.callQueue[i].floorNumber == this.actualPosition){
              this.floors[this.actualPosition].isCalledHere = true;
              this.callQueue.splice(i,1);
              return;
            }
          }
        }
      }else if (id > this.actualPosition){
        while (this.actualPosition != Math.max(...this.actualDestinations) && this.actualDestinations.length!=0){
          await this.delay(4500);
          this.moveOneFloor("UP");
          this.actualPosition++;
          this.actualDestinations = this.actualDestinations.filter(destination => destination != this.actualPosition);
          for (let i = 0; i < this.callQueue.length; i++) {
            if(this.callQueue[i].direction === "UP" && this.callQueue[i].floorNumber == this.actualPosition){
              this.floors[this.actualPosition].isCalledHere = true;
              this.callQueue.splice(i,1);
              return;
            }
          }
        }
      }
      if (this.callQueue.length != 0){
        this.isOccupied = false;
        await this.delay(4500);
        const nextPassenger: QueueRecord = <QueueRecord> this.callQueue.pop();
        this.actualDirection = nextPassenger.direction;
        this.callElevator(nextPassenger.floorNumber, nextPassenger.direction);
      }else{
        this.actualDirection = null;
      }
    }
    this.isOccupied = false;
  }
}
