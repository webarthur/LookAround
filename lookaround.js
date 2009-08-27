Lookaroud=new Class({
	boxs: [],
	data: [],
	history: [],
	arrow: null,
	initialize: function(element, options) {
		var la = this;
		var data = options.data;
		this.element = $(element);
		data[0].each(function(item, index) {
			la.addImage(item[0],item[1],item[2]);
		});
		
		this.data = data;
		this.boxOptions = options.box;
		this.arrowOptions = options.arrow;
		
		this.arrow = new Element('div',{
			'html': '&larr;',
			'styles': {
				'font-size': '56px',
				'position': 'absolute',
				'top': this.element.getPosition().y,
				'left': this.element.getPosition().x+15,
				'color': this.arrowOptions.color,
				'font-weight': 'bold',
				'opacity': 0,
				'cursor': 'pointer',
				'z-index': 10000000
			}
		}).inject(this.element).addEvent('click',function() { la.goback(); });
		
		this.addHistory({
			'image': null,
			'index': 0,
			'origins': 0
		});
	},
	goback: function() {
		var la = this;
		var options = this.history[this.history.length-1];
		var morph = new Fx.Morph(options.image);
		morph.start({
			'width': options.width,
			'height': options.height,
			'opacity': 0,
			'top': options.origins.y,
			'left': options.origins.x,
			onStart: function(passes_tween_element){
				la.clear();
			}
		});
		if(this.history.length>1){ // don't works!
			this.load(this.history[this.history.length-2].index);
			this.history.splice(this.history.length-1);
		}
	},
	addHistory: function(options) {
		this.history[this.history.length] = options;
	},
	load: function(index, origins) {
		if(index!=null) {
			this.data[index].each(function(item, index) {
				la.addImage(item[0],item[1],item[2]);
			});
			if(origins)
				la.addHistory(index,origins);
		}
		if(index==0)
			this.arrow.fade(0);
		else
			this.arrow.fade(0.7);
	},
	clear: function(force) {
		for(i=0;i<this.boxs.length;i++)
			if(force) {
				$(this.boxs[i]).dispose();
			} else {
				$(this.boxs[i]).fade(0);
			}
	},
	addImage: function(image,options,goto) {
		var la = this;
		var position=this.element.getPosition();
		var box = new Element('div', {
			'opacity':0,
			'styles': {
				'top': position.y+options.top,
				'left': position.x+options.left,
				'position': 'absolute',
				'border': '1px dashed #000000',
				'width': options.width,
				'height': options.height,
				'cursor': 'pointer',
				'z-index': 10000,
				'backgroundColor': '#ffffff',
				'opacity': 0
			}
		}).fade(0.1);
		
		box.addEvent('mouseover',function() {
			this.fade(0.4);
		})
		box.addEvent('mouseout',function() {
			this.fade(0.1);
		});
		
		box.addEvent('click', function() {
			var images = [image];
			var loader = new Asset.images(images, {
				onComplete: function() {
					images.each(function(im) {
						var img = new Element('img',{
							src:im,
							styles: {
								'position': 'absolute',
								'top': box.getPosition().y,
								'left': box.getPosition().x
							}
						});
						box.getParent().grab(img);
						var to = img.getSize();
						img.set('width',box.getStyle('width')).set('height',box.getStyle('height')).set('opacity',0);
						var morph = new Fx.Morph(img);
						morph.start({
							'width':to.x,
							'height': to.y,
							'opacity': 1,
							'top': box.getParent().getPosition().y,
							'left': box.getParent().getPosition().x,
							onStart: function(passes_tween_element){
								la.addHistory({
									'image': img,
									'index': goto,
									'origins': box.getPosition(),
									'width': box.getStyle('width'),
									'height': box.getStyle('height')
								});
								la.clear(1);
							}
						}).chain(function(){
							//la.clear(1);
							la.load(goto);
						});
					});
				}
			});
		});
		this.element.grab(box);
		this.boxs[this.boxs.length] = box;
	}
});
