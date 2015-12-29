angular.module('chaffMon', ['timer']).controller('mainController', ['$scope', '$http', '$timeout', function mainController($scope, $http, $timeout) {
  var getData = function() {
     $http.get('/api/current-session').success(function(data) {
      $scope.session = data;
      if (!$scope.ontime) {
        if (data.sites == 0) {
          $scope.$broadcast('timer-reset');
          $scope.$broadcast('timer-stop');
        } else {
          $scope.ontime = data.start;
          console.log('On-Time: '+$scope.ontime);
          $scope.init = 1;
        }
        $scope.timerStatus = "label-default";
      } else if ($scope.init) {
        $scope.$broadcast('timer-reset');
        $scope.$broadcast('timer-start');
        $scope.timerStatus = "label-success";
      }
     
      $http.get('/api/chaff-sites').success(function(data) {
        $scope.sites = data;

        $http.get('/api/chaff-status').success(function(data) { 
          if (data.power == "on") {
            $scope.powerStatus = "btn-success";
          } else if (data.power == "off") {
            $scope.powerStatus = "btn-danger";
          } else {
            $scope.powerStatus = "btn-warning";
          }

          $timeout(getData, 1000);
        });
      });
    }).error(function(data) {
      console.log('Get Session Error: ' + data);
      $scope.$broadcast('timer-stop');
      $scope.timerStatus = "label-warning";
    });
  };

  $scope.powerToggle = function() {
    var newStatus;
    if ($scope.powerStatus == "btn-success") {
      newStatus = "off"; 
    } else {
      newStatus = "on";
    }

    $http.post('/api/chaff-status', {power: newStatus});
  }

  getData();
}]);
