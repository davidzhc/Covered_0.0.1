angular.module('Covered.controllers', [])

.controller('AccountController', ["AccountService", "$state", "$rootScope", "$ionicLoading", "$ionicPopup", "socialProvider", function(AccountService, $state, $rootScope, $ionicLoading, $ionicPopup, socialProvider) {

  var errorHandler = function(options) {
    var errorAlert = $ionicPopup.alert({
      title: options.title,
      okType : 'button-assertive',
      okText : "Try Again"
    });
  }

  var vm = this;

  vm.login = function() {
    Stamplay.User.socialLogin(socialProvider)
  }

  vm.logout = function() {
    $ionicLoading.show();
    var jwt = window.location.origin + "-jwt";
    window.localStorage.removeItem(jwt);
    AccountService.currentUser()
    .then(function(user) {
      $rootScope.user = user;
      $ionicLoading.hide();
    }, function(error) {
      console.error(error);
      $ionicLoading.hide();
    })
    Stamplay.User.logout("x-stamplay-jwt");
  }

}])

.controller('HomeController', ["TaskService", "$ionicLoading", "$rootScope", "$state", "$scope","$http", function(TaskService,  $ionicLoading, $rootScope, $state, $scope, $http) {
  'nginject';
  var vm = this;

  var findIndex = function(id) {
    return vm.tasks.map(function(task) {
      return task._id;
    }).indexOf(id);
  }

  // Display loading indicator
  $ionicLoading.show();

  vm.setActive = function(id) {
    vm.active = id;
  }

  function removeActive() {

  }

  // Fetch Tasks
  vm.fetch = function() {
    if(!$rootScope.user) {
      // Get all tasks for guests.
      TaskService.getGuestTasks()
      .then(
        function(response) {
          var tasks = response.data;
          vm.tasks = [];
          tasks.forEach(function(item, idx, array) {
            item.dt_create = new Date(item.dt_create).getTime();
            vm.tasks.push(array[idx]);
          });
          $ionicLoading.hide();
        }, function(error) {
          $ionicLoading.hide();
        })
      } else {
        // Get only the user signed in tasks.
        TaskService.getUsersTasks()
        .then(
          function(response) {
            var tasks = response.data;
            vm.tasks = [];
            tasks.forEach(function(item, idx, array) {
              item.dt_create = new Date(item.dt_create).getTime();
              vm.tasks.push(array[idx]);
            });
            $ionicLoading.hide();
          }, function(error) {
            $ionicLoading.hide();
          })
        }
      }

      // Mark Complete a task.
      vm.deleteTask = function(id) {
        $ionicLoading.show();
        vm.tasks.splice(findIndex(id), 1);
        TaskService.deleteTask(id)
        .then(function() {
          $ionicLoading.hide();
        }, function(error) {
          $ionicLoading.hide();
        })
      }

      vm.setStatus = function(task) {
        task.complete = task.complete ? !task.complete : true;
        TaskService.patchTask(task)
        .then(function(task) {
        }, function(error) {
        })
      }


      vm.deleteMongo = function (deletemsg) {
        console.log(deletemsg);
        var id;
        var obj = Stamplay.User.currentUser().then(function(res) {
          id = JSON.stringify(res.user._id);
          $http.post('http://104.131.152.9:5000/api/delete', {key: id,DeleteMsg: deletemsg});
        });
      }

    }])

.controller('TaskController', ["TaskService", "$ionicLoading", "$rootScope", "$state", "$stateParams","$http","$scope", function(TaskService,  $ionicLoading, $rootScope, $state, $stateParams, $http, $scope) {
  'nginject';
  var vm = this;

  if($stateParams.id) {
    $ionicLoading.show();
    TaskService.getTask($stateParams.id)
      .then(function(task) {
        $ionicLoading.hide();
        vm.task = task.data[0];
      }, function(err) {
        $ionicLoading.hide();
        console.error(err);
      })
  }

  // Add a task.
  vm.add = function() {
    $ionicLoading.show();
    TaskService.addNew(vm.task)
    .then(function(task) {
      $ionicLoading.hide();
      $state.go("tasks", {}, { reload: true });
    }, function(error) {
      $ionicLoading.hide();
    })
  }

  vm.save = function() {
    $ionicLoading.show();
    TaskService.updateTask(vm.task)
    .then(function(task) {
      $ionicLoading.hide();
      $state.go("tasks", {}, { reload: true });
    }, function(error) {
      $ionicLoading.hide();
    })

  }

  $scope.editMongo = function (editmsg) {
    var oldbody;
    var newbody;
    $ionicLoading.show();

    TaskService.getTask($stateParams.id).then(function(task) {
      oldbody = JSON.stringify(task.data[0].body);
      newbody = JSON.stringify(vm.task.body);
      var obj = Stamplay.User.currentUser().then(function(res) {
        var id = JSON.stringify(res.user._id);
        $http.post('http://104.131.152.9:5000/api/edit', {key: id, EditMsg: newbody, oldmsg: oldbody});
        $ionicLoading.hide();
      });
    }, function(error) {
      $ionicLoading.hide();
    })
  }

  $scope.isVisible = true;
  $scope.progbar = false;
  $scope.progmsg = true;
  $scope.totalButton = false;

  $scope.analyseMongo = function () {
    var body;
    $ionicLoading.show();
    TaskService.getTask($stateParams.id).then(function(task) {
      body = JSON.stringify(task.data[0].body);
      $http.post('http://104.131.152.9:5000/api/analysis', {msg: body})
        .then(function(res) {
          $scope.messages = res.data.msg;
          $scope.posArray = res.data.values;

          $scope.progmsg = false;
          $scope.progbar = true;
          $scope.isVisible = false;
          $scope.totalButton = true;
          $ionicLoading.hide();
        })
    })
  }

  $scope.setbackground = function (value) {
    var color;
        if (value <= 5) {
            color = {"background-color": "#ff3300"}
        }
        else if (value > 5 && value <= 10) {
            color = {"background-color": "#ff471a"}
        }
        else if (value > 10 && value <= 15) {
            color = {"background-color": "#ff5c33"}
        }
        else if (value > 15 && value <= 20) {
            color = {"background-color": "#ff704d"}
        }
        else if (value > 20 && value <= 25) {
            color = {"background-color": "#ff8566"}
        }
        else if (value > 25 && value <= 30) {
            color = {"background-color": "#ff9980"}
        }
        else if (value > 30 && value <= 35) {
            color = {"background-color": "#ffad99"}
        }
        else if (value > 35 && value <= 40) {
            color = {"background-color": "#ffc2b3"}
        }
        else if (value > 40 && value <= 60) {
            color = {"background-color": "#ffffff"}
        }
        else if (value > 60 && value <= 65) {
            color = {"background-color": "#80ff80"}
        }
        else if (value > 65 && value <= 70) {
            color = {"background-color": "#66ff66"}
        }
        else if (value > 70 && value <= 75) {
            color = {"background-color": "#4dff4d"}
        }
        else if (value > 75 && value <= 80) {
            color = {"background-color": "#33ff33"}
        }
        else if (value > 80 && value <= 85) {
            color = {"background-color": "#1aff1a"}
        }
        else if (value > 85 && value <= 90) {
            color = {"background-color": "#00ff00"}
        }
        else if (value > 90 && value <= 95) {
            color = {"background-color": "#00e600"}
        }
        else {
            color = {"background-color": "#00cc00"}
        }

    return color;
    }

  $scope.addMongo = function() {
    var id;
    var textbox = JSON.stringify(this.taskbody);
    var obj = Stamplay.User.currentUser()
      .then(function(res){
        id = JSON.stringify(res.user._id);
        $http.post('http://104.131.152.9:5000/api/message', {key: id, msg: textbox});
      });
  }

  //Progress bar stuff
  $scope.max = 200;

  $scope.setBarRGB = function(percentage) {
    var value = Math.round(percentage * 100);
    var type;

    if (value < 45) {
      type = 'danger';
    } else if (value >= 45 && value <= 55) {
      type = 'info';
    } else if (value > 55) {
      type = 'success';
    }

    $scope.dynamic = value;
    $scope.type = type;
    $scope.number = value + "%";
  };

  $scope.setTotal = function(values) {
    var sum = 0;
    for(var i = 0; i < values.length; i++) {
      sum = sum + values[i]*100;
    }

    sum = Math.round(sum / values.length);

    if (sum < 45) {
      type = 'danger';
    } else if (sum >= 45 && sum <= 55) {
      type = 'info';
    } else if (sum > 55) {
      type = 'success';
    }

    $scope.dynamic = sum;
    $scope.type = type;
    $scope.number = sum + "%";
  };

}])
