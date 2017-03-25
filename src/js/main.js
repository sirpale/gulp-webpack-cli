var $ = require('jquery');

$.fn.slider = require('ui/slider.js');

$(window).load(function(){
	var slider = $('.banner').slider({
		dots : true,
		fluid:true,
		arrows:true
	});

	$('.slider-arrow').on('click',function(){
		var fn = this.className.split(' ')[1];

		slider.data('slider')[fn]();
	});
});