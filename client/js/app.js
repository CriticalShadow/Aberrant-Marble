
angular.module('languageApp', ['translateModule', 'ngFx', 'ui.router', 'ui.bootstrap'])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'client/home.html',
      controller: 'selectLanguageController'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'client/signup.html',
      controller: 'selectLanguageController'
    })
    .state('signin', {
      url: '/signin',
      templateUrl: 'client/signin.html',
      controller: 'selectLanguageController'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'client/profile.html',
      controller: 'createProfileController'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'client/dashboard.html',
      controller: 'dashboardController'
    });

})

.controller('selectLanguageController', function ($scope, $http, Translate, $window) {
  $scope.languages = [['English','us'],['Chinese','cn'],['Spanish','es'],['French','fr'],['Italian','it']];
  $scope.language = {};
  $scope.native = {lang: '', prof: 'Fluent'};
  $scope.desired = {lang: ''};

  $scope.showChatApp = false;
  $scope.msg = '';
  $scope.convo = '';
  $scope.waiting = false;
  $scope.topics = ['How did you spend your last vacation?', 'Describe your hometown', 'What do you do for a living?', 'What kind of food do you like to eat?', 'Describe your family', 'What do you like to do for fun?', 'Describe your mother', 'Describe your perfect day', 'Where would you like to travel?'];
  $scope.topic = $scope.topics[0];
  $scope.comm = $window.comm;
  $scope.roomId = $window.roomId;
  $scope.myId = $window.myId;

  $scope.$watch($scope.comm, function() {
    $scope.comm = $window.comm;
  });

  if ($scope.comm && $scope.roomId) {
    $scope.comm.connect($scope.roomId);
  }

  // When a chat message is received from the language partner,
  // translate the message using Google Translate and
  // display both the original message and the translated message
  $scope.comm.on('data', function (options) {
    $scope.$apply(function(){
      Translate.translateMsg(options.data, $scope.language.native, $scope.language.desired)//$scope.language.native, $scope.language.desired)
      .then(function (translatedMsg) {
        var translatedText = translatedMsg.data.translations[0].translatedText
        $scope.convo += 'Them: ' + options.data + '\n';
        $scope.convo += 'Them (translated): ' + translatedText + '\n';
        $scope.scrollBottom();
      });
    });
  });

  // When the language partner leaves, remove the video and chatbox
  $scope.comm.on('disconnect', function (options) {
    document.getElementById(options.callerID).remove();
    $scope.$apply(function () {
      $scope.showChatApp = false;
    });
  });

  // Function to send a message to the language partner
  // and display the sent message in the chatbox
  $scope.sendMsg = function () {
    if ($scope.msg.trim() !== '') {
      $scope.comm.send($scope.msg);
      $scope.convo += 'You: ' + $scope.msg + '\n';
      $scope.msg = ''
      $scope.scrollBottom();
      document.getElementById('chatMsg').focus();
    }
  }

  // Function to send a chat message when the enter/return
  // button is pressed
  $scope.handleKeyPress = function (event) {
    if(event.which === 13) {
      $scope.sendMsg();
    }
  }

  // Function to move the scroll bar to the bottom of the textarea
  $scope.scrollBottom = function () {
    var chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = 99999;
  }

  $scope.changeTopic = function () {
    //need to add translation for each client
    $scope.topic = $scope.topics[Math.floor(Math.random() * $scope.topics.length)];
  }

  $scope.connect = function (userId) {
    var socket = io();
    socket.emit('connectionreq', userId);

    socket.on('connecting', function (data) {
      $scope.comm = new Icecomm('aOeyDUCGOSgnxElKI9eHiq9SRh2afLql1l1lDyxzYMYEabvTF6');

      $scope.comm.connect(data);

      // Show video of the user
      $scope.comm.on('local', function (options) {
        $('#localVideo').attr("src", options.stream);
      });

      // When two people are connected, display the video of the language partner
      // and show the chat app
      $scope.comm.on('connected', function (options) {
        var foreignVidDiv = $('<div class="inline"></div>');
        foreignVidDiv.append(options.video)
        foreignVidDiv.children().addClass('foreignVideo');
        $('#videos').prepend(foreignVidDiv);
        $scope.$apply(function () { 
          $scope.showChatApp = true; 
        });
      });

      // When a chat message is received from the language partner,
      // translate the message using Google Translate and
      // display both the original message and the translated message
      $scope.comm.on('data', function (options) {
        $scope.$apply(function(){
          Translate.translateMsg(options.data, $scope.language.native, $scope.language.desired)
          .then(function (translatedMsg) {
            var translatedText = translatedMsg.data.translations[0].translatedText
            $scope.convo += 'Them: ' + options.data + '\n';
            $scope.convo += 'Them (translated): ' + translatedText + '\n';
            $scope.scrollBottom();
          })
        });
      });

      // When the language partner leaves, remove the video and chatbox
      $scope.comm.on('disconnect', function (options) {
        document.getElementById(options.callerID).remove();
        $scope.$apply(function () {
          $scope.showChatApp = false;
        });
        document.getElementById('chatBox').remove();
      });

    });
  }
})

.controller('createProfileController', function ($scope, $http, $location) {
    $scope.languages = [['English','us'],['Chinese','cn'],['Spanish','es'],['French','fr'],['Italian','it']];
    $scope.language = {};
    $scope.native = {lang: '', prof: 'Fluent'};
    $scope.desired = {lang: ''};
    $scope.lastname = '';
    $scope.firstname = '';
    $scope.levels = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'];

    $scope.saveProfile = function () {
      var data = {
        firstName: $scope.firstname,
        lastName: $scope.lastname,
        nativeLangs: $scope.native,
        desiredLangs: $scope.desired
      }
      
      return $http({
        method: 'POST',
        url: '/api/profile',
        data: data
      }).then(function (res) {
        $location.path('/dashboard')
      });
    }
});

angular.module('translateModule', [])

.factory('Translate', function ($http) {

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

.controller('createProfileController', function ($scope, $http, $location) {
  $scope.languages = [{lang: 'English', id: 1}, {lang: 'Chinese', id: 2}, {lang: 'Spanish', id: 3}, {lang: 'French', id: 4}, {lang: 'Italian', id: 5}];
  $scope.native = {};
  $scope.desired = {};
  $scope.lastname = '';
  $scope.firstname = '';

  $scope.saveProfile = function () {
    var data = {};
    data.firstName = $scope.firstname;
    data.lastName = $scope.lastname;
    data.nativeLangs = $scope.native;
    data.desiredLangs = $scope.desired;
    
    return $http({
      method: 'POST',
      url: '/api/profile',
      data: data
    }).then(function (res) {
      $location.url('/');
    });
  }
})

.controller('dashboardController', function ($scope, $http, $location, $log) {

  $scope.online = true;

  $scope.disconnectOther;
  $scope.disconnectMe;

  $scope.disconnect = function (userId) {
    var socket = io();

    $scope.comm.close();
    socket.emit('end', $scope.disconnectOther);
    socket.emit('end', $scope.disconnectMe);

    document.getElementById('videos').remove();

    $scope.showChatApp = false;

    document.getElementById('chatBox').remove();
  }

  $scope.connect = function (obj) {
    $scope.disconnectOther = obj.u_id;
    $scope.disconnectMe = obj.my_id;
    $scope.language.native = obj.native;
    $scope.language.desired = obj.desired;
    var socket = io();
    socket.emit('connectionreq', obj);
  }

  $scope.langNative = [
    {name:'English'},
    {name:'Chinese'},
    {name:'Spanish'},
    {name:'French'},
    {name:'Italian'}
  ];

  $scope.langDesired = [
    {name:'English'},
    {name:'Chinese'},
    {name:'Spanish'},
    {name:'French'},
    {name:'Italian'}
  ];

  $scope.profs = [
    {name:'Beginner'},
    {name:'Intermediate'},
    {name:'Advanced'},
    {name:'Fluent'}
  ];

  $scope.status = {
    isopen: false
  };

  $scope.init = function(){
    $http.get('/api/initialGet').
      success(function (data, status, headers, config) {
        $scope.user = {
          firstname: data.firstname || data.username,
          lastname: data.lastname,
          photoUrl: 'https://socializeapplications.com/kraft/youtube-channel/assets/images/blank_user.png'
        }
        $scope.updateDesiredLang(data.desireLang);
      }).
      error(function (data, status, headers, config) {
        console.log('failed!!');
      });
  }

  $scope.updateNativeLang = function (value) {
    $http.post('/api/updateNative', { msg: value }).
      success(function (data, status, headers, config) {
        console.log('successful posting!');
      }).error(function (data, status, headers, config) {
        console.log('error posting!!');
      });
  };

  $scope.updateNativeLangRating = function (value) {
    $http.post('/api/updateNativeRating', { msg: value }).
      success(function (data, status, headers, config) {
        console.log('successful posting!');
      }).error(function (data, status, headers, config) {
        console.log('error posting!!');
      });
    };

  $scope.updateDesiredLang = function(value) {
    $http.post('/api/updateDesired', { msg: value }).
      success(function(data, status, headers, config){
        $scope.users = [];
        console.log('desired data', data)
        for (var i = 0; i < data.length; i++) {
          data[i].photoUrl = 'https://socializeapplications.com/kraft/youtube-channel/assets/images/blank_user.png';
          data[i].password = '';
          $scope.users.push(data[i]);
        };
      }).error(function(data, status, headers, config){
        console.log('error posting!!');
      })
    };
});