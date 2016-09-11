angular.module('Covered', ['ionic', 'Covered.controllers', 'Covered.services', 'ui.bootstrap', 'ngAnimate'])

.run(function($ionicPlatform, $rootScope, AccountService) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  AccountService.currentUser()
    .then(function(user) {
      $rootScope.user = user;
    })
})

.constant("socialProvider", "facebook")

.constant('$ionicLoadingConfig', {
  template: "<ion-spinner></ion-spinner>",
  hideOnStateChange : false
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html'
    })
    .state('tasks', {
      cache : false,
      url: '/tasks',
      templateUrl: 'templates/tasks.html',
      controller: "HomeController",
      controllerAs : "task"
    })
    .state('new', {
      url: '/new',
      templateUrl: 'templates/new.html',
      controller: "TaskController",
      controllerAs : "new"
    })
    .state('edit', {
      url: '/task/:id',
      templateUrl: 'templates/edit.html',
      controller: "TaskController",
      controllerAs : "edit"
    })
    .state('analysis', {
      url: '/task/:id',
      templateUrl: 'templates/analysis.html',
      controller: "TaskController",
      controllerAs : "analysis"
    })



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

});
