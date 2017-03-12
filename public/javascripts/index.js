
var $ = function(id) {
	return document.querySelectorAll(id);
};
var passionateMusic = {
	music: null,
	audioContext: null,
	gainNode: null, // 音量
	analyserNode: null, // 音频数据分析
	counter: 0, // 解决未加载完成时候播放多个
	source: null, // 解决同时播放多个音乐
	size: 256, // 
	array: [],
	canvasbox: $("#music-show")[0],
	init: function() {
		var fn = this;
		try {
			fn.audioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)();

		} catch(e) {
			alert("浏览器不支持");
		}
		// 控制音乐
		fn.gainNode = fn.audioContext.createGain();
		fn.gainNode.connect(fn.audioContext.destination);

		// 分析音频
		fn.analyserNode = fn.audioContext.createAnalyser();
		fn.analyserNode.fftSize = fn.size * 2;
		fn.analyserNode.connect(fn.gainNode);

		// 创建canvas;		
		fn.createCanvas();


		// 音乐可视化
		fn.analyser();

		// dom事件处理
		fn.handleEvent();

		
	},
	handleEvent: function() {
		var fn = this;
		var list = $("#music-list li");
		list.forEach(function(item, i) {
			item.onclick = function() {
				for (var j = 0; j < list.length; j++) {
					list[j].className = "";
				}
				this.className = "selected";
				fn.music = this.getAttribute("music-name");
				fn.getmusic();
			}
		});

		$("#volume")[0].onchange = function() {
			var value = this.value;
			fn.changeVolume(value/this.max);
		};
		$("#volume")[0].onchange();

		window.onresize = function() {
			fn.resize();
		};
		fn.resize();
	},
	getmusic: function() {
		var fn = this;
		var xhr = new window.XMLHttpRequest();
		var n = ++fn.counter;
		fn.source && fn.source.stop();
		xhr.abort(); // 取消上次的请求
		xhr.open("GET", "/music/"+fn.music, true);
		xhr.responseType = "arraybuffer";
		xhr.onload = function(){
			console.log(n, fn.counter);
			if (n != fn.counter) return;
			var data = xhr.response;
			var audioContext = fn.audioContext; // 从Visualizer得到最开始实例化的AudioContext用来做解码ArrayBuffer
			var audioBufferSouceNode = fn.audioContext.createBufferSource();
			var analyserNode = fn.analyserNode;
		    audioContext.decodeAudioData(data, function(buffer) { //解码成功则调用此函数，参数buffer为解码后得到的结果
		    		console.log(n, fn.counter);
		    		if (n != fn.counter) return;
				    audioBufferSouceNode.connect(analyserNode);
				    audioBufferSouceNode.buffer = buffer;
				    fn.source = audioBufferSouceNode;
				    audioBufferSouceNode.start(0);
				    
		        }, function(e) { //这个是解码失败会调用的函数
		            console.log("!哎玛，文件解码失败:(");
		    });
			// 成功
		}
		xhr.send();
	},
	analyser: function() { // 分析音频
		var fn = this,
			analyserNode = fn.analyserNode;
		fn.array = new Uint8Array(analyserNode.frequencyBinCount);
		(function animate() {
			window.requestAnimationFrame(animate);
			analyserNode.getByteFrequencyData(fn.array);
			fn.drawMusic();
		//	console.log(fn.array);
		}());
		
	}, 
	changeVolume: function(percent) {
		var fn = this;
		fn.gainNode.gain.value = percent * percent;
	},
	createCanvas: function() { // 绘制
		var fn = this,
			canvas = document.createElement("canvas"),
			box = fn.canvasbox;
		box.appendChild(canvas);
		canvas.width = box.clientWidth,
		canvas.height = box.clientHeight;
		var ctx = canvas.getContext("2d");
		var grad  = ctx.createLinearGradient(0, 0, 0, canvas.height);
		 /* 指定几个颜色 */
	  	grad.addColorStop(0, 'rgb(192, 80, 77)');    // 红
	  	grad.addColorStop(0.5, 'rgb(155, 187, 89)'); // 绿
	  	grad.addColorStop(1, 'rgb(128, 100, 162)');  // 紫
	 	 /* 将这个渐变设置为fillStyle */
	 	
	  	fn.ctx = ctx;
	  	fn.grad = grad;
	  	fn.canvas = canvas;
	  	console.log(fn.canvas.width);
	},
	drawMusic: function() {
		var fn = this;
		var data = fn.array,
			h = fn.canvas.height,
			w = fn.canvas.width,
			ctx = fn.ctx;
			rectPadding = Math.round(w/fn.size);
			dotrect = 0;
		ctx.clearRect(0, 0, w, h);
		data.forEach(function(val, i) {

			ctx.fillRect(rectPadding * i, h-val, rectPadding*0.9, h);
			
			//console.log((h-val) - dotrect);
			if (val && ((h-val) - dotrect) < 30) {
				ctx.fillRect(rectPadding * i, dotrect--, rectPadding*0.9, 10);
			}
			if (((h-val) - dotrect) > 30) {
				ctx.fillRect(rectPadding * i, h - val - 30, rectPadding*0.9, 10);
			}
			ctx.fillStyle = fn.grad;
		});
	},
	resize: function() { // 自适应
		this.canvas.width = this.canvasbox.clientWidth,
		this.canvas.height = this.canvasbox.clientHeight;
	}
};

passionateMusic.init();


 //当前this指代Visualizer对象，赋值给that以以便在其他地方使用
    // var file = "http://m10.music.126.net/20161006143120/87677776ca72d2b338ecfa1b384ee32a/ymusic/7895/bfe8/2cf1/cbc731a78bcccab4760f3300247659ce.mp3", //从Visualizer对象上获取前面得到的文件
    // fr = new FileReader(); //实例化一个FileReader用于读取文件
    // fr.onload = function(e) { //文件读取完后调用此函数
    // 	console.log(e);
    //     var fileResult = e.target.result; //这是读取成功得到的结果ArrayBuffer数据
    // };
    // //将上一步获取的文件传递给FileReader从而将其读取为ArrayBuffer格式
    // fr.readAsArrayBuffer(file);