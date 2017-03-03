import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/lista', {
    name: 'lista',
    template: 'lista'
});
Router.configure({
    layoutTemplate: 'main'
});

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

      //Ejemplos sAler (addon)
      //_____________________________________________________________________________________________________________________________________________
      /*sAlert.error('Boom! Something went wrong!', {effect: 'genie', position: 'bottom-right', timeout: 'none', onRouteClose: false, stack: false, offset: '80px'});
       sAlert.success('Your message', {onClose: function() {console.log('closing alert...');}});
      sAlert.error('Boom! <br> Something went wrong!', {effect: 'your-effect-name-here', html: true}); */

      //Muestra alerts si no tienes permiso para eliminar la lista de la compra
      //_______________________________________________________________________________________________________________--
      //if (no ha creado la lista de la compra || (o) no esta registrado)
      if (task.owner != this.userId || !this.userId )  {
          if (!this.userId){
            sAlert.warning('Registrate', {position: 'top-left', timeout: 1800});
          }
          if (task.owner != this.userId && this.userId){
            sAlert.error('No tienes permiso', {position: 'top-left', timeout: 1800});
          }
      } else { //sino, elimina la lista con esta id (taskId)
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
  },
});
