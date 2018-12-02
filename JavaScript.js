var app = angular.module('apiApp', ['ngMaterial', 'ui.grid']);

app.controller('apiController', function ($scope, $mdDialog, factory) {

    // Initial Data
    $scope.url = "https://jointhecrew.in/api/txns/";
    $scope.update = false;

    // this will fatch all the transaction for  perticular user.
    $scope.go = function (userId,id) {
        console.log(new Date());
        factory.setUrl($scope.url);
        factory.setValue(userId+"/"+id);
        factory.getData().then(function (response) {
            if (id != null) {
                var newObj = {};
                newObj.amount = response.data.amount;
                newObj.txn_date = response.data.txn_date;
                newObj.currency = response.data.currency;
                newObj.id = response.data.id;
                newObj.user = response.data.user;
                $scope.objToDisplay = [];
                $scope.objToDisplay.push(newObj);
            }
            else
                $scope.objToDisplay = response.data;
        });
        console.log($scope.objToDisplay[0]);
        factory.resetData();
    };
    // Add New Note
    $scope.addNote = function () {

        //alert("click");
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            templateUrl: 'addData.html',
        })
    };
    //delete  transaction.
    $scope.removeItem = function removeItem(row)
    {
        factory.setValue(row.user + "/" + row.id);
        factory.setUrl($scope.url);
        factory.deleteData().then(function (response) {
            console.log("data deleted");
            factory.setValue(row.user);
            factory.getData().then(function (response) {
                $scope.objToDisplay = response.data;
            });
        });
        

    };

    // Edit Note
    $scope.EditNotes = function (row) {
        $scope.user = row.user;
        $scope.id = row.id;
        $scope.amount = row.amount;
        $scope.curr = row.currency;
        $scope.update = true;

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            templateUrl: 'addData.html',
        }).then(function () {
            $scope.update = false;
            $scope.user = "";
            $scope.curr = "";
            $scope.amount = "";
        })
    };

    // End Controller
}


);
app.controller('AddNotesController', function ($scope, $mdDialog,factory) {
    $scope.save = function (userName, amount, currency) {
        if ($scope.update == true) {
            var dataUpdate = {}
            dataUpdate.id = $scope.id;
            dataUpdate.user = $scope.user;
            dataUpdate.currency = currency;
            dataUpdate.amount = amount;
            dataUpdate.txn_date = new Date().toISOString().slice(0, 10);
            factory.setValue($scope.user + "/" + $scope.id);
            factory.setUrl($scope.url);
            factory.addData(dataUpdate).then(function (response) {
                console.log(response);
                factory.setValue(dataUpdate.user);
                factory.getData().then(function (response) {
                    $scope.objToDisplay = response.data;
                });
            });
            $scope.update = false;
            $mdDialog.hide();
            $scope.refresh();

        }
        else {
            var newTrans = {};
            newTrans.user = userName;
            newTrans.amount = amount;
            newTrans.currency = currency;
            newTrans.txn_date = new Date().toISOString().slice(0, 10);
            factory.setUrl($scope.url);
            factory.setValue(userName);
            factory.addData(newTrans).then(function (response) {
                console.log(response);
            });
            newTrans = {};
            $mdDialog.hide();
          //  $scope.refresh();
        }
       

    };
    $scope.cancel = function () {
        $mdDialog.hide();
    };
});

app.factory('factory', function ($http, $q) {
    var service = {};
    var _baseUrl = '';
    var _value = '';
    var _finalUrl = '';

    var makeUrl = function () {
        _finalUrl = _baseUrl + _value;
        return _finalUrl;
    }

    service.setUrl = function (url) {
        _baseUrl = url;
    }
    service.setValue = function (value) {
        _value = value;
    }
    service.getData = function () {
        makeUrl();
        return $http.get(_finalUrl);
    }
    service.addData = function (data)
    {
        makeUrl();
        return $http.post(_finalUrl, data);
    }
    service.deleteData = function () {
        makeUrl();
        return $http.delete(_finalUrl);
    }
    service.resetData = function () {
        _baseUrl = "";
        _value = "";

    }

    return service;
});