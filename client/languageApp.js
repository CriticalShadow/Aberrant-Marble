angular.module('languageApp', ['translateModule', 'ngFx'])

.controller('selectLanguageController', function ($scope, $http, Translate) {
  $scope.languages = [['English','us'],['Chinese','cn'],['Spanish','es'],['French','fr'],['Italian','it']];
  $scope.language = {};

  $scope.showChatApp = false;
  $scope.msg = '';
  $scope.convo = '';
  $scope.waiting = false;
  $scope.topics = ['How did you spend your last vacation?', 'Describe your hometown', 'What do you do for a living?', 'What kind of food do you like to eat?', 'Describe your family', 'What do you like to do for fun?', 'Describe your mother', 'Describe your perfect day', 'Where would you like to travel?'];
  $scope.topic = $scope.topics[0];

  $scope.submitLanguages = function (languageSelections) {
    return $http({
      method: 'GET',
      url: '/api/getroom',
      params: languageSelections
    })
    .success(function (data) {
      $scope.comm = new Icecomm('IbQqKDNCGQS7b94Mllk/iHOJbeSe/UrJJy6l1BbqEbP0fKaK');

      $scope.comm.connect(data);

      // Show video of the user
      $scope.comm.on('local', function (options) {
        console.log(options.stream);
        $('#localVideo').attr("src", options.stream);
      });

      // When two people are connected, display the video of the language partner
      // and show the chat app
      $scope.comm.on('connected', function (options) {
        var foreignVidDiv = $('<div class="inline"></div>');
        foreignVidDiv.append(options.video)
        foreignVidDiv.children().addClass('foreignVideo');
        $('#videos').prepend(foreignVidDiv);
        // document.getElementById('videos').insertBefore(document.createElement("$BUTTON")options.video, document.getElementById('myVideo'));
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
            console.log(translatedMsg);
            var translatedText = translatedMsg.data.translations[0].translatedText
            $scope.convo += 'Them: ' + options.data + '\n';
            $scope.convo += 'Them (translated): ' + translatedText + '\n';
            $scope.scrollBottom();
          })
        });
      })

      // When the language partner leaves, remove the video and chatbox
      $scope.comm.on('disconnect', function (options) {
        document.getElementById(options.callerID).remove();
        $scope.$apply(function () {
          $scope.showChatApp = false;
        });
      });
    })
  }

  // Function to send a message to the language partner
  // and display the sent message in the chatbox
  $scope.sendMsg = function () {
    if($scope.msg.trim() !== '') {
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

})

.controller('createProfileController', function ($scope, $http) {
  $scope.languages = ['English', 'Chinese', 'Spanish', 'French', 'Italian'];
  $scope.native = {};
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
      console.log(data);
      $location.url('/#/dashboard');
    });
  }

});