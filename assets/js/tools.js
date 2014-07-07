/**
 * NITM Javascript Tools
 * Tools which allow some generic functionality not provided by Bootstrap
 * © NITM 2014
 */

function Tools ()
{
	self = this;
	this.defaultInit = [
		'initVisibility',
		'initRemoveParent',
		'initBsMultipleModal',
		'initDynamicDropdown',
		'initDynamicValue',
		'initOffCanvasMenu',
		'initAutocompleteSelect',
		'initSubmitSelect',
		'initScrolledIntoView'
	];
	
	this.init = function (containerId) {
		this.coreInit(containerId);
	}
	
	this.coreInit = function (containerId) {
		this.defaultInit.map(function (method, key) {
			if(typeof self[method] == 'function')
				self[method](containerId);
		});
	}
	
	/**
	 * Submit a form on change of dropdown input
	 */
	this.initSubmitSelect = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);	
		container.find("[role='changeSubmit']").map(function(e) {
			$(this).off('change');
			$(this).on('change', function (event) {
				window.location.replace($(this).val());
			});
		});
	}
	
	/**
	 * Use data attributes to load a URL into a container/element
	 */
	this.initScrolledIntoView = function (containerId) {
		_self = this;
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);	
		this._watch = [];
		this.$window = $(window),
		this._buffer = null;
		
		this.init = function () {
			/**
			 * Scrolled into view plugin
			 */
			var pluginName = 'scrolledIntoView',
			settings = {
				scrolledin: null,
				scrolledout: null
			}
			
			$.fn[pluginName] = function( options ) {
				var options = $.extend({}, settings, options);
				this.each( function () {
					var $el = $(this),
						   instance = $.data( this, pluginName );
						   if ( instance ) {
							   instance.options = options;
						   } else {
							   $.data(this, pluginName, _self.monitor( $el, options ) );
							   $el.on( 'remove', $.proxy( function () {
								   $.removeData(this, pluginName);
								   self.unmonitor( instance );
							   }, this ) );
						   }
				});
				return this;
			}
			
			/**
			 * Intiialze scroll monitor
			 */
			this.monitorElement(window);
			this.monitorElement("[role~='scrolledIntoViewContainer']");
			
			
			/*
			 * Find elements that need to be activated on scrolledIntoView
			 */
			container.find("[role~='onScrolledIntoView']").map(function(e) {
				var inCallback = window[$(this).data('on-scrolled-in')];
				var outCallback = window[$(this).data('on-scrolled-out')];
				switch(_self.test($(this)))
				{
					case true:
						try {inCallback()} catch(error) {};
						break;
						
					default:
						$(this)
						.scrolledIntoView()
						.on('scrolledin', function () { try {inCallback()} catch(error) {}})
						.on('scrolledout', function () { try {outCallback()} catch(error) {}});
						break;
				}
			});
			return this;
		}
		
		this.monitorElement = function (containerId) {
			var container = (container == undefined) ? 'body' : container;
			$(container).on('scroll', function (e) {
				if ( !this._buffer ) {
					_self._buffer = setTimeout(function () {
						_self.isInView(e);
						_self._buffer = null;
					}, 300);
					_self.monitor($(container));
				}
			});
		}
		
		this.monitor = function( element, options ) {
			var item = { element: element, options: options, invp: false };
			_self._watch.push(item);
			return item;
		}
		
		
		this.unmonitor = function( item ) {
			for ( var i=0;i<_watch.length;i++ ) {
				if ( _self._watch[i] === item ) {
					_self._watch.splice( i, 1 );
					item.element = null;
					break;
				}
			}
		}
		
		
		this.test = function ($el) {
			var docViewTop = this.$window.scrollTop(),
			docViewBottom = docViewTop + this.$window.height(),
			elemTop = $el.offset().top,
			elemBottom = elemTop + $el.height();
			
			return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
			&& (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
		}
		
		this.isInView = function (e) {
			
			$.each(_self._watch, function () {
				
				if ( _self.test( this.element ) ) {
					if ( !this.invp ) {
						this.invp = true;
						if ( this.options && this.options.scrolledin ) this.options.scrolledin.call( this.element, e );
				   this.element.trigger( 'scrolledin', e );
					}
				} else if ( this.invp ) {
					this.invp = false;
					if ( this.options.scrolledout ) this.options.scrolledout.call( this.element, e );
				   this.element.trigger( 'scrolledout', e );
				}
			});
		}
		this.init();
	}
	
	/**
	 * Use data attributes to load a URL into a container/element
	 */
	this.initVisibility = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		//enable hide/unhide functionality with optional data retrieval
		container.find("[role='visibility']").map(function(e) {
			var id = $(this).data('id');
			switch(id != undefined)
			{
				case true:
				var dynamicFunction = function (object) {
					var element = $nitm.getObj(id);
					var url = $(object).data('url');
					var on = $(object).data('on');
					url = !url ? $(object).attr('href') : url;
					var getUrl = true;
					switch(on != undefined)
					{
						case true:
						if($(on).get(0) == undefined) getUrl = false;
						break;
					}
					switch((url != '#') && (url.length >= 2) && getUrl)
					{
						case true:
						$.ajax({
							url: url, 
							dataType: 'html',
							complete: function (result) {
								self.evalScripts(result.responseText, function () {
									element.html(result.responseText);
								});
							}
						});
						break;
					}
					var success = ($(this).data('success') != undefined) ? $(this).data('success') : null;
					eval(success);
					if($(this).data('toggle')) $nitm.handleVis($(this).data('toggle'));
					if($(this).data("remove-event") == 1) {
						$(this).attr('href', '');
						$(this).data('url', '');
					}
					$nitm.handleVis(id);
				}
				$(this).off('click');
				switch($(this).data('run-once'))
				{
					case true:
					case 1:
					$(this).one('click', function (e) {
						e.preventDefault();
						dynamicFunction(this);
					});
					$(this).on('click', function (e) {
						e.preventDefault();
						$nitm.handleVis(id, true);
					});
					break;
					
					default:
					$(this).on('click', function (e) {
						e.preventDefault();
						dynamicFunction(this);
					});
					break;
				}
				break;
			}
		});
	}
	
	/**
	 * Populate another dropdown with data from the current dropdown
	 */
	this.initDynamicDropdown = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);		
		container.find("[role='dynamicDropdown']").map(function(e) {
			var id = $(this).data('id');
			switch(id != undefined)
			{
				case true:
				$(this).off('change');
				$(this).on('change', function (e) {
					e.preventDefault();
					var element = $nitm.getObj('#'+id);
					var url = $(this).data('url');
					switch((url != '#') && (url.length >= 2))
					{
						case true:
							element.removeAttr('disabled');
							element.empty();	$.get(url+$(this).find(':selected').val()).done( function (result) {
								var result = $.parseJSON(result);
								element.append( $('<option></option>').val('').html('Select value...') );
								if(typeof result == 'object')
								{
									$.each(result, function(val, text) {
										element.append( $('<option></option>').val(text.value).html(text.label) );
									});
								}
							}, 'json');
							break;
					}
				});
				break;
			}
		});
	}
	
	/**
	 * Set the value for an element using data attributes
	 */
	this.initDynamicValue = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		//enable hide/unhide functionality with optional data retrieval
		container.find("[role='dynamicValue']").map(function(e) {
			switch($(this).data('id') != undefined)
			{
				case true:
				var dynamicFunction = function (object) {
					var id = $(object).data('id');
					var element = $nitm.getObj(id);
					var url = $(object).data('url');
					var on = $(object).data('on');
					switch((url != '#') && (url.length >= 2))
					{
						case true:
						element.removeAttr('disabled');
						element.empty();	
						var selected = !$(object).find(':selected').val() ? '' : $(object).find(':selected').val();
						switch(on != undefined)
						{
							case true:
							if($(on).get(0) == undefined) return false;
							break;
						}
						switch($(object).data('type'))
						{
							case 'html':
							$.ajax({
								url: url+selected, 
								dataType: 'html',
								complete: function (result) {
									self.evalScripts(result.responseText, function () {
										element.html(result.responseText);
									});
								}
							});
							break;
							
							case 'callback':
							var callback = $(object).data('callback');
							$.ajax({
								url: url+selected, 
								dataType: 'json',
								complete: function (result) {
									callback(result);
								}
							});
							break;
							
							default:
							$.ajax({
								url: url+selected, 
								dataType: 'json',
								complete: function (result) {
									var result = $.parseJSON(result);
									element.val(result);
								}
							});
							break;
						}
						break;
					}
				}
				$(this).off('click');
				switch($(this).data('run-once'))
				{
					case true:
					case 1:
					$(this).one('click', function (e) {
						e.preventDefault();
						dynamicFunction(this);
					});
					break;
					
					default:
					$(this).on('click', function (e) {
						e.preventDefault();
						dynamicFunction(this);
					});
					break;
				}
				break;
			}
		});
	}
	
	/**
	 * THis is used to evaluate remote js files returned in ajax calls
	 */
	/*this.evalScripts = function (text, callback) {
		var dom = $(text);
		//Load remote scripts before ading content to DOM
        dom.filter('script').each(function(){
            if(this.src) {
				$.getScript(this.src);
				$(this).remove();
			} 
        });
		if (typeof callback == 'function') {
			$(document).one('ajaxStop', function () {
				callback();
				//Execute javasript after callback has been called
				dom.filter('script').each(function(){
					if($(this).text()) {
						eval($(this).text());
						$(this).remove();
					}
				});
				self.init();	
			});
		}
	}*/
	
	/**
	 * THis is used to evaluate remote js files returned in ajax calls
	 */
	this.evalScripts = function (text, callback) {
		var dom = $(text);
		var scripts = dom.filter('script');
		//Load remote scripts before ading content to DOM
		scripts.each(function(){
			if(this.src) {
				$.getScript(this.src);
				$(this).remove();
			}
		});
		if (typeof callback == 'function') {
			$(document).one('ajaxStop', function () {
				var wrapperId = 'wrapper'+Date.now();
				var wrapper = $('<div id="'+wrapperId+'">').append(dom);
				//Execute basic init on new content
				var c = function () {
					try {
						callback($('<div>').append(wrapper).html());
					} catch (error) {}
				}
				$.when(c()).done(function () {
					self.coreInit(wrapperId);
					dom.filter('script').each(function(){
						if($(this).text()) {
							eval($(this).text());
							$(this).remove();
						}
					});
				});
			});
		}
	}
	
	/**
	 * Fix for handling slow loading remote js with pjax.
	 * We need to hook onto the before send function and not execute
	 * until the scripts have been loaded.
	 */
	this.pjaxAjaxStop = function () {
		$(document).on('pjax:beforeSend', function (event, xhr, options) {
			var success = options.success;
			options.success = function () {
				self.evalScripts(xhr.responseText, function (responseText) {
					success(responseText, status, xhr);
				});
			}
		});
	};
	
	/**
	 * Remove the parent element up to a certain depth
	 */
	this.initRemoveParent = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		//enable hide/unhide functionality
		container.find("[role='removeParent']").map(function(e) {
			$(this).off('click');
			$(this).on('click', function (e) {
				e.preventDefault();
				self.removeParent(this);
				return false;
			});
		});
	}
	
	/**
	 * Remove the parent element up to a certain depth
	 */
	this.removeParent = function (elem, levels)
	{	
		var levels = ($(elem).data('depth') == undefined) ? ((levels == undefined) ? 1 : levels): $(elem).data('depth');
		var parent = $(elem).parent();
		for(i = 0; i<levels; i++)
		{
			parent = parent.parent();
		}
		parent.remove();
	}
	
	/**
	 * Initialize remove parent elements
	 */
	this.initDisableParent = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		//enable hide/unhide functionality
		container.find("[role='removeParent']").map(function(e) {
			$(this).off('click');
			$(this).on('click', function (e) {
				self.disableParent(this);
				return false;
			});
		});
	}
	
	
	/**
	 * Disable the parent element up to a certain depth
	 */
	this.disableParent = function (elem, levels, parentOptions, disablerOptions, dontDisableFields) {
		var levels = ($(elem).data('depth') == undefined) ? ((levels == undefined) ? 1 : levels): $(elem).data('depth');
		var parent = $(elem).parent();
		for(i = 0; i<levels; i++)
		{
			parent = parent.parent();
		}
		//If we're dealing with a form, start from the submit button
		switch($(elem).prop('tagName'))
		{
			case 'FORM':
				var elem = $(elem).find(':submit').get(0);
				break;
		}
		$(elem).attr('role', 'disableParentTrigger');
		//get and set the role of the element activating this removal process
		var thisRole = $(this).attr('role');
		$(this).attr('role', (thisRole == undefined) ? 'disableParentTrigger' : thisRole);
		var thisRole = $(this).attr('role');
		
		//get and set the disabled data attribute
		switch($(elem).data('disabled'))
		{
			case 1:
			case true:
				var disabled = 1;
				break;
				
			default:
				var disabled = 0;
				break;
		}
		$(elem).data('disabled', !disabled);
		
		var _defaultDisablerOptions = {
			class: 'btn '+((disabled == 1) ? 'btn-success' : 'btn-danger'), 
			size: 'btn-sm',
			indicator: ((disabled == 1) ? 'repeat' : 'remove')
		};
		//change the button to determine the curent status
		var _disablerOptions = {};
		for(var attribute in _defaultDisablerOptions)
		{
			try {
				_disablerOptions[attribute] = (disablerOptions.hasOwnProperty(attribute)) ? disablerOptions[attribute] : _defaultDisablerOptions[attribute];
			} catch(error) {
				_disablerOptions[attribute] = _defaultDisablerOptions[attribute];
			}
			
		};
		$(elem).removeClass().addClass(_disablerOptions.class+' '+_disablerOptions.size).html("<span class='glyphicon glyphicon-"+_disablerOptions.indicator+"'></span>");
		
		//now perform disabling on parent
		var _defaultParentOptions = {
			class: 'alert '+((disabled == 1) ? 'alert-disabled' : 'alert-success')
		};
		var elemEvents = ['click'];
		parent.find(':input,:button,a').map(function () {
			switch($(this).attr('role'))
			{
				case thisRole:
					break;
					
				default:
					switch($(this).data('keep-enabled') || ($(this).attr('name') == '_csrf'))
					{
						case false:
							switch(disabled == 1)
							{
								case true:
									var _class = 'warning';
									var _icon = 'plus';
									break;
									
								default:
									var _class = 'danger';
									var _icon = 'remove';
									break;
							}
							switch(dontDisableFields)
							{
								case false:
								case undefined:
									for(var event in elemEvents)
									{
										switch(disabled)
										{
											case true:
												$(this).on(event, function (event) {
													return false;
												});
												break;
												
											case false:
												$(this).on(event, function (event) {
													$(this).trigger(event);
												});
												break;
										}
									}
									switch(disabled)
									{
										case 1:
										case true:
											$(this).attr('disabled', disabled);
											break;
											
										default:
											$(this).removeAttr('disabled');
											break;
									}
									break;
							}
					}
					break;
			}
		});
		
		var _parentOptions = {};
		for(var attribute in _defaultParentOptions)
		{
			try {
				_parentOptions[attribute] = (parentOptions.hasOwnProperty(attribute)) ? parentOptions[attribute] : _defaultParentOptions[attribute];
			} catch(error) {
				_parentOptions[attribute] = _defaultParentOptions[attribute];
			}
			
		}
		parent.removeClass().addClass(_parentOptions.class);
	}
	
	/**
	 * Fix for loading multiple boostrap modals
	 */
	this.initBsMultipleModal = function () {
		//to support multiple modals
		$(document).on('hidden.bs.modal', function (e) {
			$(e.target).removeData('bs.modal');
			//Fix a bug in modal which doesn't properly reload remote content
			$(e.target).find('.modal-content').html('');
		});
	}
	
	/**
	 * Custom auto complete handler
	 */
	this.initAutocompleteSelect = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		container.find("[role='autocompleteSelect']").each(function() {
			$(this).on('autocompleteselect', function (e, ui) {
				e.preventDefault();
				var element = $(this).data('real-input');
				var appendTo = $(this).data('append-html');
				switch(appendTo != undefined)
				{
					case true:
					switch(ui.item.html != undefined)
					{
						case true:
						$nitm.getObj(appendTo).append($(ui.item.html));
						break;
					}
					break;
				}
				switch(element != undefined)
				{
					case true:
					$nitm.getObj(element).val(ui.item.value);
					$(this).val(ui.item.text);
					break;
						
					default:
					$(this).val(ui.item.value);
					break;
				}
			});
		});
	}
	
	/**
	 * Off canvas menu support
	 */
	this.initOffCanvasMenu = function (containerId) {
		var container = $nitm.getObj((containerId == undefined) ? 'body' : containerId);
		$(document).ready(function () {
			$("[data-toggle='offcanvas']").click(function () {
				$('.row-offcanvas').toggleClass('active')
			});
		});
	}
}

$nitm.addOnLoadEvent(function () {
	$nitm.initModule('tools', new Tools());
});