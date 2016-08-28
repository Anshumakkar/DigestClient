var http = require('http');

//The url we want is `www.nodejitsu.com:1337/`
var options = {
  host: '127.0.0.1',
  path: '/',
  //since we are listening on a custom port, we need to specify it by hand
  port: '5050'

};

var crypt = require('crypto');


var ncount = 0;


function calculatenc(nc){
	nc++;
	var str='0';
	var length=nc.toString().length;
	var remlength=8-length;

	var ncstr=str.repeat(remlength);
	ncstr+=nc.toString();
//	console.log('nc='+ncstr);
	return ncstr;

}



var credentials = {
    userName: 'mahesh',
    password: 'mahesh1234',
    realm: 'Digest Authenticatoin'
};


function cryptoUsingMD5(data) {
    return crypt.createHash('md5').update(data).digest('hex');
}



callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });


  response.on('end', function () {
    console.log(str);

        var headers=this.headers;
        var authenticatehdr=headers['www-authenticate'];


        if(authenticatehdr!=undefined){
	authenticatehdr=authenticatehdr.replace(/^Digest /,'');
          var authenticationObj={};
  //        console.log(authenticatehdr);
          var arr=authenticatehdr.split(',');

          arr.forEach(function(d){
                   d = d.split('=');

                  authenticationObj[d[0]] = d[1].replace(/"/g, '');
          });
    //              console.log(authenticationObj);

          var req = http.request(options, callback);
          //This is the data we are posting, it needs to be a string or a buffer






	var digestAuthObject={};





 digestAuthObject.ha1 = cryptoUsingMD5(credentials.userName + ':' + authenticationObj.realm + ':' + credentials.password);

    //13.
    digestAuthObject.ha2 = cryptoUsingMD5('GET' + ':' + '/');

  var resp = cryptoUsingMD5([digestAuthObject.ha1, authenticationObj.nonce,calculatenc(ncount), '1672b410efa182c061c2f0a58acaa17d', authenticationObj.qop, digestAuthObject.ha2].join(':'));




      console.log('Digest realm="'+authenticationObj.realm+'", username="'+credentials.userName+'", uri="'+options.path+'", nonce="'+authenticationObj.nonce+'", nc=00000001, cnonce="1672b410efa182c061c2f0a58acaa17d", qop="auth", response= "'+resp+'"');
          req.setHeader('Authorization','Digest realm="'+authenticationObj.realm+'", username="mahesh", uri="/", nonce="'+authenticationObj.nonce+'", nc='+calculatenc(ncount)+', cnonce="1672b410efa182c061c2f0a58acaa17d", qop="'+authenticationObj.qop+'", response="'+resp+'"');
          req.end();
        


        }
  });



      //  console.log(response.body);
}

var req = http.request(options, callback);
//This is the data we are posting, it needs to be a string or a buffer
req.write("hello world!");
req.end();



