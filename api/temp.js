var axios = require('axios')

const URL = 'http://api.openweathermap.org/data/2.5/weather?APPID=a7aa45e4ec0a5d575dfe8c723f023479&units=metric';
//http://api.openweathermap.org/data/2.5/weather?q=Malappuram&APPID=a7aa45e4ec0a5d575dfe8c723f023479&units=metric
module.exports = {
	getTemp(loc) {
		var encoded= encodeURIComponent(loc);
		var requestUrl = `${URL}&q=${encoded}`;

		return axios.get(requestUrl).then(res => {
			if(res.data.cod && res.data.message){
				throw new Error(res.data.message);
			} else{
				return res.data.main.temp;
			}
		}, res => {
			throw new Error(res.data.message)
		});
	}
}