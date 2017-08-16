import { Component, ViewChild } from '@angular/core';
// import { NavController } from 'ionic-angular';
import { AlertController, Content } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GoogleCloudVisionServiceProvider } from '../../providers/google-cloud-vision-service/google-cloud-vision-service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  items: FirebaseListObservable<any[]>;

  @ViewChild(Content) content: Content

  constructor(
    private camera: Camera,
    private vision: GoogleCloudVisionServiceProvider,
    private db: AngularFireDatabase,
    private alert: AlertController
  ) {}

  ngOnInit() {
    this.items = this.db.list('items');
  }

  ionViewWillEnter() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
        this.content.scrollToBottom(0);
      }, 100);
  }

  deleteEntry(key) {
    let alert = this.alert.create({
      title: 'Delete Item',
      message: 'Are you for sure?',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.db.object('/items/' + key).remove();
          }
        }
      ]
    });
    alert.present();
  }

  saveResults(imageData, results) {
    this.items.push({ imageData: imageData, results: results})
      .then(() => { 
        this.scrollToBottom();
      })
      .catch(err => { this.showAlert(err) });
  }

  showAlert(message) {
    let alert = this.alert.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 500,
      targetWidth: 500,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      this.vision.getLabels(imageData).subscribe((result) => {
        this.saveResults(imageData, result.json().responses);
      }, err => {
        this.showAlert(err);
      });
    }, err => {
      this.showAlert(err);
    });
  }

}
