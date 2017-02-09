

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
    return Tasks.find({$and: [{tipo: "Fruteria"}, { checked: { $ne: true } }]}).count();
  },
  countPanaderia () {
    return Tasks.find({$and: [{tipo: "Panaderia"}, { checked: { $ne: true } }]}).count();
  },
  countSuper () {
    return Tasks.find({$and: [{tipo: "Super"}, { checked: { $ne: true } }]}).count();
  },
  countCongelados () {
    return Tasks.find({$and: [{tipo: "Congelados"}, { checked: { $ne: true } }]}).count();
  },
  countOtros () {
    return Tasks.find({$and: [{tipo: "Otros"}, { checked: { $ne: true } }]}).count();
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
