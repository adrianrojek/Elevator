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
  elevatorLimit: number = 5;
  peopleCount: number = 1;
  notice: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  //POHYB O JEDNO POSCHODIE HORE ALEBO DOLE
  async moveOneFloor(direction : "UP"|"DOWN"){
    if(direction === "UP"){
      this.floors[this.actualPosition].isActive = false;
      this.floors[this.actualPosition + 1].isActive = true;
    }else{
      this.floors[this.actualPosition].isActive = false;
      this.floors[this.actualPosition - 1].isActive = true;
    }
  }

  //PRIVOLANIE VYTAHU
  async callElevator(floor:number,direction : "UP"|"DOWN") {
    let serverProposal = this.callQueue.find( (p) => p.floorNumber == floor && p.direction == direction);
    //ZAZNAM SA DO QUEUE PRIDA LEN VTEDY AK SA TAM ROVNAKY ZAZNAM UZ NENACHADZA
    if(serverProposal===undefined){
      this.callQueue.push({
        floorNumber: floor,
        direction: direction
      });
    }
    //IF KTORY ZISTUJE CI VYTAH PRAVE NIE JE V POHYBE
    if(this.actualDestinations.length == 0 && !this.isOccupied){
      this.actualDirection = direction;
      this.isOccupied = true;
      //KONTROLA POZICIE VYTAHU
      if (this.floors[this.actualPosition].isActive) {
        let currentDestination : QueueRecord = <QueueRecord>this.callQueue.shift();
        this.floors[currentDestination.floorNumber].isCalledHere = true;
        //IF KTORY ZISTUJE CI VYTAH POJDE SMEROM HORE ALEBO DOLE
        if(currentDestination.floorNumber > this.actualPosition ){
          while (this.actualPosition != currentDestination.floorNumber) {
            this.moveOneFloor("UP");
            this.actualPosition++;
            await this.delay(5000);
          }
        }else{
          while (currentDestination.floorNumber != this.actualPosition ) {
            this.moveOneFloor("DOWN");
            this.actualPosition--;
            await this.delay(5000);
          }
        }
      }
    }
  }

  //VYBRATIE CIELOVEHO POSCHODIA
  async destinationChosen(id: number) {
    //KONTROLA KAPACITY VYTAHU
    if ((this.actualDestinations.length + this.peopleCount) <= this.elevatorLimit){
      this.floors[this.actualPosition].isCalledHere = false;
      for (let i=0;i<this.peopleCount;i++){
        this.actualDestinations.push(id);
      }
      //KYM NIEJE VYTAH PRAZDNY
      while(this.actualDestinations.length!=0){
        //ZISTOVANIE SMERU KTORYM POJDE VYTAH
        if (id < this.actualPosition){
          //KYM SA VYTAH NEDOSTANE NA MINIMUM Z POLA CIELOV KEDZE IDE SMEROM DOLE
          while (this.actualPosition != Math.min(...this.actualDestinations) && this.actualDestinations.length!=0){
            await this.delay(5000);
            this.moveOneFloor("DOWN");
            this.actualPosition--;
            //KONTROLA CI NIEKTO VYSTUPUJE NA DANOM POSCHODI
            this.actualDestinations = this.actualDestinations.filter(destination => destination != this.actualPosition);
            for (let i = 0; i < this.callQueue.length; i++) {
              //KONTROLA CI NIEKTO NECHCE IST VYTAHOM V SMERE JAZDY
              if(this.callQueue[i].direction === "DOWN" && this.callQueue[i].floorNumber == this.actualPosition){
                this.floors[this.actualPosition].isCalledHere = true;
                this.callQueue.splice(i,1);
                return;
              }
            }
          }
          //DUPLICITNY KOD PRE SMER HORE
        }else if (id > this.actualPosition){
          while (this.actualPosition != Math.max(...this.actualDestinations) && this.actualDestinations.length!=0){
            await this.delay(5000);
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
        //KED BOL VYTAH ESTE NIEKDE PRIVOLANY IDE PO PASAZIERA, KTORY JE V PORADI
        if (this.callQueue.length != 0){
          this.isOccupied = false;
          await this.delay(5000);
          const nextPassenger: QueueRecord = <QueueRecord> this.callQueue.pop();
          this.actualDirection = nextPassenger.direction;
          this.callElevator(nextPassenger.floorNumber, nextPassenger.direction);
        }else{
          this.actualDirection = null;
        }
      }
      this.isOccupied = false;
    }else{
      this.notice = 'NOT ENOUGH SPACE IN THE ELEVATOR';
      await this.delay(2500);
      this.notice = 'FREE SPOTS:'+(this.elevatorLimit-this.actualDestinations.length).toString();
      await this.delay(2500);
      this.notice = '';
    }
    }

}
