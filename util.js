const os = require("os");
const request = require('request');
const utf8 = require("utf8");

var util = {
    GenRequestID: function() {
        return parseInt(Math.random() * 100000);
    },
	String2Hex: function(strInput) {
        hexs = "0x";
        for (let i = 0; i < strInput.length; i++) {
            hexs += strInput.charCodeAt(i).toString(16);
        }
        return hexs;
    },
    Hex2String: function(strInput) {
        strInput = strInput.substring(2); // 去除开头的0x
        if (strInput.length % 2 == 0) { //当输入够偶数位
            var StrHex = '';
            for (var i = 0; i < strInput.length; i += 2) {
                 var n = parseInt(strInput.substr(i, 2), 16); //10进制；
                 StrHex = StrHex + String.fromCharCode(n);
            }
            return utf8.decode(StrHex);
        }
        return false;
    },
    registerConsul: function(consulURL, consulForm) {
        return new Promise((resolve, reject) => {
            request({
                url: consulURL,
                json: true,
                method: 'put',
                body: consulForm
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
    		    resolve(response.statusCode);
                }
            });
        });
    },
    getServerIP: function() {
        return new Promise((resolve, reject) => {
            var ip = "";
            if(os.networkInterfaces().eth0) {
                for(var i = 0; i < os.networkInterfaces().eth0.length; i++) {
                    if(os.networkInterfaces().eth0[i].family == 'IPv4') {
                        ip = os.networkInterfaces().eth0[i].address;
                    }
                }
            }
            if (ip == "") {
                reject(new Error('failed to get eth0 ip'))
            } else {
                resolve(ip)
            }
        });
    }
};

module.exports = util;
