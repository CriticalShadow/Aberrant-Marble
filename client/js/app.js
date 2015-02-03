// (function() {
//     'use strict';
//     angular
//         .module('languageApp')
//         .config(config);

//     function config ($stateProvider, $urlRouterProvider) {
//       $urlRouterProvider.otherwise("/home");
//       $stateProvider
//         .state('home', {
//           url: '/',
//           templateUrl: '../index.html'
//           controller: 'selectLanguageController'
//         })
//         .state('signup', {
//           url: '/signup',
//           templateUrl: '../signup.html'
//         })
//         .state('signin', {
//           url: '/signin',
//           templateUrl: '../signin.html'
//         });
//     }
// })();

angular.module('languageApp', ['translateModule', 'ngFx'])

.controller('selectLanguageController', function($scope, $http, Translate) {
  $scope.languages = [['English','us'],['Chinese','cn'],['Spanish','es'],['French','fr'],['Italian','it']];
  $scope.language = {};

  $scope.showChatApp = false;
  $scope.msg = '';
  $scope.convo = '';
  $scope.waiting=false;

  $scope.submitLanguages = function(languageSelections){
    return $http({
      method: 'GET',
      url: '/api/getroom',
      params: languageSelections
    })
    .success(function(data){
      $scope.comm = new Icecomm('IbQqKDNCGQS7b94Mllk/iHOJbeSe/UrJJy6l1BbqEbP0fKaK');

      $scope.comm.connect(data);

      $scope.comm.on('local', function(options) {
        console.log(options.stream);
        $('#localVideo').attr("src", options.stream);
      });

      $scope.comm.on('connected', function(options) {

        $scope.waiting = false;
        var foreignVidDiv = $('<div class="inline"></div>');
        foreignVidDiv.append(options.video)
        foreignVidDiv.children().addClass('foreignVideo');
        $('#videos').prepend(foreignVidDiv);
        // document.getElementById('videos').insertBefore(document.createElement("$BUTTON")options.video, document.getElementById('myVideo'));
        $scope.$apply(function() { 
          $scope.showChatApp = true; 
        });
      });

      $scope.comm.on('data', function(options) {
        $scope.$apply(function(){
          Translate.translateMsg(options.data, $scope.language.native, $scope.language.desired)
          .then(function(translatedMsg){
            console.log(translatedMsg);
            var translatedText = translatedMsg.data.translations[0].translatedText
            $scope.convo += 'Them: ' + options.data + '\n';
            $scope.convo += 'Them (translated): ' + translatedText + '\n';
            $scope.scrollBottom();
          })
        });
      })

      $scope.comm.on('disconnect', function(options) {
        document.getElementById(options.callerID).remove();
        $scope.$apply(function() {
          $scope.showChatApp = false;
        });
      });
    })
  }

  $scope.sendMsg = function(){
    if($scope.msg.trim() !== '') {
      $scope.comm.send($scope.msg);
      $scope.convo += 'You: ' + $scope.msg + '\n';
      $scope.msg = ''
      $scope.scrollBottom();
      document.getElementById('chatMsg').focus();
    }
  }

  $scope.handleKeyPress = function(event){
    if(event.which === 13) {
      $scope.sendMsg();
    }
  }

  $scope.scrollBottom = function(){
    var chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
  }
})

angular.module('translateModule', [])

.factory('Translate', function($http){

  // Values are the language codes for Google Translate
  var languageDict = {
    English: 'en',
    Chinese: 'zh-CN',
    Spanish: 'es',
    French: 'fr',
    Italian: 'it'
  };

  // Function that makes an http request to google translate
  // with the string to translate (msg) and the language to translate to (targetLang).
  // Returns a JSON object containing the results from google
  //
  // Note: sourceLang specifies the source language of msg and is not required by Google Translate
  // When sourceLang is not passed to Google Translate, Google will auto-detect the language
  // of the string to translate
  var translateMsg = function(msg, targetLang, sourceLang){
    return $http({
      method: 'GET',
      url: 'https://www.googleapis.com/language/translate/v2',
      params: {
        key: 'AIzaSyBC5v0BqpuJz6g3roho0JUkwzAX0PoR2Dk',
        target: languageDict[targetLang],
        // source: languageDict[sourceLang],
        q: msg
      }
    })
    .then(function(res){
      return res.data;
    })
  }

  return {
    translateMsg: translateMsg
  };
})