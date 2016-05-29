angular.module('app.services', [])


// Temporary using get for login
.factory('UsersFactory', ['$http', function($http){
	var result = [];
	return {
		login: function(email, password){
			return $http.get("https://savor365.com/api/userLogin?email=" + email + "&password=" + password); // password will be added later on
		},
		// this is for to use after login
		getUserInfo: function(email){
			return $http.get("https://savor365.com/api/user?email="+ email);
		},
		getAddresses: function(cusId){
			return $http.get("https://savor365.com/api/userAddresses?cusId=" + cusId);
		},
		addressSave: function(id, address){
			return $http.get("https://savor365.com/api/saveAddress?cusId="+id+"&address="+address.line1+" "+address.line2+"&city="+address.city+"&state="+address.state+"&phone="+address.phone+"&zipcode="+address.zipcode);
		},
		saveAddressForNextState: function(addrs){
			result = addrs;
		},
		getAddress: function(){
			return result;
		},
		makeThisAddressDefault: function(id){
			return $http.get("https://savor365.com/api/makeAddressDefault?id="+id);
		},
		paymentInfoSave: function(payment, id){
			return $http.get("https://savor365.com/api/savePaymentInfo?cusId="+id+"&holderName="+payment.name+"&cardNumber="+payment.cardNumber+"&expDate="+payment.expDate+"&cvv="+payment.cvv+"&zip="+payment.zip);
		},
		getPaymentInfo: function(id){
		 	return $http.get("https://savor365.com/api/findPaymentInfo?cusId="+id);
		},
		getFavs: function(id){
			return $http.get("https://savor365.com/api/favs?cusId="+id);
		},
		saveFav: function(res, cus){
			return $http.get("https://savor365.com/api/makeFav?resId="+ res +"&cusId="+ cus);
		},
		getLastOrderStatus: function(id){
			return $http.get("https://savor365.com/api/orderStatus?cusId="+id)
		}
		
	}
}])


.factory('SearchFactory', ['$http', function($http){
	var result = [];
	return {
		searchByZipCode: function(zip){
			return $http.get("https://savor365.com/api/searchByZipCode?zipcode="+zip);
		},
		saveSearchResult: function(rst){
			result =  rst;
		},
		getSearchResult: function(){
			return result;
		},
		getCuisines: function(){
			return $http.get("https://savor365.com/api/cuisins");
		},
		searchByCuisine: function(id){
			return $http.get("https://savor365.com/api/searchByCuisine?cuiId="+id);
		},
		searchByFreeDelivery: function(){
			return $http.get("https://savor365.com/api/searchByFreeDelivery");
		}
		
	}
}])


.factory('FoodFactory', ['$http', function($http){

	return {
		getFoods: function(email, password){
			return $http.get("https://savor365.com/api/foods");
		},
		getCuisines: function(){
			return $http.get("https://savor365.com/api/cuisines");
		},
		getFoodSize: function(id){
			return $http.get("https://savor365.com/api/foodSizeById?id="+ id);
		},
		getExtrasById: function(id){
			return $http.get("https://savor365.com/api/extraFoodsById?id="+ id);
		},
		getExtraFoodPrice: function(id){
			return $http.get("https://savor365.com/api/extraFoodPrice?foodId="+ id);
		},
		getFoodsByRestaurantId: function(restaurantId){
			return $http.get("https://savor365.com/api/foodsByRestaurantId?restaurantId="+ restaurantId);
		},
		getRestaurantsById: function(restaurantId){
			return $http.get("https://savor365.com/api/findRestaurantsById?restaurantId="+ restaurantId);
		},
		getResOpenHours: function(resId){
			return $http.get("https://savor365.com/api/resOpenHours?resId="+resId);
		},
		getMenus: function(resId){
			return $http.get("https://savor365.com/api/menu?resId="+resId);
		}
		
	}
}])


.factory('CartFactory',['$http', function($http) {

	var storage=[];

	return {
		saveIntoCart: function(cartData){
			if(localStorage.getItem('cartInfo')==null){
				localStorage.setItem('cartInfo',[]);
				storage=[];
			
			}
			if(localStorage.getItem('cartInfo').length>0){
				storage = JSON.parse(localStorage.getItem('cartInfo'));
				storage.push(cartData);
				localStorage.setItem('cartInfo',JSON.stringify(storage));
			}
			else{
				
				storage.push(cartData);
				localStorage.setItem('cartInfo',JSON.stringify(storage));
			}
			
			
		},
		getCartInfo: function(){
			//return JSON.parse(window.localStorage['cartInfo'] || false);
			if(localStorage.getItem('cartInfo')==""){
				localStorage.setItem('cartInfo',[]);
				return;
			}
			if(JSON.stringify(localStorage.getItem('cartInfo'))!=""){
				storage=JSON.parse(localStorage.getItem('cartInfo'));
			}
			return storage;
		},
		makePayment: function(amnt, cardNum, cvv, expDate){
			var cc = {}

			cc.transaction_type = "purchase"
			cc.amount = amnt
			cc.currency_code = "USD"
			cc.credit_card = {}
			cc.credit_card.type = "visa"
			cc.credit_card.cvv = "123"
			cc.credit_card.cardholder_name = "John Smith"
			cc.credit_card.card_number = "4012000033330026"
			cc.credit_card.exp_date= "1020"
			//return $http.post("https://api-cert.payeezy.com/v1/transactions ", data);
			return $http({
                    method: 'POST',
                    url: 'https://api-cert.payeezy.com/v1/transactions',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: cc


                })
		}
	}
}])




.factory('LocationFactory',['$http', function($http) {
  return {
    getZipCode: function(lat, lng) {
      return $http.get("http://ws.geonames.org/findNearbyPostalCodesJSON?formatted=true&lat="+lat+"&lng="+lng+"&username=ahayder");
    }
  }
}])



.factory('SignUpFactory',['$http', function($http) {
  return {
    signup: function(data){
    	return $http.get("https://savor365.com/api/cusInfoStore?name="+data.name+"&email="+data.email+"&password="+data.password+"&mobile="+data.mobile);
    }
  }
}]);

// .factory('ResId',function(){
// 	var resId=-1;
// 	return{
// 		setResId:function(resId){
// 			resId=resId;
// 		},
// 		getResId:function(){
// 			resId=resId;
// 		}
// 	}
// });
