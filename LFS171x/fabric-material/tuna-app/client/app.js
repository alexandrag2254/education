'use strict';
var app = angular.module('application', []);

//controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	
	$scope.queryAllTuna = function(){

		appFactory.queryAllTuna(function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				data[i].Record.id = i+1;
				array.push(data[i].Record);
			}
			$scope.all_tuna = array;
			console.log($scope.all_tuna)
		});

	}

	$scope.queryTuna = function(){

		var id = $scope.tuna_id;

		appFactory.queryTuna(id, function(data){
			console.log(data)
			$scope.query_tuna = data;
		});
	}

	$scope.recordTuna = function(){

		var tuna = $scope.tuna.id + "-" + $scope.tuna.holder + "-" + $scope.tuna.vessel + "-" + $scope.tuna.time + "-" + $scope.tuna.location

		appFactory.recordTuna(tuna, function(data){
			console.log(data)
			$scope.create_tuna = data;
			$("#success_create").show();
		});
	}

	$scope.changeHolder = function(){

		var holder = $scope.holder.id + "-" + $scope.holder.name;

		appFactory.changeHolder(holder, function(data){
			$scope.change_holder = data;
			$("#success_holder").show();
		});
	}


});



app.factory('appFactory', function($http){
	
	var factory = {};

    factory.queryAllTuna = function(callback){

    	$http.get('/all_tuna/').success(function(output){
			callback(output)
		});
	}

	factory.queryTuna = function(id, callback){
    	$http.get('/query_tuna/'+id).success(function(output){
			callback(output)
		});
	}

	factory.recordTuna = function(tuna, callback){
    	$http.get('/record_tuna/'+tuna).success(function(output){
			callback(output)
		});
	}

	factory.changeHolder = function(holder, callback){
    	$http.get('/change_holder/'+holder).success(function(output){
			callback(output)
		});
	}

	return factory;
});


