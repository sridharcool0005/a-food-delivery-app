// Here $rootScope.login value is direct opposite because I am using ng-hide instead of ng-show
// because ng-show was not working
// user infos into this locastorage window.localStorage['loggedInUserInofos']
angular.module('app.controllers', [])

.controller('appCtrl', ['$scope', '$state', '$rootScope', 'UsersFactory', function($scope, $state, $rootScope, UsersFactory) {

    $rootScope.login = true; // acctually it means false incase of ng-hide

    var loggedIn = window.localStorage['loggedIn'];

    if (loggedIn === "true") {
        $rootScope.login = false;
        $state.go("app.tabs.search"); //app.tabs.search
    } else {
        window.localStorage['loggedIn'] = "false";
        $state.go("app.login");
        $scope.logoutMessage = false;
    }

    $scope.logout = function() {

        window.localStorage['loggedIn'] = "false";
        window.localStorage['loggedInUserInofos'] = "";

        $scope.logoutMessage = true;
        $rootScope.login = true;
        $state.go("app.login");


    }


    // for using into cart page
    //   var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    //   UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response){
    // $rootScope.cc = response.data[0];
    // },
    // function(error){
    // 	console.log(error.message);});
    // End of call

}])

.controller('searchCtrl', ['$scope', '$ionicPopup', '$cordovaGeolocation', 'LocationFactory', 'SearchFactory', '$ionicLoading', 'FoodFactory', '$state', '$window',
        function($scope, $ionicPopup, $cordovaGeolocation, LocationFactory, SearchFactory, $ionicLoading, FoodFactory, $state, $window) {
            // A little refresher for(only one time) menu showing when login
            //$state.transitionTo($state.current, {}, { reload: true, inherit: false, notify: true });

            $ionicLoading.show({
                template: 'Loading...'
            });

            // Map Init
            $scope.initMap = function() {
                // Getting current position
                var posOptions = {
                    timeout: 10000,
                    enableHighAccuracy: false
                };
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function(position) {
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        var myLatLng = {
                            lat,
                            lng
                        };

                        // Create a map object and specify the DOM element for display.
                        var map = new google.maps.Map(document.getElementById('map'), {
                            center: myLatLng,
                            scrollwheel: false,
                            zoom: 15
                        });

                        // Create a marker and set its position.
                        var marker = new google.maps.Marker({
                            map: map,
                            position: myLatLng,
                            title: 'You are here'
                        });

                        var infowindow = new google.maps.InfoWindow({
                            content: "You are here"
                        });

                        infowindow.open(map, marker);


                        // Getting the zip code using lat lng
                        LocationFactory.getZipCode(lat, lng).then(function(response) {
                            $scope.zipcode = response.data.postalCodes[0].postalCode;
                            console.log($scope.zipcode);
                            $ionicLoading.hide();
                        });

                    }, function(err) {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Opps.. something wrong ' + err.message
                        });
                        console.log("Opps! something wrong here " + err.message);
                        $ionicLoading.hide();
                    });
            }
            $scope.initMap();
            // Searching by location
            $scope.searchByLocation = function() {
            	
                $ionicLoading.show({
                    template: 'Loading...'
                });

                var searchResult = [];

                // Getting the restaurants by zipcode //Should be in one query//

                SearchFactory.searchByZipCode($scope.zipcode).then(function(response) {
                    var restaurants = response.data;
                    // Getting the restaurants

                    for (var i = 0; i < restaurants.length; i++) {
                        FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }


                    $ionicLoading.hide();
                    $state.go("app.tabs.searchResult");
                    SearchFactory.saveSearchResult(searchResult);

                });
            }

            $scope.searchByZipCode=function(zipcode){
            	//alert(zipcode);
            	$ionicLoading.show({
                    template: 'Loading...'
                });

                var searchResult = [];

                // Getting the restaurants by zipcode //Should be in one query//

                SearchFactory.searchByZipCode(zipcode).then(function(response) {
                    var restaurants = response.data;
                    // Getting the restaurants

                    for (var i = 0; i < restaurants.length; i++) {
                        FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }


                    $ionicLoading.hide();
                    $state.go("app.tabs.searchResult");
                    SearchFactory.saveSearchResult(searchResult);

                });
            }

            // $scope.searchByZipCode=function(){

            // }


        }
    ])
    .controller("searchResultCtrl", ['$scope', 'SearchFactory', function($scope, SearchFactory) {

        $scope.searchResult = SearchFactory.getSearchResult();

    }])
    .controller('orderCtrl', ['$scope', 'FoodFactory', '$ionicModal', '$ionicLoading',
        function($scope, FoodFactory, $ionicModal, $ionicLoading) {
            // Getting Foods	
            var fetchFoods = function() {
                    // show loading
                    $ionicLoading.show({
                        template: 'Loading...'
                    });

                    FoodFactory.getFoods().then(function(foodsResponse) {
                        var fooods = foodsResponse.data;

                        // For getting the name of the cuisine
                        FoodFactory.getCuisines().then(function(cuisineResponse) {
                            var allCuisines = cuisineResponse.data;
                            for (var i = 0; i < fooods.length; i++) {
                                for (var j = 0; j < allCuisines.length; j++) {
                                    if (+fooods[i].cuisine_id == +allCuisines[j].id) {
                                        fooods[i].cuisine_id = allCuisines[j].cuisine_name;
                                    }
                                }
                            }
                            $scope.foods = fooods;
                            $ionicLoading.hide();
                        });


                    });
                }
                // Calling the fetch function when order page loads
            fetchFoods();
        }
    ])
    // Cart Controller
    .controller('cartCtrl', function($scope,$http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal,$ionicPopup) {

        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.emptyCart = true;
        var cartInfo = CartFactory.getCartInfo();

        if (cartInfo.length < 1) {
            $scope.emptyCart = false;
        }
        //alert(JSON.stringify(cartInfo));
        var grandTotal = 0;

        if (cartInfo) {
            $scope.emptyCart = false;
            var temp = [];

            for (var i = 0; i < cartInfo.length; i++) {

                var food = {
                    name: cartInfo[i].mainFood.food_name,
                    size: cartInfo[i].sizeInfo.sizeName,
                    qty: cartInfo[i].qty,
                    price: cartInfo[i].totalPrice,
                    specialInstruction: cartInfo[i].specialInstruction
                }

                temp.push(food);
                grandTotal += cartInfo[i].totalPrice;
            }
            $scope.grandTotal = grandTotal;
            $scope.foods = temp;
        } else {}
        $scope.emptyCart = true;

        $ionicLoading.hide();


        //........................... For Delivery Starts......................
        $scope.disableCheckOut=false;
        if(CartFactory.getCartInfo().length<1){
        	$scope.disableCheckOut=true;
        }
        $scope.boolAddNewAddress = false;
        $scope.deliveryCharge=1;
        $scope.deliveryType='delivery';
        $scope.tips=1;
        $scope.tipsPercent=0;
        $scope.foodTotal=$scope.grandTotal;
        $scope.tipsPercent=$scope.foodTotal*($scope.tips/100);
        $scope.tipsPercent=$scope.tipsPercent.toFixed(2);

        $ionicModal.fromTemplateUrl('templates/deliveryModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(deliveryModal) {
            $scope.deliveryModal = deliveryModal;
        });
        // Order Modal

        $scope.closeModal = function() {
            $scope.deliveryModal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.deliveryModal.remove();
        });

        $scope.openDeliveryModal = function() {
        	if(localStorage.getItem('defaultAddress')!=null){
        		//alert(localStorage.getItem('defaultAddress'));
            var defaultAddress = JSON.parse(localStorage.getItem('defaultAddress'));
            $scope.defaultAdrs = defaultAddress;
            $scope.deliveryModal.show();

        	}
        }

        $scope.addAddressDiv = function() {
            $scope.boolAddNewAddress = true;
        }

        $scope.saveAddress = function(address) {
            $scope.address = address;
           // JSON.stringify($scope.address);
            $ionicLoading.show({
                template: 'Saving into savor365 database.'
            });
            var user = JSON.parse(localStorage.getItem('loggedInUserInofos'));
            UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
                //$scope.address = response.data;
                $scope.boolAddNewAddress = false;
                //alert(JSON.stringify(response.data));
                if (response.data == "Address Saved") {

                    $scope.defaultAdrs.addrs = $scope.address.line1 + ' ' + $scope.address.line2;
                    $scope.defaultAdrs.state = $scope.address.state;
                    $scope.defaultAdrs.town = $scope.address.city;
                    $scope.defaultAdrs.zip_code = $scope.address.zipcode;
                    $scope.defaultAdrs.phone = $scope.address.phone;
                    $scope.defaultAdrs.country = "USA";
                }
                $ionicLoading.hide();

            }, function(error) {
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Opps.. something wrong'
                });
                console.log("eror is address saving" + error);
            });

        }
        $scope.close=function(){
        	$scope.boolAddNewAddress = false;
        }
        $scope.setTipsPercent=function(val){
        	$scope.tips+=val;
        	if($scope.tips<0){
        		$scope.tips=0;
        		return;
        	}
        	$scope.tipsPercent=$scope.foodTotal*($scope.tips/100);
        	$scope.tipsPercent=$scope.tipsPercent.toFixed(2);
        }
        $scope.setDeliveryCharge=function(val){
        	$scope.deliveryCharge=Number(val);
        }
        $scope.checkout = function(amnt,deliveryType,tips) {
        	//alert(deliveryType);
                var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);
                // UsersFactory.getPaymentInfo(userInfo[0].cus_id).then(function(response) {
                //         $scope.cc = response.data[0];
                //         window.open("https://savor365.com/api/makePayment?amount=" + amnt + "&cardNumber=" + $scope.cc.card_number + "&cvv=" + $scope.cc.cvv + "&expDate=" + $scope.cc.expiration_date + "&invNumber=102", "_blank", "location=no");
                //         $scope.checkOutInfo = {};
                //         $scope.boolPayment = true;
                //         if ($scope.boolPayment) {
                //             $scope.checkOutInfo.cartItem = CartFactory.getCartInfo();
                //             var d = new Date();
                //             var time = d.getTime();
                //             var orderNo = time.toString();
                //             orderNo = Number(orderNo.substring(2));
                //             $scope.checkOutInfo.orderNo = orderNo;
                //             $scope.checkOutInfo.address = JSON.parse(localStorage.getItem('defaultAddress'));
                //             alert(JSON.stringify($scope.checkOutInfo));

                //         }
                //         CartFactory.makePayment(amnt, cc.card_number, cc.cvv, cc.expiration_date).then(
                //             function(res) {
                //                 console.log("done");
                //             });
                //     },
                //     function(error) {
                //         console.log(error.message);
                //     });
                $scope.checkOutInfo = {};
                $scope.boolPayment = true;
                if ($scope.boolPayment) {
                    $scope.checkOutInfo.cartItem = CartFactory.getCartInfo();
                    var d = new Date();
                    var time = d.getTime();
                    //alert(time);
                    var orderNo = time.toString();
                    orderNo = Number(orderNo.substring(4));
                    $scope.confirmationCode=time.toString().substring(9);
                    $scope.checkOutInfo.orderNo = orderNo;
                    // $scope.checkOutInfo.address = JSON.parse(localStorage.getItem('defaultAddress'));
                    $scope.checkOutInfo.address = $scope.defaultAdrs;
                    $scope.checkOutInfo.deliveryType=deliveryType;
                    $scope.foodTotal=$scope.grandTotal;
                    $scope.grandTotal+=$scope.deliveryCharge;
                    $scope.checkOutInfo.foodTotal=$scope.foodTotal;
                    $scope.checkOutInfo.grandTotal=$scope.grandTotal;
                    //$scope.checkOutInfo.tips=tips;
                    $scope.checkOutInfo.deliveryCharge=$scope.deliveryCharge;
                    $scope.checkOutInfo.tips=$scope.tipsPercent;
                    $scope.checkOutInfo.confirmationCode=$scope.confirmationCode;
                    //alert(JSON.stringify($scope.checkOutInfo));
                    console.log($scope.checkOutInfo);
                    // $http.post("https://savor365.com/api/orderInfo",$scope.checkOutInfo).then(function(response){
                    // 	alert(JSON.stringify(response));
                    // });

                    ////////////////////////////
						$http({
						method: 'POST',
						url: 'https://savor365.com/api/orderInfo',
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
						data:$scope.checkOutInfo


						}).then(function (data) 
						{
						//alert(JSON.stringify(data));
						console.log(data);
						});
                    /////////////////////////////

                }
            }
            //............................For Delivery Ends........................

    })

.controller('myProfileCtrl', function($scope) {

    })

.controller('myAccountCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory) {
    //alert('holaa');
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getUserInfo(userInfo[0].cus_email).then(function(response) {
        $scope.user = response.data[0];
        console.log($scope.user);
    });

})

.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup, $state) {
//alert('holaaa');
    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
        $scope.addresses = response.data;
    });


    $scope.saveAddress = function(address) {
    	//alert(JSON.stringify(address));

        $ionicLoading.show({
            template: 'Saving into savor365 database.'
        });

        UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
            $scope.address = response.data;
         //    var newAddress={addrs:address.line1+' '+address.line2,
    					// country:'USA',
    					// cus_id:user[0].cus_id,
    					// id:-1,
    					// phone:address.phone,
    					// state:address.state,
    					// town:address.city,
    					// zip_code:address.zipcode};
           // alert(JSON.stringify($scope.address));
            //$scope.addresses.push(newAddress);
            $ionicLoading.hide();
            $scope.closeModal();
    	 UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
	        $scope.addresses = response.data;
	    });
            $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully saved'
            });
            $state.go("app.addresses");
        }, function(error) {
            $ionicLoading.hide();
            $scope.closeModal();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong'
            });
            console.log("eror is address saving" + error);
        });
    }

    $scope.saveAddressForSate = function(address) {
            UsersFactory.saveAddressForNextState(address);
        }
        // Ionic Modal Configuration
    $ionicModal.fromTemplateUrl('templates/address/add-address-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    // Order Modal
    $scope.addNewAddressModal = function() {
        $scope.modal.show();
    };
    // Order modal closing function

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

})

.controller('addressCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup) {

    $scope.thisAddress = UsersFactory.getAddress();

    console.log($scope.thisAddress['id']);

    $scope.makeDafultAddress = function(id) {
        //alert(id);
        UsersFactory.makeThisAddressDefault(id).then(function() {
            $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully saved'
            });
        }, function(error) {
            console.log("Can't save");
        });
    }

})

.controller('currentOrderCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {


})

.controller('paymentCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $state, UsersFactory) {

    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response) {
            $scope.card = response.data[0];
            console.log($scope.card);
        },
        function(error) {
            console.log(error.message);
        });
    // End of call

    $scope.savePaymentInfos = function(payment) {
            $ionicLoading.show({
                template: 'Saving into savor365 database.'
            });

            UsersFactory.paymentInfoSave(payment, user[0].cus_id).then(function(response) {
                $scope.payment = response.data;
                console.log($scope.payment);
                $ionicLoading.hide();
                $scope.closeModal();
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'Successfully saved'
                });
                $state.go("app.payment");
            }, function(error) {
                $ionicLoading.hide();
                $scope.closeModal();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Opps.. something wrong'
                });
                console.log("eror in payment saving" + error);
            });
        }
        // Ionic Modal Configuration
    $ionicModal.fromTemplateUrl('templates/payment/payment-add-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    // Order Modal
    $scope.addNewCardModal = function() {
        $scope.modal.show();
    };

    // Order modal closing function
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });


})

.controller('inviteFriendsCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {


})

.controller('favouriteCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {


})

.controller('orderHistoryCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {


})

.controller('rewardCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {


})

// Login/Signup     
.controller('loginCtrl', ['$scope', 'UsersFactory', '$ionicPopup', '$state', '$rootScope', '$timeout', 'ngFB',
    function($scope, UsersFactory, $ionicPopup, $state, $rootScope, $timeout, ngFB) {

        $scope.logoutMessage = false;
        $scope.login1=true;
        $scope.login = function(user) {
            UsersFactory.login(user.email, user.password).then(function(response) {
                var userInfo = response.data;
                UsersFactory.getAddresses(userInfo[0].cus_id).then(function(response) {
                    var addresses = response.data;
                    for (var i = 0; i < addresses.length; i++) {
                        if (addresses[i].adrs_type == 1) {
                            //alert(addresses[i]);
                            localStorage.setItem('defaultAddress', JSON.stringify(addresses[i]));
                            break;
                        }
                    }
                });
                if (userInfo.length == 0) {
                    $ionicPopup.alert({
                        title: 'Unsuccessful',
                        template: 'The email or password mismatched'
                    });
                } else {
                    //Saving variables to use later
                    //$rootScope.login = false;
                    $scope.login1=false;
                    window.localStorage['loggedIn'] = "true";
                    window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                    // without timeout menu ng-show doesn't work
                    $state.go("app.tabs.search");

                }

            }, function(error) {
                $ionicPopup.alert({
                    title: 'Unsuccessful',
                    template: 'Opps! there was a problem' + error.message
                });
            });
        }

    }
])

.controller('signupCtrl', function($scope, SignUpFactory, $ionicPopup, $state,UsersFactory, ngFB) {
	$scope.login1=true;
    $scope.signUp = function(data) {
    	$scope.user=data;
        SignUpFactory.signup(data).then(function(response) {
            var popup = $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully signed up, now login and enjoy your food'
            });

            popup.then(function(res) {
                if (res) {
                    //$state.go("app.login");
                    //////////////////////////////
                    UsersFactory.login($scope.user.email, $scope.user.password).then(function(response) {
                var userInfo = response.data;
                UsersFactory.getAddresses(userInfo[0].cus_id).then(function(response) {
                    var addresses = response.data;
                    for (var i = 0; i < addresses.length; i++) {
                        if (addresses[i].adrs_type == 1) {
                            //alert(addresses[i]);
                            localStorage.setItem('defaultAddress', JSON.stringify(addresses[i]));
                            break;
                        }
                    }
                });
                if (userInfo.length == 0) {
                    $ionicPopup.alert({
                        title: 'Unsuccessful',
                        template: 'The email or password mismatched'
                    });
                } else {
                    //Saving variables to use later
                    //$rootScope.login = false;
                    $scope.login1=false;
                    window.localStorage['loggedIn'] = "true";
                    window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                    // without timeout menu ng-show doesn't work
                    $state.go("app.tabs.search");

                }

            }, function(error) {
                $ionicPopup.alert({
                    title: 'Unsuccessful',
                    template: 'Opps! there was a problem' + JSON.parse(error)
                });
            });
                    //////////////////////////////
                } else {
                    console.log("Do nothing");
                }
            });

        }, function(error) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'The signup was not successful for this reason' + JSON.parse(error)
            });
        });
    }

    $scope.fbSignUp = function() {
        // {scope: 'email,user_friends,publish_actions,public_profile'}
        ngFB.login().then(
            function(response) {
                if (response.status === 'connected') {
                    // alert('Facebook Signup succeeded');
                    ngFB.api({
                        path: '/me',
                        params: {
                            fields: 'id,name,email'
                        }
                    }).then(
                        function(user) {
                            $scope.data = user;
                        },
                        function(error) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'The login was not successful for this reason ' + error.error_description
                            });
                            //alert('Facebook error: ' + error.error_description);
                        });

                } else {
                    $cordovaToast.showLongBottom('Facebook Signup failed.');
                    //alert('Facebook Signup failed');
                }
            });

    }



});