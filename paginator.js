
var size_buttons_page = 0;
var visible_button_page = 0;

var check_active_page = 0;
var check_active_parent_page = 0;

function check_is_service_page(page_id){
	var result_check = false;
	if(   page_id == 2252 
	   || page_id == 2652 
	   || page_id == 2647 
	   || page_id == 2889)
	{
		result_check = true;
		//console.log(result_check);
	}
	return result_check;
}

$(document).ready(function(event){

	// add class number page
	if($('div').is('.page-filter')){
		add_class_number_page($('.page-filter option:selected').val());
	} else {
		add_class_number_page(12);
	}

	// filter price
	show_filter_price();

	// show navigation panel
	var temp_array = show_name_page();

	// set local variables id_page _ id_parent_page
	check_active_page = temp_array.get('page_id');
	check_active_parent_page = temp_array.get('parent_pageid');

	let active = temp_array.get('page_id');
	let actual = localStorage.getItem('actual_id_page_sku');
	
	// set default filter values
	if(active != actual){

		// set local active button
		set_local_active_button('button_1');

		// add buttons page
		// amount visible buttons
		add_buttons_and_hide_page(4, 8);

		// amount show product to page
		amount_product_page($('.number-amount-search-product'));

		set_local_filter_values();

		// set default values checked 
		$('.producer_i').find('input').each(function(e){ 
			if(this.checked == true){ 
				this.checked = false; 
			} 
		});

		$('.discount_products_list').find('input').each(function(e){ 
			if(this.checked == true){ 
				this.checked = false; 
			} 
		});

		// set default local storage - show_block_filter_price
		if(localStorage.getItem('actual_page_sku') == 'is_page_child')
			localStorage.setItem('show_block_filter_price', 'hide');

	} else {

		var event_name              = 'filter_price';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = localStorage.getItem('select_rating_product');
		var select_amount_page      = localStorage.getItem('select_amount_page');
		var select_discount_product = localStorage.getItem('select_discount_product');
		var select_producer_product = localStorage.getItem('select_producer_product');
		var show_block_price        = localStorage.getItem('show_block_filter_price');
		var min    	                = localStorage.getItem('min_filter_price');
		var max    	                = localStorage.getItem('max_filter_price');

		$.ajax({
	        url:"/wp-admin/admin-ajax.php",   
	        type:"POST", 
	        data:{
	        	action:'my_action_select_product', 
	        	select_rating_sort: select_rating_product,
	        	event_name: event_name,
	        	cat_name: cat_name,
	        	min_send: min,
	        	max_send: max
	        },
	        beforeSend: function(){

	        	if($(window).width() < 992)
	        		$('html, body').animate({scrollTop: 0});

	        	$('.overlay-content-product').css('display', 'block');
	        	$('.overlay-content-product').animate({opacity: 1}, 700);
	        	$('.spinner-kub').css('display', 'block');
	        	$('.spinner-kub').animate({opacity: 1}, 700);
	        	
	        }, 
	        success:function(data){

	            remove_product_content();
	            remove_buttons();

	            $('#products_content').html(data);

	            var checked_select_discount = select_discount_product == 'true' ? true : false;
	            var array_producers_checked = select_producer_product.split(',');

	            // sorted producer product
	            $('.producer_i').find('input').each(function(e){ 
	            	if(check_contains_name($(this).val(), array_producers_checked)){
	            		$(this).prop('checked', true);
	            		$(this).trigger('change');
	            	}
	            });

	            // sorted discount product
	            if(checked_select_discount){
	            	$('.discount_products_list').find('input').each(function(e){ 
	            		if(!this.checked){ 
	            			$(this).prop('checked', true);
	            			$(this).trigger('change');
	            		} 
	            	});
	            }

	            // filter price
				update_filter_price_with_local(min, max);

				// amount show product to page
				amount_product_page($('.number-amount-search-product'));

	            // sort-filter																
	            $('.sort-filter').find('select').val(select_rating_product);

	            // amount page
	            $('.page-filter').find('select').val(select_amount_page).trigger('change');

	    	},
	    	error : function(xhr, textStatus, errorThrown ) {
		        if (textStatus == 'timeout') {
		            this.tryCount++;
		            if (this.tryCount <= this.retryLimit) {
		                //try again
		                $.ajax(this);
		                return;
		            }            
		            return;
		        }
		        if (xhr.status == 500) {
		            //handle error
		        } else {
		            //handle error
		        }
		    }
		}).done(function(){

			if(isNaN(parseInt(check_active_parent_page))){

				$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
					$('.spinner-kub').css('display', 'none');
				});
				$('.overlay-content-product').css('display', 'none');
				$('.overlay-content-product').animate({opacity: 0}, 500);

				//console.log('test');

			}

		});
		

		// set default local storage active button
		$('#filter_navigation').on('click', function(event){ set_local_active_button('button_1'); });
		$('.store-filter').on('click', function(event){      set_local_active_button('button_1'); });

		// show or hide block filter price
		if(localStorage.getItem('show_block_filter_price') == 'show'){
				append_change_price(min, max);
		}

		// show or hide block discounter price
		if(localStorage.getItem('select_discount_product') == 'true'){
				append_change_discounter();
		}	

	}

	$('.sort-filter').find('select').on('change', function(e){

		// [0] select_filter_price 
		// [1] select_amount_page 
		// [2] select_rating_product 
		// [3] select_discount_product
		// [4] select_producer_product
		var array_selected = initial_filter_selects();

		var event_name              = 'sort_filter';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = array_selected[2];
		var select_amount_page      = array_selected[1];
		var select_discount_product = array_selected[3];
		var select_producer_product = array_selected[4];
		var values_filter_price     = array_selected[0];
		var min    	                = values_filter_price[0];
		var max    	                = values_filter_price[1];

	    $.ajax({
	        url:"/wp-admin/admin-ajax.php",   
	        type:"POST", 
	        data:{
	        	action:'my_action_select_product', 
	        	event_name: event_name,
	        	select_rating_sort: select_rating_product,
	        	cat_name: cat_name,
	        	min_send: min,
	        	max_send: max
	        },
	        beforeSend: function(){
	        	$('.overlay-content-product').css('display', 'block');
	        	$('.overlay-content-product').animate({opacity: .7}, 500);
	        	$('.spinner-kub').css('display', 'block');
	        	$('.spinner-kub').animate({opacity: 1}, 500);

	        }, 
	        success:function(data){

	            remove_product_content();
	            remove_buttons();

	            $('#products_content').html(data);

	            // sorted producer product
	            sorted_product_producers(select_discount_product);

	            // sorted discount product
	            sorted_product_discount(select_producer_product);

	            add_class_number_page(select_amount_page);

	            // filter price
				update_filter_price();

	            add_buttons_and_hide_page(4, 8);

	            // amount show product to page
				amount_product_page($('.number-amount-search-product'));

	    	},
	    	error : function(xhr, textStatus, errorThrown ) {
		        if (textStatus == 'timeout') {
		            this.tryCount++;
		            if (this.tryCount <= this.retryLimit) {
		                //try again
		                $.ajax(this);
		                return;
		            }            
		            return;
		        }
		        if (xhr.status == 500) {
		            //handle error
		        } else {
		            //handle error
		        }
		    }
		}).done(function(){
			$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
				$('.spinner-kub').css('display', 'none');
			});
			$('.overlay-content-product').css('display', 'none');
			$('.overlay-content-product').animate({opacity: 0}, 500);

			// set values filter page sku
			set_local_filter_values();

		});

	});


	$('.page-filter').find('select').on('change', function(e){

		// [0] select_filter_price 
		// [1] select_amount_page 
		// [2] select_rating_product 
		// [3] select_discount_product
		// [4] select_producer_product
		var array_selected = initial_filter_selects();

		var event_name              = 'page_filter';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = array_selected[2];
		var select_amount_page      = array_selected[1];
		var select_discount_product = array_selected[3];
		var select_producer_product = array_selected[4];
		var values_filter_price     = array_selected[0];
		var min    	                = values_filter_price[0];
		var max    	                = values_filter_price[1];

	    $.ajax({
	        url:"/wp-admin/admin-ajax.php",   
	        type:"POST", 
	        data:{
	        	action:'my_action_select_product', 
	        	event_name: event_name,
	        	select_rating_sort: select_rating_product,
	        	cat_name: cat_name,
	        	min_send: min,
	        	max_send: max
	        },
	        beforeSend: function(){
	        	$('.overlay-content-product').css('display', 'block');
	        	$('.overlay-content-product').animate({opacity: 1}, 500);
	        	$('.spinner-kub').css('display', 'block');
	        	$('.spinner-kub').animate({opacity: 1}, 500);

	        }, 
	        success:function(data){

	            remove_product_content();
	            remove_buttons();

	            $('#products_content').html(data);

	            // sorted producer product
	            sorted_product_producers(select_discount_product);

	            // sorted discount product
	            sorted_product_discount(select_producer_product);

	            add_class_number_page(select_amount_page);

	            // filter price
				update_filter_price();

				// check correct view filter price 
				check_correct_change_block_price();

	            add_buttons_and_hide_page(4, 8);

	            // amount show product to page
				amount_product_page($('.number-amount-search-product'));

	    	},
	    	error : function(xhr, textStatus, errorThrown ) {
		        if (textStatus == 'timeout') {
		            this.tryCount++;
		            if (this.tryCount <= this.retryLimit) {
		                //try again
		                $.ajax(this);
		                return;
		            }            
		            return;
		        }
		        if (xhr.status == 500) {
		            //handle error
		        } else {
		            //handle error
		        }
		    }
		}).done(function(){
			$('.spinner-kub').animate({opacity: 0}, 1500, function(){ 
				$('.spinner-kub').css('display', 'none');
			});
			$('.overlay-content-product').css('display', 'none');
			$('.overlay-content-product').animate({opacity: 0}, 1500);

			// set values filter page sku
			set_local_filter_values();

		});

	});

	// producer filter products
	$('.producer_i').find('input').on('change', function(e){ 

		// [0] select_filter_price 
		// [1] select_amount_page 
		// [2] select_rating_product 
		// [3] select_discount_product
		// [4] select_producer_product
		var array_selected = initial_filter_selects();

		var event_name              = 'filter_price';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = array_selected[2];
		var select_amount_page      = array_selected[1];
		var select_discount_product = array_selected[3];
		var select_producer_product = array_selected[4];
		var values_filter_price     = array_selected[0];
		var min    	                = values_filter_price[0];
		var max    	                = values_filter_price[1];

		// clear hover mobile
		if(this.checked == false && $(window).width() < 992){
			//console.log($($($(this).next())[0]));
			$($($(this).next())[0]).removeClass('default'); 
			$($($(this).next())[0]).addClass('clear-checkbox'); // .clear-checkbox
		} else if(this.checked == true && $(window).width() < 992){
			$($($(this).next())[0]).removeClass('clear-checkbox');
			$($($(this).next())[0]).addClass('default'); 
		}

		sorted_product_producers(select_discount_product);

		remove_class_number_page();

		add_class_number_page(select_amount_page);

		remove_buttons();

		// filter price
		update_filter_price();

		// add buttons page
		// amount visible buttons
		add_buttons_and_hide_page(4, 8);

		// amount show product to page
		amount_product_page($('.number-amount-search-product'));

		//show change producer
		append_change_producer(select_producer_product);

		// set values filter page sku
		set_local_filter_values();

		// clear show block change producers
		if(select_producer_product.length == 0){

			if($(window).width() > 992){
				$('#show_change_products').hide();
			} else {
				$('#show_change_products_sm').hide();
			}
			//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 200px)', 'max-height' : 'calc(100vh - 200px)'});
		}

	});

	// close show block change producers - lg
	$('#show_change_products').on('click', function(e){

		var item       = e.target;
		var click_item = e.target.innerText;
		$('.producer_i').find('input').each(function(e){ 
			if(this.checked == true && $(this).val() == click_item){ 
				this.checked = false;
				$(item).empty();
				var check_empty_block = true;
				$('#show_change_products').find('span').each(function(e){
					if($(this)[0].innerText.length == 0){ $(this).css('display', 'none'); }
					if($(this)[0].innerText.length > 0){ check_empty_block = false; }
				});
				if(check_empty_block){
					$('#show_change_products').hide();
					if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 200px)',
											   					 							 'max-height' : 'calc(100vh - 200px)'});
				}
				$('.producer_i').find('input').each(function(event){
					if($(this).val() == click_item){
						$(this).trigger('change');
					}
				});
			} 
		});

	});

	// close show block change producers - sm
	$('#show_change_products_sm').on('click', function(e){

		var item       = e.target;
		var click_item = e.target.innerText;
		$('.producer_i').find('input').each(function(e){ 
			if(this.checked == true && $(this).val() == click_item){ 
				this.checked = false;
				$(item).empty();
				var check_empty_block = true;
				$('#show_change_products_sm').find('span').each(function(e){
					if($(this)[0].innerText.length == 0){ $(this).css('display', 'none'); }
					if($(this)[0].innerText.length > 0){ check_empty_block = false; }
				});
				if(check_empty_block){
					$('#show_change_products_sm').hide();
					//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 200px)', 'max-height' : 'calc(100vh - 200px)'});
				}
				$('.producer_i').find('input').each(function(event){
					if($(this).val() == click_item){
						$(this).trigger('change');
					}
				});
			} 
		});

	});

	$('.discount_products_list').find('input').on('change', function(e){ 

		// [0] select_filter_price 
		// [1] select_amount_page 
		// [2] select_rating_product 
		// [3] select_discount_product
		// [4] select_producer_product
		var array_selected = initial_filter_selects();

		var event_name              = 'filter_price';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = array_selected[2];
		var select_amount_page      = array_selected[1];
		var select_discount_product = array_selected[3];
		var select_producer_product = array_selected[4];
		var values_filter_price     = array_selected[0];
		var min    	                = values_filter_price[0];
		var max    	                = values_filter_price[1];

		// clear hover mobile
		if(this.checked == false && $(window).width() < 992){
			//console.log($($($(this).next())[0]));
			$($($(this).next())[0]).removeClass('default'); 
			$($($(this).next())[0]).addClass('clear-checkbox'); // .clear-checkbox
		} else if(this.checked == true && $(window).width() < 992){
			$($($(this).next())[0]).removeClass('clear-checkbox');
			$($($(this).next())[0]).addClass('default'); 
		}

		sorted_product_discount(select_producer_product);

		remove_class_number_page();

		add_class_number_page(select_amount_page); 

		remove_buttons();

		// filter price
		update_filter_price();

		// add buttons page
		// amount visible buttons
		add_buttons_and_hide_page(4, 8);

		// amount show product to page
		amount_product_page($('.number-amount-search-product'));

		// show change block discounter products
		if(this.checked == true){
			append_change_discounter();
		} else if(this.checked == false){
			if($(window).width() > 992){
				$('#show_change_discounter').hide();
			} else {
				$('#show_change_discounter_sm').hide();
			}
		}

		// set values filter page sku
		set_local_filter_values();

	});

	// close show block change discounter - lg
	$('#show_change_discounter').on('click', function(e){

		var item       = e.target;
		var click_item = e.target.innerText;
		$('.discount_products_list').find('input').each(function(e){ 
			if(this.checked == true){ 
				this.checked = false;
				$(item).empty();
				var check_empty_block = true;
				$('#show_change_discounter').find('span').each(function(e){
					if($(this)[0].innerText.length == 0){ $(this).css('display', 'none'); }
					if($(this)[0].innerText.length > 0){ check_empty_block = false; }
				});
				if(check_empty_block){
					$('#show_change_discounter').hide();
					//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 200px)',
					//						   					 							 'max-height' : 'calc(100vh - 200px)'});
				}
				$('.discount_products_list').find('input').trigger('change');
			} 
		});

	});

	// close show block change discounter - sm
	$('#show_change_discounter_sm').on('click', function(e){

		var item       = e.target;
		var click_item = e.target.innerText;
		$('.discount_products_list').find('input').each(function(e){ 
			if(this.checked == true){ 
				this.checked = false;
				$(item).empty();
				var check_empty_block = true;
				$('#show_change_discounter_sm').find('span').each(function(e){
					if($(this)[0].innerText.length == 0){ $(this).css('display', 'none'); }
					if($(this)[0].innerText.length > 0){ check_empty_block = false; }
				});
				if(check_empty_block){
					$('#show_change_discounter_sm').hide();
					//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 200px)',
					//						   					 							 'max-height' : 'calc(100vh - 200px)'});
				}
				$('.discount_products_list').find('input').trigger('change');
			} 
		});
		
	});

	// change price-slider 
	if($('button').is('#button_filter_price')){
		document.getElementById('price-slider').noUiSlider.on('change', function(event){

			// [0] select_filter_price 
			// [1] select_amount_page 
			// [2] select_rating_product 
			// [3] select_discount_product
			// [4] select_producer_product
			var array_selected = initial_filter_selects();

			var event_name              = 'filter_price';	
			var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
			var select_rating_product   = array_selected[2];
			var select_amount_page      = array_selected[1];
			var select_discount_product = array_selected[3];
			var select_producer_product = array_selected[4];
			var values_filter_price     = array_selected[0];
			var min    	                = values_filter_price[0];
			var max    	                = values_filter_price[1];

			//console.log('min: ' + min + ' max: ' + max);
			//console.log(select_rating_product);

			$.ajax({
		        url:"/wp-admin/admin-ajax.php",   
		        type:"POST", 
		        data:{
		        	action:'my_action_select_product', 
		        	select_rating_sort: select_rating_product,
		        	event_name: event_name,
		        	cat_name: cat_name,
		        	min_send: min,
		        	max_send: max
		        },
		        beforeSend: function(){
		        	$('.overlay-content-product').css('display', 'block');
		        	$('.overlay-content-product').animate({opacity: .7}, 500);
		        	$('.spinner-kub').css('display', 'block');
		        	$('.spinner-kub').animate({opacity: 1}, 500);

		        }, 
		        success:function(data){

		            remove_product_content();
		            remove_buttons();

		            $('#products_content').html(data);

		            // sorted producer product
		            sorted_product_producers(select_discount_product);

		            // sorted discount product
		            sorted_product_discount(select_producer_product);

		            add_class_number_page(select_amount_page);

		            // filter price
					//update_filter_price();

		            add_buttons_and_hide_page(4, 8);

		            // amount show product to page
					amount_product_page($('.number-amount-search-product'));

					// show change block price filter
					append_change_price(min, max);

					// check correct view filter price 
					check_correct_change_block_price();
					

		    	},
		    	error : function(xhr, textStatus, errorThrown ) {
			        if (textStatus == 'timeout') {
			            this.tryCount++;
			            if (this.tryCount <= this.retryLimit) {
			                //try again
			                $.ajax(this);
			                return;
			            }            
			            return;
			        }
			        if (xhr.status == 500) {
			            //handle error
			        } else {
			            //handle error
			        }
			    }
			}).done(function(){
				$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
					$('.spinner-kub').css('display', 'none');
				});
				$('.overlay-content-product').css('display', 'none');
				$('.overlay-content-product').animate({opacity: 0}, 500);

				// set values filter page sku
				set_local_filter_values();

			});

		});
	}

	// close block change price filter
	$('#show_change_price, #show_change_price_sm').on('click', function(event){
		document.getElementById('price-slider').noUiSlider.reset();
		
		// [0] select_filter_price 
		// [1] select_amount_page 
		// [2] select_rating_product 
		// [3] select_discount_product
		// [4] select_producer_product
		var array_selected = initial_filter_selects();

		var event_name              = 'filter_price';	
		var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
		var select_rating_product   = array_selected[2];
		var select_amount_page      = array_selected[1];
		var select_discount_product = array_selected[3];
		var select_producer_product = array_selected[4];
		var values_filter_price     = array_selected[0];
		var min    	                = values_filter_price[0];
		var max    	                = values_filter_price[1];

		//console.log('min: ' + min + ' max: ' + max);
		//console.log(select_rating_product);

		$.ajax({
	        url:"/wp-admin/admin-ajax.php",   
	        type:"POST", 
	        data:{
	        	action:'my_action_select_product', 
	        	select_rating_sort: select_rating_product,
	        	event_name: event_name,
	        	cat_name: cat_name,
	        	min_send: min,
	        	max_send: max
	        },
	        beforeSend: function(){
	        	$('.overlay-content-product').css('display', 'block');
	        	$('.overlay-content-product').animate({opacity: .7}, 500);
	        	$('.spinner-kub').css('display', 'block');
	        	$('.spinner-kub').animate({opacity: 1}, 500);

	        }, 
	        success:function(data){

	            remove_product_content();
	            remove_buttons();

	            $('#products_content').html(data);

	            // sorted producer product
	            sorted_product_producers(select_discount_product);

	            // sorted discount product
	            sorted_product_discount(select_producer_product);

	            add_class_number_page(select_amount_page);

	            // filter price
				update_filter_price();

	            add_buttons_and_hide_page(4, 8);

	            // amount show product to page
				amount_product_page($('.number-amount-search-product'));

	    	},
	    	error : function(xhr, textStatus, errorThrown ) {
		        if (textStatus == 'timeout') {
		            this.tryCount++;
		            if (this.tryCount <= this.retryLimit) {
		                //try again
		                $.ajax(this);
		                return;
		            }            
		            return;
		        }
		        if (xhr.status == 500) {
		            //handle error
		        } else {
		            //handle error
		        }
		    }
		}).done(function(){
			$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
				$('.spinner-kub').css('display', 'none');
			});
			$('.overlay-content-product').css('display', 'none');
			$('.overlay-content-product').animate({opacity: 0}, 500);

			// set values filter page sku
			set_local_filter_values();

			// close block price filter
			if($(window).width() > 992){
				$('#show_change_price').hide();
			} else {
				$('#show_change_price_sm').hide();
			}
			localStorage.setItem('show_block_filter_price', 'hide');

		});

	});

	// price filter
	if($('button').is('#button_filter_price')){
		document.querySelector('#button_filter_price').addEventListener('click', function(e){

			// [0] select_filter_price 
			// [1] select_amount_page 
			// [2] select_rating_product 
			// [3] select_discount_product
			// [4] select_producer_product
			var array_selected = initial_filter_selects();

			var event_name              = 'filter_price';	
			var cat_name                = parseInt($('#products_content').attr('rel')).toString() == "NaN" ? check_active_page : $('#products_content').attr('rel');			
			var select_rating_product   = array_selected[2];
			var select_amount_page      = array_selected[1];
			var select_discount_product = array_selected[3];
			var select_producer_product = array_selected[4];
			var values_filter_price     = array_selected[0];
			var min    	                = values_filter_price[0];
			var max    	                = values_filter_price[1];

			//console.log('min: ' + min + ' max: ' + max);
			//console.log(select_rating_product);

			$.ajax({
		        url:"/wp-admin/admin-ajax.php",   
		        type:"POST", 
		        data:{
		        	action:'my_action_select_product', 
		        	select_rating_sort: select_rating_product,
		        	event_name: event_name,
		        	cat_name: cat_name,
		        	min_send: min,
		        	max_send: max
		        },
		        beforeSend: function(){
		        	$('.overlay-content-product').css('display', 'block');
		        	$('.overlay-content-product').animate({opacity: .7}, 500);
		        	$('.spinner-kub').css('display', 'block');
		        	$('.spinner-kub').animate({opacity: 1}, 500);

		        }, 
		        success:function(data){

		            remove_product_content();
		            remove_buttons();

		            $('#products_content').html(data);

		            // sorted producer product
		            sorted_product_producers(select_discount_product);

		            // sorted discount product
		            sorted_product_discount(select_producer_product);

		            add_class_number_page(select_amount_page);

		            // filter price
					update_filter_price();

		            add_buttons_and_hide_page(4, 8);

		            // amount show product to page
					amount_product_page($('.number-amount-search-product'));

					// show change block price filter
					append_change_price(min, max);
					

		    	},
		    	error : function(xhr, textStatus, errorThrown ) {
			        if (textStatus == 'timeout') {
			            this.tryCount++;
			            if (this.tryCount <= this.retryLimit) {
			                //try again
			                $.ajax(this);
			                return;
			            }            
			            return;
			        }
			        if (xhr.status == 500) {
			            //handle error
			        } else {
			            //handle error
			        }
			    }
			}).done(function(){
				$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
					$('.spinner-kub').css('display', 'none');
				});
				$('.overlay-content-product').css('display', 'none');
				$('.overlay-content-product').animate({opacity: 0}, 500);

				// set values filter page sku
				set_local_filter_values();

			});


		});
	}

	// Listen to keydown events on the input field
	$('#input-with-keypress-0, #input-with-keypress-1').on('change', function (e) { 

		var min_price = parseInt($('#input-with-keypress-0').val());
		var max_price = parseInt($('#input-with-keypress-1').val());

		document.getElementById('price-slider').noUiSlider.updateOptions({
			start: [ min_price, max_price ]
		});

	});

	// reset filters 
	$('#reset_filter').on('click', function(e){
		reset_filters();
	});

	// add buttons page 
	document.querySelector('#button_pages').addEventListener('click', function(e){
		var amount_buttons = this.children.length - 2;
		var prev_button    = e.target.id.split('_')[0] + '_' + (e.target.id.split('_')[1] - 1);
		var next_button    = e.target.id.split('_')[0] + '_' + ((e.target.id.split('_')[1]++) + 1);
		var last_point     = 'points_' + (amount_buttons - 1);

		if(!$('#button_pages').is('#' + e.target.id) && e.target.id.split('_')[0] == 'button'){
			clear_input_checked();
			for(var i = 0; i < this.children.length; i++){
				var active = document.getElementById(e.target.id);
				var other  = document.getElementById(this.children[i].id);
				if(other.id.split('_')[0] == 'button'){
					//console.log(active.id + ' ... ' + other.id.split('_')[0]);
					active_button_page(active.id, other.id);
					var check_prev_next_button = false;
					if($(window).width() < 992) {
						check_prev_next_button = true;
					} else {
						if(e.target.id.split('_')[1] > visible_button_page - 2){
							check_prev_next_button = true;
						} else if($('#' + prev_button).css('display') == 'none'){
							check_prev_next_button = false;
							if(e.target.id.split('_')[1] < visible_button_page) {
								$('#' + this.children[i].id).css('display', '');
								//console.log(this.children[i].id);
							}
						} else if(e.target.id.split('_')[1] == 1 || e.target.id.split('_')[1] == visible_button_page){
							check_prev_next_button = false;
							if(this.children[i].id.split('_')[1] < visible_button_page) {
								if($('#' + this.children[i].id).css('display', 'none')) $('#' + this.children[i].id).css('display', '');
								if($('#points_1').css('display', 'block')) $('#points_1').css('display', 'none');
								if($('#' + last_point).css('display', 'none') && amount_buttons > visible_button_page) $('#' + last_point).css('display', 'block');
							} else {
								if($('#' + this.children[i].id).css('display', 'block') && this.children[i].id.split('_')[1] != amount_buttons) {
									$('#' + this.children[i].id).css('display', 'none');
								}
								//console.log(this.children[i].id);
							}
						}
					}

					if(amount_buttons > visible_button_page && check_prev_next_button){
						hide_show_button(active.id, visible_button_page, other.id, this.children.length);
					}
				}
				if(e.target.value == this.children[i].value){
					$('#' + this.children[i].value).show();
				} else {
					$('#' + this.children[i].value).hide();
				}
			}
			show_active_page(e.target.id.split('_')[1], amount_buttons, 'products_content');
			$('html, body').animate({scrollTop: 0}, 400);
		}

		// set local active button
		set_local_active_button(e.target.id);

	});

});

function check_correct_change_block_price(){

	var current_val_slider = document.getElementById('price-slider').noUiSlider.get();
	var current_min_price  = parseInt($('#input-with-keypress-0').val());
	var current_max_price  = parseInt($('#input-with-keypress-1').val());

	//console.log($($('#price-slider').find('.noUi-connect')).css('left'));
	//console.log($($('#price-slider').find('.noUi-connect')).css('right'));

	if($($('#price-slider').find('.noUi-connect')).css('left') == '0px' 
	   && $($('#price-slider').find('.noUi-connect')).css('right') == '0px')
	{
		$('#show_change_price').hide();
		localStorage.setItem('show_block_filter_price', 'hide');
		//console.log('test');
	}
	

}

function append_change_producer(array_change_producers){
	// show block
	if($('#show_change_products').css('display') == 'none'
	|| $('#show_change_products_sm').css('display') == 'none') 
	{
		if($(window).width() > 992){
			$('#show_change_products').show();
		} else {
			$('#show_change_products_sm').show();
		}
		//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 240px)', 'max-height' : 'calc(100vh - 240px)'});
	}
	// remove span
	if($(window).width() > 992){
		$('#show_change_products').find('span').remove();
	} else {
		$('#show_change_products_sm').find('span').remove();
	}
	// append span
	for(var i = 0; i < array_change_producers.length; i++){
		if($(window).width() > 992){
			$('#show_change_products').append('<span>' + array_change_producers[i] + '<i class="fas fa-times"></i></span>');
		} else {
			$('#show_change_products_sm').append('<span>' + array_change_producers[i] + '<i class="fas fa-times"></i></span>');
		}
	}
}

function append_change_discounter(){
	// show block
	if($('#show_change_discounter').css('display') == 'none'
	|| $('#show_change_discounter_sm').css('display') == 'none') 
	{
		if($(window).width() > 992){
			$('#show_change_discounter').show();
		} else {
			$('#show_change_discounter_sm').show();
		}
		//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 240px)', 'max-height' : 'calc(100vh - 240px)'});

	}
	// remove block
	if($(window).width() > 992){
		$('#show_change_discounter').find('span').remove();
	} else {
		$('#show_change_discounter_sm').find('span').remove();
	}
	
	// append block
	if($(window).width() > 992){
		$('#show_change_discounter').append('<span>Товары со скидкой<i class="fas fa-times"></i></span>');
	} else {
		$('#show_change_discounter_sm').append('<span>Товары со скидкой<i class="fas fa-times"></i></span>');
	}
	
}

function append_change_price(min, max){
	// show block
	if($('#show_change_price').css('display') == 'none'
	|| $('#show_change_price_sm').css('display') == 'none') 
	{
		if($(window).width() > 992){
			$('#show_change_price').show();
		} else {
			$('#show_change_price_sm').show();
		}
		
		// set loacal storage
		localStorage.setItem('show_block_filter_price', 'show');

		//if($(window).width() < 992) $('.filter-menu-nav .filter-menu-list').css({'height': 'calc(100vh - 240px)', 'max-height' : 'calc(100vh - 240px)'});

	}

	// remove block
	if($(window).width() > 992){
		$('#show_change_price').find('span').remove();
	} else {
		$('#show_change_price_sm').find('span').remove();
	}
	
	// append block
	if($(window).width() > 992){
		$('#show_change_price').append('<span>Цена от ' + min + ' до ' + max + '<i class="fas fa-times"></i></span>');
	} else {
		$('#show_change_price_sm').append('<span>Цена от ' + min + ' до ' + max + '<i class="fas fa-times"></i></span>');
	}
	
}

function reset_filters(){

	$('.producer_i').find('input').each(function(e){ 
		if(this.checked == true){ 
			this.checked = false; 
		} 
	});

	$('.discount_products_list').find('input').each(function(e){ 
		if(this.checked == true){ 
			this.checked = false; 
		} 
	});

	// remove block sm
	$('#show_change_products_sm').find('span').remove();
	$('#show_change_discounter_sm').find('span').remove();
	$('#show_change_price_sm').find('span').remove();

	// set display none
	if($('#show_change_products_sm').css('display') != 'none'
	|| $('#show_change_discounter_sm').css('display') != 'none') 
	{
		$('#show_change_products_sm').hide();
		$('#show_change_discounter_sm').hide();
	}

	// click button price close method
	$('#show_change_price_sm').trigger('click');

}

function initial_filter_selects(){

	var select_filter_price     = $('div').is('#price-slider') ? document.getElementById('price-slider').noUiSlider.get() : 0; //console.log(select_filter_price);
	var select_amount_page      = $('.page-filter option:selected').val();
	var select_rating_product   = $('.sort-filter').find('option:selected').val();
	var select_discount_product = $('div').is('.filter-menu-list') ? $('#chekbox_discount_sku')[0].checked : false;  //console.log(select_discount_product);
	var select_producer_product = [];
	$($('.producers_product').find('li')).find('input').each(function(e){
		if($(this)[0].checked){
			select_producer_product.push($(this)[0].value);
		}
	});

	// set true if this discounter page 
	if(check_active_page == 3176){
		select_discount_product = true;
	}

	var array_filters = [ select_filter_price, 
						  select_amount_page, 
						  select_rating_product, 
						  select_discount_product,
						  select_producer_product ];

	return array_filters;

}

// set values filter page sku
function set_local_filter_values(){

	// [0] select_filter_price 
	// [1] select_amount_page 
	// [2] select_rating_product 
	// [3] select_discount_product
	// [4] select_producer_product
	var array_selected               = initial_filter_selects();
			
	var select_rating_product        = array_selected[2];
	var select_amount_page           = array_selected[1];
	var select_discount_product      = array_selected[3];
	var select_producer_product      = array_selected[4];
	var values_filter_price          = array_selected[0];
	var min    	                     = values_filter_price[0];
	var max    	                     = values_filter_price[1];

	// local variables
	var active_page_id               = localStorage.getItem('active_page'); 
	var actual_values_filter_page_id = localStorage.getItem('actual_id_page_sku');
	var flag_page_sku                = localStorage.getItem('actual_page_sku');

	if(flag_page_sku == 'is_page_child' 
	   && select_rating_product != undefined
	   && select_amount_page != undefined
	   && !isNaN(min)
	   && !isNaN(max))
	{
		localStorage.setItem('actual_id_page_sku',      active_page_id);
		localStorage.setItem('select_rating_product',   select_rating_product);
		localStorage.setItem('select_amount_page',      select_amount_page);

		// set true if this discounter page 
		if(check_active_page != 3176){
			localStorage.setItem('select_discount_product', select_discount_product);
		} else if(check_active_page == 3176){
			localStorage.setItem('select_discount_product', true);
		}
		
		localStorage.setItem('select_producer_product', select_producer_product);
		localStorage.setItem('min_filter_price',        min);
		localStorage.setItem('max_filter_price',        max);

		//console.log("select discounter " + active_page_id);

	}

}

// set local storage active button
function set_local_active_button(id_active_button){
	if(localStorage.getItem('actual_page_sku') == 'is_page_child'){
		localStorage.setItem('active_button_actual_page', id_active_button);
	}	
}

// filter price product page 
function show_filter_price(){

	if (document.getElementById('price-slider')) {

		var start_price = min_price_product_list(true);
		var end_price   = max_price_product_list(true);

		if(start_price != end_price){
			
			create_noUslider(start_price, end_price, document.getElementById('price-slider'));
			document.getElementById('price-slider').removeAttribute('disabled');

		} else {

			start_price = 1;
			create_noUslider(start_price, end_price, document.getElementById('price-slider'));
			document.getElementById('price-slider').setAttribute('disabled', true);

		}

	}
}

function update_filter_price_with_local(min, max){

	if($('div').is('#price-slider')){
		document.getElementById('price-slider').noUiSlider.updateOptions({
			start: [ min, max ],
		});

	}
}

function update_filter_price(){

	if (document.getElementById('price-slider')) {

		var update_start_price = min_price_product_list(false);
		var update_end_price   = max_price_product_list(false);

		if(isNaN(update_start_price) || isNaN(update_end_price)){
			
			//document.getElementById('price-slider').noUiSlider.updateOptions({
			//	start: [ 0, 0 ],
			//});
			document.getElementById('price-slider').setAttribute('disabled', true);

		} else if(update_start_price != update_end_price || (update_start_price + update_end_price) > 5 ){

			document.getElementById('price-slider').noUiSlider.updateOptions({
				start: [ update_start_price, update_end_price ],
			});

			// show change block price filter
			//if($(window).width() > 992){
			//	append_change_price(update_start_price, update_end_price);
			//}

			document.getElementById('price-slider').removeAttribute('disabled');
			//document.getElementById('price-slider').noUiSlider.reset();

		} else {

			update_start_price = 1;
			document.getElementById('price-slider').noUiSlider.updateOptions({
				start: [ update_start_price, update_end_price ],
			});
			//$('#show_change_price').hide();
			document.getElementById('price-slider').setAttribute('disabled', true);

		}
	}

}

function create_noUslider(start_price, end_price, id_container_filter){

	var input0 = document.getElementById('input-with-keypress-0');
	var input1 = document.getElementById('input-with-keypress-1');
	var inputs = [input0, input1];

	noUiSlider.create( id_container_filter, {
		start: [ start_price, end_price ],
		connect: true,
		tooltips: [true, true],
		format: {
			to: function(value) {
		  	return value.toFixed(0);
		},
			from: function(value) {
		  	return value
		}
		},
		range: {
			'min': start_price,
			'max': end_price
		}
	});

	id_container_filter.noUiSlider.on('update', function (values, handle) {
	    inputs[handle].value = values[handle];
	});

}

function remove_product_content(){
	$('#products_content').each(function(event){
		//console.log($(this)[0].children);
		$($(this)[0].children).remove();
	});
}

function clear_filter(){
	// producer filter products
	$('.producer_i').find('input').each(function(e){
		
		if(this.checked == true){
			this.checked = false;
		}
	});

	// discount products filter 
	$('.discount_products_list').find('input').each(function(e){
		
		if(this.checked == true){
			this.checked = false;
			check_discount_product = false;
		}
	});

}

function add_buttons_and_hide_page(amount_visible_sm_buttons, amount_visible_lg_buttons){

	$(document).ready(function(){
		// add buttons page
		// amount visible buttons
		if($(window).width() < 992){
			visible_button_page = amount_visible_sm_buttons;
		} else {
			visible_button_page = amount_visible_lg_buttons;
		}
		$(window).resize(function(){
			if($(window).width() < 992){
				visible_button_page = amount_visible_sm_buttons;
			} else {
				visible_button_page = amount_visible_lg_buttons;
			}
		});

		add_buttons_page(size_buttons_page);
		hide_page(size_buttons_page);

		// set active page with local storage active button
		var active_button_id_local  = localStorage.getItem('active_button_actual_page');
		if($('#container_button_change_page').css('display') == 'block'){
	    	$('#' + active_button_id_local).click();
	    }

		if($(window).width() < 992){
			$('#button_pages').find('button').removeClass('btn-lg');
			//$('#button_pages').find('button').addClass('btn-sm');
			$('#button_pages').find('span').css({top: '15px',
												fontSize: '12px',
												letterSpacing: '1px',
												fontWeight: 'bold',
												right: '3px',
												marginRight: '1px',
												marginLeft: '1px' });
		} else { 
			$('#button_pages').find('button').addClass('btn-lg');
			//$('#button_pages').find('button').removeClass('btn-sm');
			$('#button_pages').find('span').css({top: '15px',
												fontSize: '18px',
												fontWeight: 'bold',
												right: '4px',
												marginRight: '3px',
												marginLeft: '3px' });
		}
		$(window).resize(function(){
			if($(window).width() < 992){
				$('#button_pages').find('button').removeClass('btn-lg');
				//$('#button_pages').find('button').addClass('btn-sm');
				$('#button_pages').find('span').css({top: '15px',
													fontSize: '12px',
													letterSpacing: '1px',
													fontWeight: 'bold',
													right: '3px',
													marginRight: '1px',
													marginLeft: '1px' });
			} else {
				$('#button_pages').find('button').addClass('btn-lg');
				//$('#button_pages').find('button').removeClass('btn-sm');
				$('#button_pages').find('span').css({top: '15px',
													fontSize: '18px',
													fontWeight: 'bold',
													right: '4px',
													marginRight: '3px',
													marginLeft: '3px' });
			}
		});
	});
}

function add_class_number_page(amount_products_page){
	var amount_product_page  = amount_products_page;
	var number_page = 0;
	var iterator_visible_product = 0;

	$('#products_content').find('.prod-sku').each(function(i){
		//console.log($(this));
		//add class number page
		if($(this).parent().css('display') != 'none'){
			if(iterator_visible_product%amount_product_page == 0){
				number_page++;
			}
			iterator_visible_product++;
			$(this).parent().addClass('page-' + number_page);
		}
		
	});
	size_buttons_page = number_page;
}

function remove_class_number_page(){
	$('#products_content').find('.prod-sku').each(function(i){

		var name_class = $(this).parent()[0].className.split(' ')[3];
		$(this).parent().removeClass(name_class);

	});
}

function remove_buttons(){
	$('#button_pages').find('button').each(function(e){
		$('#' + this.id).remove();
	});
	$('#button_pages').find('span').each(function(e){
		$('#' + this.id).remove();
	});
}

function hide_page(amount_page){
	for(var i = amount_page; i > 1; i--){
		if($('div').is('.page-' + i)) $('.page-' + i).css('display', 'none');
	}
}

function show_active_page(number_click_button, amount_button, container_item_id){
	for(var element = 0; element < $('#' + container_item_id)[0].childElementCount; element++){
		if($($('#' + container_item_id)[0].children[element]).is('.page-' + number_click_button)){
			$($('#' + container_item_id)[0].children[element]).css('display', 'block');
		} else {
			$($('#' + container_item_id)[0].children[element]).css('display', 'none');
		}
	}
}

function add_buttons_page(amount_button){
	var count_page = 1;
	var count_button_page = amount_button;
 	for(var c = 0; c < count_button_page; c++){
 		if(count_button_page > 1 && count_page == 1){
 			$('#button_pages').append('<button id="button_' + count_page + '" type="button" class="btn btn-secondary btn-lg" value="input_change_words_' + count_page + '">' + count_page + '</button>');
 			$('#button_pages').append('<span id="points_' + count_page + '" style="display: none;">' + '. . .' + '</span>');
 		} else if(count_button_page > 1){
 			if(c == count_button_page - 1){
 				$('#button_pages').append('<span id="points_' + (count_page - 1) + '" style="display: none;">' + '. . .' + '</span>');
 			}
 			$('#button_pages').append('<button id="button_' + count_page + '" type="button" class="btn btn-warning btn-lg" value="input_change_words_' + count_page + '">' + count_page + '</button>');
 		}
	 	count_page++;
	}
	if(count_button_page > 1 && $('#container_button_change_page').css('display', 'none')) {
		$('#container_button_change_page').css('display', 'block');
		if($(window).width() < 992){
			$('#colophon').css('margin-top', '-115px');
			$('#content').css('padding-bottom', '115px');
		} else {
			$('#colophon').css('margin-top', '-150px');
			$('#content').css('padding-bottom', '50px');
		}

	} 
	if($('#button_pages')[0].children.length == 0) {
		$('#container_button_change_page').css('display', 'none');
		if($(window).width() < 992) {
			$('#content').css('padding-bottom', '25px');
			$('#colophon').css('margin-top', '-20px');
		} else {
			//$('#colophon').css('margin-top', '-30px');
			$('#content').css('padding-bottom', '25px');
		}
	} 
	if(count_button_page > visible_button_page){
		hide_button_page(count_button_page, visible_button_page);
	}

}

function hide_button_page(amount_button_page, amount_visible_button){
	for(var i = amount_visible_button; i < amount_button_page; i++){
		var id_button_hide = $('#button_pages')[0].children[i].id;
		$('#' + id_button_hide).hide();
		if(i == (amount_button_page - 1)){
		   $('#' + 'points_' + id_button_hide.split('_')[1]).show();
		}
	}
}

function hide_show_button(active_button, amount_visible_button, all_button_id, count_buttons_page){
	
	var active_number_button  = active_button.split('_')[1];
	var last_id_button        = active_button.split('_')[0] + '_' + (count_buttons_page - 2);
	var last_id_points        = 'points_' + (count_buttons_page - 3);
	var left_button           = active_button.split('_')[0] + '_' + (active_number_button - 1);
	var right_button          = active_button.split('_')[0] + '_' + (++active_number_button);
	$('#' + left_button).show();
	$('#' + right_button).show();
	var button_3_visible  = active_number_button > amount_visible_button ? 'button' : 'button_3';
	if('button_1' != all_button_id && button_3_visible != all_button_id && active_button != all_button_id && left_button != all_button_id && right_button != all_button_id && last_id_button != all_button_id){
		$('#' + all_button_id).hide();
	}
	if(active_number_button > amount_visible_button){
		if($('#points_1').css('display') == 'none'){
			$('#points_1').show();
		} else if(active_button == active_button.split('_')[0] + '_' + (count_buttons_page - 3) || active_button == active_button.split('_')[0] + '_' + (count_buttons_page - 2)){
			$('#' + last_id_points).hide();
		} else if(active_number_button < (count_buttons_page - 2)){
			$('#' + last_id_points).show();
		}
	} else {
		$('#points_1').hide();
		if($('#' + last_id_points).css('display') == 'none'){
			$('#' + last_id_points).show();
		}
	}

}

function clear_input_checked(){
	$('#gen_change_table_words').find('input').each(function(event){
		var input_element = this.id;
		if(input_element == 'all_change'){
			$('#' + input_element).removeAttr('checked');
			$('#' + input_element).prop('checked', false);
		} else {
			$('#' + input_element).prop('checked', false);
		}
	});
}

function active_button_page(active_button, other_button){
	var active_button_value = $('#' + active_button).val();
	if(active_button == other_button){
		if(document.getElementById(active_button).classList.contains('btn-warning')){
			$('#' + active_button).removeClass('btn-warning');
			$('#' + active_button).addClass('btn-secondary');
			localStorage.setItem('act_number_button_change_page', active_button_value);
		}
	} else {
		if(document.getElementById(other_button).classList.contains('btn-secondary')){
			$('#' + other_button).removeClass('btn-secondary');
			$('#' + other_button).addClass('btn-warning');
		}
	}
}

function min_price_product_list(check_visible_products){

	var array_products = add_all_products_to_array(check_visible_products);

	// sorted
	array_products.sort(function(a,b){ return a - b; });
	return parseInt(array_products[0]);

}

function max_price_product_list(check_visible_products){
	var array_products = add_all_products_to_array(check_visible_products);

	// sorted
	array_products.sort(function(a,b){ return a - b; });
	return parseInt(array_products[array_products.length - 1]);

}

function add_all_products_to_array(check_visible_products){

	var all_price = new Array();
	if(check_visible_products){
		$('#products_content').find('.product-body').each(function(e){

			if($($(this)[0].children).is('span')) {
				all_price.push(parseInt($(this)[0].children[2].innerText.split(' ')[0]));
			} else {
				all_price.push(parseInt($(this)[0].children[0].innerText.split(' ')[0]));
			}

		});
	} else {

		$('#products_content').find('.product-body').each(function(e){

			//console.log($($(this).parent().parent()).css('display') == 'none');
			if($($(this).parent().parent()).css('display') != 'none'){
				if($($(this)[0].children).is('span')) {
					all_price.push(parseInt($(this)[0].children[2].innerText.split(' ')[0]));
				} else {
					all_price.push(parseInt($(this)[0].children[0].innerText.split(' ')[0]));
				}
			}

		});

	}

	return all_price;

}

function sorted_product_producers(check_discount_product){

	var item_product     = $('.container_producer_product');
	
	$($('.producers_product').find('li')).find('input').each(function(e){
		
		for(var i = 0; i < item_product.length; i++){

			var array_check_product_card = [];
			$(item_product[i]).each(function(element){
				for(var in_el = 0; in_el < $(this)[0].children.length; in_el++){
					array_check_product_card[in_el] = check_input_checked($(this)[0].children[in_el].innerText);
				}
			});

			var contains_array = new Set(array_check_product_card);

			if(contains_array.has(0) && !check_discount_product){
				$(item_product[i]).parent().parent().parent().show();
			} else if(contains_array.has(0) && check_discount_product){
				//console.log('0 - check_discount_product_true');
				//code to 0 
				if($(item_product[i]).parent().find('span').is($('.strike-sku'))){
					$(item_product[i]).parent().parent().parent().show();	
				}
			}

			if(contains_array.has(1) && !check_discount_product){
				$(item_product[i]).parent().parent().parent().show();
			} else if(contains_array.has(1) && check_discount_product){
				//console.log('1 - check_discount_product_true');
				//code to 1
				//console.log($(item_product[i]).find('span').is($('.strike-sku')));
				if($(item_product[i]).parent().find('span').is($('.strike-sku'))){
					$(item_product[i]).parent().parent().parent().show();	
				}
			} else if(contains_array.has(-1) && !check_discount_product){
				$(item_product[i]).parent().parent().parent().hide();
			} else if(contains_array.has(-1) && check_discount_product){
				//console.log('-1 - check_discount_product_true');
				//code to -1
				if($(item_product[i]).parent().find('span').is($('.strike-sku'))){
					$(item_product[i]).parent().parent().parent().hide();	
				}
			}
		}

	});

}

function sorted_product_discount(array_filter_producers){

	$('.discount_products_list').find('input').each(function(e){

		var contains_array_producers = new Set(array_filter_producers);
		var container_product_card   = $('.container_producer_product');

		if(this.checked){
			$('.prod-sku').each(function(i){

				var temp_array_product_card = [];
				add_temp_array_container_producer(temp_array_product_card, container_product_card, i, 'producer_product');

				//console.log(contains_array(array_filter_producers, temp_array_product_card));
				//console.log(temp_array_product_card);

				if($(this).find('span').is($('.strike-sku'))){
					if(contains_array(array_filter_producers, temp_array_product_card) && array_filter_producers.length > 0){
						$(this).parent().show();
					} else if(!contains_array(array_filter_producers, temp_array_product_card) && array_filter_producers.length == 0){
						$(this).parent().show();
					}
				} else {
					if(contains_array(array_filter_producers, temp_array_product_card) && array_filter_producers.length > 0){
						$(this).parent().hide();
					} else if(!contains_array(array_filter_producers, temp_array_product_card) && array_filter_producers.length == 0) {
						$(this).parent().hide();
					}
				}
			});
		} else {
			$('.prod-sku').each(function(e){

				var after_check_product_card = [];
				add_temp_array_container_producer(after_check_product_card, container_product_card, e, 'producer_product');

				if(array_filter_producers.length == 0){
					$(this).parent().show();
				} else {
					//console.log(after_check_product_card);
					if(contains_array(array_filter_producers, after_check_product_card)){
						$(this).parent().show();
					}
				}
			});
		}
	});

}

function add_temp_array_container_producer(temp_array, container_element_product, iter, name_class){
	for(ele_producer = 0; ele_producer < container_element_product[iter].children.length; ele_producer++){
		if(container_element_product[iter].children[ele_producer].className == name_class){
			temp_array.push(container_element_product[iter].children[ele_producer].innerText);
		}
	}
	return temp_array;
}

function contains_array(array, toArray){
	check = false;
	for(var i = 0; i < array.length; i++){
		for(var x = 0; x < toArray.length; x++){
			if(array[i] == toArray[x]){
				check = true;
			}
		}
	}
	return check;
}

function check_input_checked(item){
	var result_check = -1;
	var checked_producer = [];
	$('.producer_i').find('input').each(function(e){
		if(this.checked == true){
			checked_producer.push(this.value);
		}
	});
	for(var i = 0; i < checked_producer.length; i++){
		if(checked_producer[i] == item){
			result_check = 1;
		}
	}
	if(checked_producer.length < 1){
		result_check = 0;
	}
	return result_check;
}

function amount_product_page(id_container_amount_product){

	var amount_product_page = 0;
	if($('div').is('#products_content')){
		for(var i = 0; i < $('#products_content')[0].children.length; i++){
			var array_class_name = $('#products_content')[0].children[i].className.split(' ');
			var last_item_array_class_name = array_class_name[array_class_name.length - 1];
			var is_page_class = last_item_array_class_name.split('-')[0];

			if(is_page_class == 'page'){
				amount_product_page++;
			}

		}

		$(id_container_amount_product).text(amount_product_page);
	}

}

// show navigation panel 
function show_name_page(){

	var active_page_post = localStorage.getItem('active_page');
	var active_parent_page_post = localStorage.getItem('active_parent_page');

	var array_body_class_name = $('body')[0].className.split(' ');
	var id = get_id_page(array_body_class_name);

	if(id.get('page_id') == 0 
	   && check_contains_name('home', array_body_class_name))
	{
		if($(window).width() > 992){
			active_element_menu(id.get('page_id'), 0);
			//$('#navigation_page_panel').append('<span id="home_page"><a href="https://mebelkub.com/">mebelkub.com</a></span>');
		} else {
			//active_element_menu(id.get('page_id'), 0);
			//$('#navigation_page_panel_mobile').append('<span><a href="https://mebelkub.com/">mebelkub.com</a></span>');
		} 
	} else if (!check_contains_name('home', array_body_class_name) 
			   && check_contains_name('page', array_body_class_name)
			   || check_contains_name('single', array_body_class_name))
	{
		$.ajax({
	        url:"/wp-admin/admin-ajax.php",   
	        type:"POST", 
	        data:{
	        	action:'get_name_page', 
	        	page_id: id.get('page_id') == null ? active_page_post : id.get('page_id'),
	        	parent_pageid: id.get('parent_pageid') == null ? active_parent_page_post : id.get('parent_pageid')
	        },
	        beforeSend: function(){
	        	//console.log(id.get('page_id')); isNaN(parseInt(check_active_parent_page))
	        	if(check_is_service_page(id.get('page_id')) || isNaN(parseInt(check_active_parent_page))){
	        		$('.overlay-content-product').css('display', 'block');
		        	$('.overlay-content-product').animate({opacity: .7}, 500);
		        	$('.spinner-kub').css('display', 'block');
		        	$('.spinner-kub').animate({opacity: 1}, 500);
	        	}
	        	

	        }, 
	        success: function(data){
	        	
	        	var name_page = JSON.parse(data);

	        	if(check_contains_name('page-parent', array_body_class_name)){

					if($(window).width() > 992){
						active_element_menu(id.get('page_id'), 0);
						set_active_page(id.get('page_id'), id.get('parent_pageid'));
						//$('#navigation_page_panel').append('<span id="home_page"><a href="https://mebelkub.com/" style="color: #AFAFAF;">mebelkub.com</a></span><i class="fas fa-chevron-right" style="padding-left: 5px; padding-right: 10px; font-size: 15px; color: #AFAFAF;"></i><span>' + name_page['page_name'] + '</span>');
					} else {
						//active_element_menu(id.get('page_id'), 0);
						set_active_page(id.get('page_id'), id.get('parent_pageid'));
						//$('#navigation_page_panel_mobile').append('<span>' + name_page['page_name'] + '</span>');
					}

				} else if(check_contains_name('page-child', array_body_class_name)){

					if($(window).width() > 992){
						active_element_menu(id.get('page_id'), id.get('parent_pageid'));
						set_active_page(id.get('page_id'), id.get('parent_pageid'));
						//$('#navigation_page_panel').append('<span id="home_page"><a href="https://mebelkub.com/" style="color: #AFAFAF;">mebelkub.com</a></span><i class="fas fa-chevron-right" style="padding-left: 5px; padding-right: 10px; font-size: 15px; color: #AFAFAF;"></i><span><a href="' + name_page['parent_link'] + '" style="color: #AFAFAF;">' + name_page['parent_name'] + '</a></span><i class="fas fa-chevron-right" style="padding-left: 5px; padding-right: 10px;  font-size: 15px; color: #AFAFAF;"></i><span>' + name_page['page_name'] + '</span>');
					} else {
						//active_element_menu(id.get('page_id'), 0);
						set_active_page(id.get('page_id'), id.get('parent_pageid'));
						//$('#navigation_page_panel_mobile').append('<span>' + name_page['page_name'] + '</span>');
					}
					
				} else if(check_contains_name('single', array_body_class_name)){

					if($(window).width() > 992){
						active_element_menu(active_page_post, active_parent_page_post);
						set_active_page(active_page_post, active_parent_page_post);
						if($('div').is($('#navigation_page_panel'))){
							if($('#navigation_page_panel').attr('rel') == 0){
								$('#navigation_page_panel').append('<span id="home_page"><a href="https://mebelkub.com/" style="color: #AFAFAF;">mebelkub.com</a></span><i class="fas fa-chevron-right" style="padding-left: 5px; padding-right: 10px; font-size: 15px; color: #AFAFAF;"></i><span><a href="' + name_page['parent_link'] + '" style="color: #AFAFAF;">' + name_page['parent_name'] + '</a></span><i class="fas fa-chevron-right" style="padding-left: 5px; padding-right: 10px;  font-size: 15px; color: #AFAFAF;"></i><span><a href="' + name_page['page_link'] + '" style="color: #000; outline: none;">' + name_page['page_name'] + '</a></span>');
							}
						}
					} else {
						set_active_page(active_page_post, active_parent_page_post);
						if($('div').is($('#navigation_page_panel'))){
							if($('#navigation_page_panel').attr('rel') == 0){
								$('#navigation_page_panel_mobile').append('<span><a href="' + name_page['page_link'] + '" style="color: #000; outline: none;">' + name_page['page_name'] + '</a></span>');
							}
						}
					}

					// show link back sale products
					if(localStorage.getItem('active_page') == 3176){
						if($('div').is($('#back_sales_products')) 
						   && $('#back_sales_products').css('display') == "none")
						{
							$('#back_sales_products').show();
							var height_block = document.getElementById('back_sales_products').getBoundingClientRect();
							$('.producer-product-content-page').css('top', 50 + height_block.height);
							//console.log(height_block.height);
						}
					} else {
						if($('div').is($('#back_sales_products')) 
						   && $('#back_sales_products').css('display') != "none")
						{
							$('#back_sales_products').hide();
							$('.producer-product-content-page').css('top', 50);
						}
					}
				}
	        }
		}).done(function(){
			//console.log(id.get('page_id'));
			if(check_is_service_page(id.get('page_id')) || isNaN(parseInt(check_active_parent_page))){
				$('.spinner-kub').animate({opacity: 0}, 500, function(){ 
					$('.spinner-kub').css('display', 'none');
				});
				$('.overlay-content-product').css('display', 'none');
				$('.overlay-content-product').animate({opacity: 0}, 500);
			}

		});
	}

	// check actual child page for check is local storage
	if(check_contains_name('page-child', array_body_class_name)){
		localStorage.setItem('actual_page_sku', 'is_page_child');
	} else {
		localStorage.setItem('actual_page_sku', 'no_page_child');
		// set to actual id page
		var active_id_page = localStorage.getItem('active_page');
		localStorage.setItem('actual_id_page_sku', active_id_page); 
	}

	return id;
	
}

function set_active_page(page_id, parent_page_id){
	if(page_id    != 2252
       && page_id != 2652
       && page_id != 2647
       && page_id != 2889)
	{
		localStorage.setItem('active_page', page_id);
		localStorage.setItem('active_parent_page', parent_page_id);
	}
}

function active_element_menu(id, id_parent){
	$('.nav-item').find('a').each(function(event){
		$(this).removeClass('active-element-menu');
		//$(this).removeClass('active-parent-element-menu');
		//$(this).parent().css('padding-top', '0px');
		var id_item_menu = $(this).attr('href').split('=')[1];
		if(id == 0 && id_parent == 0 && id_item_menu == null){
			$(this).addClass('active-element-menu');
			//$(this).addClass('active-parent-element-menu');
			//$(this).parent().css('padding-top', '6px');
		} else if(id == id_item_menu || id_parent == id_item_menu){
			$(this).addClass('active-element-menu');
			//$(this).addClass('active-parent-element-menu');
			//$(this).parent().css('padding-top', '6px');
		}
        
    });
}

function check_contains_name(name, array_name){
	var result_check = false;
	for(var i = 0; i < array_name.length; i++){
		if(array_name[i] == name){
			result_check = true;
		}
	}
	return result_check;
}

function get_id_page(array_name){
	var id      = new Map();
	var temp_id = [];
	var temp    = [];
	for(var i = 0; i < array_name.length; i++){
		temp.push(array_name[i].split('-'));
		if(check_contains_name('page', temp[i]) && check_contains_name('id', temp[i]) 
			|| check_contains_name('parent', temp[i]) && check_contains_name('pageid', temp[i])
			|| check_contains_name('home', temp[i])){
			temp_id.push(temp[i]);
		}
	}
	for(var i = 0; i < temp_id.length; i++){
		if(temp_id[i][0] == 'page')
			id.set('page_id', temp_id[i][temp_id[i].length - 1]);
		if(temp_id[i][0] == 'parent')
			id.set('parent_pageid', temp_id[i][temp_id[i].length - 1]);
		if(temp_id[i][0] == 'home')
			id.set('page_id', 0);
	}
	return id;
}
