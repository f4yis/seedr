var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var storage = require("node-persist");
var fs = require("fs");
var contents = fs.readFileSync("data.json");
var jsonC = JSON.parse(contents);
var axios = require('axios')
//console.log(jsonC);
const PORT = process.env.PORT || 3000;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//middleware for Heroku
app.use((req, res, next) => {
	if(req.headers['x-forwarded-proto'] === 'https'){
		res.redirect('http://' + req.hostname + req.url);
	}else{
		next();
	}
});

const URL = 'http://api.openweathermap.org/data/2.5/weather?APPID=a7aa45e4ec0a5d575dfe8c723f023479&units=metric';
var tempr = "";
var windr = "";
var humr = "";
var crop = "";

var tt = false;
var img = "";
//api
function getTemp(loc){

	temp = "";
	console.log("started");
	var encoded= encodeURIComponent(loc);
	var requestUrl = `${URL}&q=${encoded}`;
	axios.get(requestUrl).then(res => {
		if(res.data.cod && res.data.message){
			throw new Error(res.data.message);
		} else{
			tempr = res.data.main.temp;
			windr = res.data.wind.speed;
			humr = res.data.main.humidity;
		}
	});
}

var tempArray = [];
var windArray = [];
var humArray = [];
for(var i=0; i<jsonC.length; i++){
	var item = jsonC[i];
	tempArray.push(item.temp);
	windArray.push(item.wind);
	humArray.push(item.hum);
}


function closest(array,num){
    var i=0;
    var minDiff=1000;
    var ans;
    for(i in array){
         var m=Math.abs(num-array[i]);
         if(m<minDiff){ 
                minDiff=m; 
                ans=array[i]; 
            }
      }
    return ans;
}

/*call array name and desired value to be closet */
//alert(closest(array,89));

var tempToCrop = (t) => {
	for(var i=0; i<jsonC.length; i++){
		var item = jsonC[i];
		if(item.temp === t){
			return item.name;
		}
	}
}
var windToCrop = (t) => {
	//console.log(t)
	for(var i=0; i<jsonC.length; i++){
		var item = jsonC[i];
		//console.log(item.wind);
		if(item.wind === t){
			return item.name;
		}
	}
}
var humToCrop = (t) => {
	for(var i=0; i<jsonC.length; i++){
		var item = jsonC[i];
		if(item.hum === t){
			return item.name;
		}
	}
}
var cropToDes = (t) => {
	for(var i=0; i<jsonC.length; i++){
		var item = jsonC[i];
		if(item.name === t){
			img = item.img;
			return item.des;
		}
	}
}

//getTemp("rajasthan")
var timer = () =>{
	var inter = setInterval(() => {
		if(tempr!=""){
			
			clearInterval(inter)
			var date = new Date();
			var hour = date.getHours();
			if(hour>0 && hour<=9){
				tempr+=5
			}else if(hour>9 && hour<=11){
				tempr+=1
			}else if(hour>11 && hour<=17){
				tempr-=3
			}else if(hour>17 && hour<=24){
				tempr+=4
			}else{
				tempr+=1
			}
			//console.log(tempArray);
			var closeTemp = closest(tempArray,tempr);
			
			var closeWind = closest(windArray,windr);
		
			var closeHum = closest(humArray,humr);

			

			var tempCrop = tempToCrop(closeTemp);
			var windCrop = windToCrop(closeWind);
			var humCrop = humToCrop(closeHum);
			//console.log(tempCrop,windCrop,humCrop);
			if(tempCrop === windCrop && tempCrop === windCrop){
				console.log(tempCrop);
				crop = tempCrop;
			}
			else if(windCrop === tempCrop && windCrop === humCrop){
				console.log(windCrop);
				crop = windCrop;
			}
			else if(humCrop === tempCrop && humCrop === windCrop){
				console.log(humCrop);
				crop = humCrop;
			}
			else{
				console.log(tempCrop);
				crop = tempCrop;
			}
			tt = true;
		}
	}, 1000);
}



/*require mongoose node module
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Schema = new mongoose.Schema({
	place: String,
	area: String,
	crop: String,
	phone: String,
	loan: Boolean
});

var data = mongoose.model('farmers', Schema);
*/



app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var router = express.Router();



router.post('/search', function(req, res) {
	var da = {
		place: req.body.place,
		//area: req.body.area,
		//crop: req.body.crop,
		//phone: req.body.phone
	}
	console.log(da.place)
	
	//if(da.place.length > 0 && da.area.length > 0 && da.crop.length > 0 && da.phone.length > 0){
	if(da.place){
		/*var d = new data({
			place: da.place,
			area: da.area,
			crop: da.crop,
			phone: da.phone

		});
		d.save((err, data) => {
			if(err){
				console.log("Errror");
			}else{
				console.log("Done");
				console.log(data);
			}
		});
		*/
	    tt = false;
		timer();
		getTemp(da.place);
		console.log(da.place);
		var inter = setInterval(() => {
			
		},1000);
		var timerr = setInterval(() => {
			if(tt == true){
				clearInterval(timerr);
				var des = cropToDes(crop);
				res.send(crop)
				//res.render('show.ejs', {crop: crop, des: des,img: img, temp: tempr, wind: windr, hum: humr});
			}
		}, 1000);
	}else{
		res.render('nodata.ejs')
	}
	
});


var search = (req, res, da = {}) => {
	
	//fetch('')
	
}


app.use('/', router);

app.listen(PORT, () => {
	console.log("Running on port 3000");
});