/*
 * HTML Application Template:
 * A basic starting point for your application.  Mostly a blank canvas with a web view.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later'); 
} else {
    
    
    
// countly 
var Countly = require('count.ly.messaging');

// START IF - iOS only
if (Ti.Platform.name == 'iPhone OS'){

    // START FUNCTION - registerForPush
    function registerForPush() {
        Ti.Network.registerForPushNotifications({
                            success: deviceTokenSuccess,
                            error: deviceTokenError,
                            callback: receivePush
        });

        // Remove event listener once registered for push notifications
        Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
    };
    // END FUNCTION - registerForPush


    // addEventListener to Wait for user settings to be registered before registering for push notifications
    Ti.App.iOS.addEventListener('usernotificationsettings', registerForPush);

    // Start Function - deviceTokenSuccess
    function deviceTokenSuccess(e) {

        // get Ti.App.Properties - pushSubscribed - to check if already subscribed or not
        var pushSubscribed = Ti.App.Properties.getString('pushSubscribed',false);
        Ti.API.log('pushSubscribed Value: ' + pushSubscribed);  

        // START IF - not subscribed then subscribe
        if (pushSubscribed != true){

            Ti.API.log("Not Subscribed to Count.ly Push - Subscribe with deviceToken: " + e.deviceToken);

            // run Count.ly Register Device for Push
            Countly.registerDeviceSuccess(e.deviceToken);

            // Set Ti.App.Properties push_channels
            Ti.App.Properties.setString('pushSubscribed',true); 

        }else{

            Ti.API.log('Already Subscribed to Count.ly Push, wont subscribe again!');

        };
        // END IF - not subscribed then subscribe      

    };
    // End Function - deviceTokenSuccess

    // Start Function - deviceTokenError
    function deviceTokenError(e) {

        Ti.API.log("Failed to Find Token" + e.error);

        // run Count.ly Register registerDeviceError
        Countly.registerDeviceError();

    };
    // End Function - deviceTokenError


    //START Countly with Messaging - DEVELOPMENT TEST
    Countly.setMessagingDeveloperMode();    // setMessagingDeveloperMode
    Countly.startMessagingTest('2be1cdadaa9a34f81ddd48a9c82b720a7f772235','http://172.245.12.16');
    
    //START Countly with Messaging - PRODUCTION
    //Countly.startMessaging('YOUR_APP_KEY','http://yourserver.com');

    // START FUNCTION - receivePush for iOS
    function receivePush(pushMessage) {         

        // Ti.API.info Raw pushMessage
        Ti.API.info("Received Push:" + JSON.stringify(pushMessage));  

        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        //                                                  pushMessage EXAMPLE                                 //
        //                                                                                                      //
        //          {"code":0,                                                                                  //
        //          "data":{    "alert":"Test Message",                                                         //
        //                      "category":"[CLY]_url",                                                         //
        //                      "c":{"l":"http://count.ly","i":"551b9d03f593a55e11ea62c0"},                     //
        //                      "sound":"default",                                                              //
        //                      "aps":{"category":"[CLY]_url","sound":"default","alert":"test5"}                //
        //                  },                                                                                  //
        //          "type":"remote",                                                                            //
        //          "source":{},                                                                                //
        //          "inBackground":true,                                                                        //
        //          "success":true};                                                                            //
        //                                                                                                      //
        //////////////////////////////////////////////////////////////////////////////////////////////////////////


        // pushData
        var pushData = pushMessage.data;

        // set pushUserInfoDictionary
        var pushUserInfoDictionary = {userInfoDictionary: pushMessage.data.c};  
        // run Count.ly record Push Opened  
        Countly.recordPushOpen(pushUserInfoDictionary); 


        // START IF - Set pushAlertMessage
        if (pushMessage.data.alert){

            var pushAlertMessage = pushMessage.data.alert;

        };
        // END IF -  Set pushAlertMessage 


        // START IF - Set PUSH CATEGORY TYPE - check more here - http://resources.count.ly/v1.0/docs/countly-push-for-ios
        if (pushMessage.data.c.l) {

            var pushType = "hasLink";
            var pushLink = pushMessage.data.c.l;

            ///////////////////////////////////////////////////////////
            //              SHOW AN LINK ALERT HERE                 //
            // 1. Use info  - pushType
            //              - pushLink
            //              - pushAlertMessage
            // 2. Once user Takes action log action with

            // Count.ly record Push Action  
            // Countly.recordPushAction(pushUserInfoDictionary);    

            //////////////////////////////////////////////////////////

        } else if (pushMessage.data.c.r) {

            var pushType = "hasReview";

            // SHOW AN REVIEW ALERT HERE 

        } else if (pushMessage.data.c.u) {

            var pushType = "hasUpdate";

            // SHOW AN UPDATE ALERT HERE

        } else {

            var pushType = "hasMessage";

            // SHOW NORMAL ALERT HERE
            var dialog = Ti.UI.createAlertDialog({
                            message : pushAlertMessage,
                            ok : 'باشه',
                            title : 'پیام جدید',
                        }).show();


        };
        // END IF - Set PUSH CATEGORY TYPE

    };
    // END FUNCTION - receivePush for iOS


// ELSE IF - Android only
}else if (Ti.Platform.name == 'android'){

    //START Countly with Messaging - DEVELOPMENT TEST

    // enableDebug if needed
    Countly.enableDebug();

    // START Countly with Messaging - DEVELOPMENT TEST
    Countly.startMessagingTest('COUNLY_APP_KEY','http://yourserver.com','GCM_PROJECT_ID');
    //START Countly with Messaging - PRODUCTION

    // START Countly with Messaging - PRODUCTION
    //Countly.startMessaging('COUNLY_APP_KEY','http://yourserver.com','GCM_PROJECT_ID');

    // ADD EVENTLISTENTER AND FUNCTION TO MODULE
    Countly.addEventListener('receivePush',function(pushMessageData){

        // *** IN ANDROID THERE IS NO NEED TO RUN recordPushOpen as it happens Automaticall on the Native Module side **//

        // Ti.API.info Raw pushMessage
        Ti.API.info("Received Push");  
        Ti.API.info(JSON.stringify(pushMessageData));  

        var pushID = pushMessageData.id;
        var pushAlertMessage = pushMessageData.message;
        var pushType = pushMessageData.type || 'unknownType';
        var pushLink = pushMessageData.link || '';
        var pushSound = pushMessageData.sound || '';
        var pushData = pushMessageData.data;                        // all message data if needed

        Ti.API.info("pushID: " + pushID + " pushAlertMessage: " + pushAlertMessage + "pushType: " + pushType + " pushData: " + pushData + " pushSound: " + pushSound);

        if (pushType == "hasLink"){

            ///////////////////////////////////////////////////////////
            //              SHOW AN LINK ALERT HERE                 //
            // 1. Use info  - pushType
            //              - pushLink
            //              - pushAlertMessage
            // 2. Once user Takes action log action with recordPushAction using pushID

            // Count.ly record Push Action  
            // Countly.recordPushAction(pushID);    

        }else if (pushType == "hasReview"){

            // SHOW AN REVIEW ALERT HERE 

        }else if (pushType == "hasMessage"){

            // SHOW NORMAL ALERT HERE

            var dialog = Ti.UI.createAlertDialog({
                            message : pushAlertMessage,
                            ok : 'باشه',
                            title : 'پیام جدید',
                        }).show();

        };

    });

};
// END IF - Android Only




// countly


    
    
    
    
	//require and open top level UI component
	var ApplicationWindow = require('ui/ApplicationWindow');
	new ApplicationWindow().open();
}
