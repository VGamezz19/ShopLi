

import { Tasks } from '../api/tasks.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import './task.js';
import './body.html';


Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});

Template.body.helpers({
  tasks() {

    //console.log(Meteor.userId());
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    /*if (!Meteor.userId()) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    } */

    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count(); //return del numero de tareas que hay en la base de datos
  },
  countFruteria () {
    return Tasks.find({tipo: "Frutería"}).count();
  },
  countPanaderia () {
    return Tasks.find({tipo: "Panaderia"}).count();
  },
  countSuper () {
    return Tasks.find({tipo: "Súper"}).count();
  },
  countCongelados () {
    return Tasks.find({tipo: "Congelados"}).count();
  },
  countOtros () {
    return Tasks.find({tipo: "Otros"}).count();
  },
});

Template.body.events({  //insercion de datos en Mongo.
  'submit .new-list'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Insertamos los valores recogidos en task.html
    const target = event.target;
    const text = target.producto.value;
    const number = target.cantidad.value;
    const select = target.tipo.value;

  // Insert a task into the collection
  Meteor.call('tasks.insert', text, number, select);

  // Clear form
  target.producto.value = '';
  target.cantidad.value = '';
},

'change .hide-completed input'(event, instance) {
  instance.state.set('hideCompleted', event.target.checked);
},
});
