import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { ReactiveDict } from 'meteor/reactive-dict';
export const Tasks = new Mongo.Collection('tasks');

// Start Route
//insert package with this comand --> meteor add iron:router
//Main Rute template
Router.configure({
    layoutTemplate: 'main'
});
Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/lista', {
    name: 'lista',
    template: 'lista'
});

//route with params
Router.route('/lista/:_id', {
    template: 'listaPage',
    data: function(){

    //We save data of parameter (in this case "_id")
    var tipProduct = this.params._id;

    //We have to define new state for work with the states of the template
    Template.listaPage.onCreated(function bodyOnCreated() {
      this.state = new ReactiveDict();
      Meteor.subscribe('tasks'); //we add template 'tasks' becouse states will be will be done in this
    })

    //helpers function helps us to start the template with some initial data
    Template.listaPage.helpers({
      //In this case, We send this 2 functions.

      //First taskList(): This function return a find querys in format JSON
      //this means that we can treat the data as an object
      tasksList() {
        const instance = Template.instance();

        //this condition are state the template "tasks" (we define before (ReactiveDict))
        //hideCompleted is a checkBox defined in Template "tasks"
        if (instance.state.get('hideCompleted')) {
          return Tasks.find({$and: [{tipo:tipProduct}, {checked: { $ne: true }}]}, { sort: { createdAt: -1 } });
        } else {

          return Tasks.find({tipo:tipProduct}, { sort: { createdAt: -1 } });
        }
      //  console.log(Tasks.find({}, { sort: { createdAt: -1 } }));

      },

      //Second function return type product (the same of params route)
      //This function we will use to fill title template
      tipoProducto () {
        return tipProduct;
      },
    })

    //As I said before, function Events() will allow us create states.
    Template.listaPage.events({
      'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
      },
    })

    }
});

//End Route
//--------------------------

//server

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

//We create meteor methods (insert, delete, and more)
Meteor.methods({
  'tasks.insert'(text, number, tipo) {
    check(text, String);

    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      number,
      tipo,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove'(taskId) {
      check(taskId, String);
      const task = Tasks.findOne(taskId);

      //sAlert
      //insert this package with this command --> meteor add juliancwirko:s-alert
      //tutorial --> http://s-alert.meteorapp.com/
      //sAlert implement the tipical Alert JavaScrip with style and movement

      //In this conditional we ask: if this owner task is diferent to ownerId
      //                                or
      //                            if userId = empty
      if (task.owner != this.userId || !this.userId )  {
          if (!this.userId){
            sAlert.warning('Registrate', {position: 'top-left', timeout: 1800});
          }
          // if this owner tas its diferent owner id and user are conectet
          if (task.owner != this.userId && this.userId){
            sAlert.error('No tienes permiso', {position: 'top-left', timeout: 1800});
          }
      //Else, delet this task
      } else {
        Tasks.remove(taskId);
      }

    },
    
    'tasks.addCount'(taskId, number){ //para añadir 1 al contador de cantidad.
      check(taskId, String);
      const task = Tasks.findOne(taskId);
      const numberAdd = number - 1 + 2 ;

      Tasks.update(taskId, { $set: {number: numberAdd} });
    },

    'tasks.deleteCount'(taskId, number){ //para eliminar 1 en el contador de cantidad.
      check(taskId, String);
      const task = Tasks.findOne(taskId);
      const numberDelet = number - 1;

      Tasks.update(taskId, { $set: {number: numberDelet} });
    },

    'tasks.setChecked'(taskId, setChecked) {
      check(taskId, String);
      check(setChecked, Boolean);
      const task = Tasks.findOne(taskId);
      //Funcion de restrigcion de permisos con el parametro private
      //_______________________________________________________________________________________
      if (task.private && task.owner !== this.userId) {
        throw new Meteor.Error('not-authorized'); //error prefedinido de Meteor
      } else {
        Tasks.update (taskId, { $set: { checked: setChecked } });
      }

      //Tasks.update(taskId, { $set: { checked: setChecked } });
    },
    /*
    //funcion para setear una lista de la compra Privada o Publica
    //_______________________________________________________________________________________________
    'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }, */
});
