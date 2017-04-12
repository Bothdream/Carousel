/*采用匿名函数自调用，避免污染变量*/
;(function($){
  var Carousel = function(poster){
  	  //动画是否停止的标志
  	  this.animateStopFlag = true;
  	  var self = this;
  	  /*保存旋转木马对象*/
  	  this.poster = poster;
      /**默认配置参数*/
      this.setting = {
             "width":1000,//幻灯片的宽度
             "height":270,//幻灯片的高度
             "posterWidth":640,//第一帧的高度
             "posterHeight":270,//第一帧的宽度
             "verticalAlign":'middle',
             "autoPlay":true,
             "speed":500,
             "delay":500,
             "scale":0.9//记录显示比例
      },
      /*$.extend函数追加和替换:修改配置*/
      $.extend(this.setting,this.getSetting());

      /***设置默认参数：宽度，高度**/
      this.posterItemMain = poster.find("ul.poster-list");
      //左右按钮的jquery对象
      this.nextBtn = poster.find("div.poster-next-btn");
      this.prevBtn = poster.find("div.poster-prev-btn");
      //获取第一帧的jquery对象
      this.posterItem = poster.find("li.list-item");
      /*****************偶数帧的简单处理**********************/
      if(this.posterItem.size()%2==0){
      	   this.posterItemMain.append(this.posterItem.eq(0).clone());
      	   this.posterItem =  this.posterItemMain.children();
      }
      /*******************************************/
      this.posterFirstItem = this.posterItem.first();
      this.posterLastItem = this.posterItem.last();
      this.setSettingValue();
      this.setPosterPos();

      /******旋转左右帧：绑定事件*****/
      //左旋转
      this.nextBtn.click(function(){
      	if(self.animateStopFlag){
      		self.animateStopFlag = false;
      	 	self.carouselRotate('left');
      	 }
      });
      //右旋转
      this.prevBtn.click(function(){
      	if(self.animateStopFlag){
      	  self.animateStopFlag = false;
          self.carouselRotate('right');
        }
      });

      /******设置是否自动播放*****/
      if(this.setting.autoPlay){
           this.autoPlay();
           //当鼠标移到幻灯片区域时，清除定时器，为幻灯片区域绑定hover()事件
		   this.poster.hover(function(){
		        window.clearInterval(self.timer);
		   },function(){
		        self.autoPlay();
		   });
      }

  };
  /******Carousel对象的原型*******/
  Carousel.prototype = {
  	   /*****获取手动配置的参数****/
       getSetting:function(){
       	  var setting = this.poster.attr('data-setting');
       	  if(setting&&setting!=''){
              return $.parseJSON(setting);
       	  }else{
              return {};
       	  } 
       },
       /**设置配置参数去控制基本的高度宽度***/
       setSettingValue:function(){
           //设置幻灯片的高度和宽度
           this.poster.css({
                 width:this.setting.width,
                 height:this.setting.height     
           });
           //设置广告区的宽度和高度
           this.posterItemMain.css({
                 width:this.setting.width,
                 height:this.setting.height
           });
           //设置左右切换按钮的宽度和高度
           var w = (this.setting.width - this.setting.posterWidth) / 2;
           this.nextBtn.css({
                 width:w,
                 height:this.setting.height,
                 /*****设置层级关系：总的帧数除以2，向上取整，让左右按钮层级最大
                  向下取整，让第一帧层级第二大。   
                  *****/
                  zIndex:Math.ceil(this.posterItem.size()/2)
           });
           this.prevBtn.css({
                 width:w,
                 height:this.setting.height,
                 zIndex:Math.ceil(this.posterItem.size()/2)
           });
           //设置第一帧的宽度和高度
           this.posterFirstItem.css({
           	    width:this.setting.posterWidth,
           	    height:this.setting.posterHeight,
           	    left:w,
           	    zIndex:Math.floor(this.posterItem.size()/2)
           });
       },
       /****设置其余帧的位置关系***/
       setPosterPos:function(){
       	   var self = this;
       	    /******右边帧的位置*******/
           var sliceItem = this.posterItem.slice(1),
               sliceSize = sliceItem.size()/2, //要取整   
               rightSlice = sliceItem.slice(0,sliceSize)
               //层级
               level = Math.floor(this.posterItem.size()/2);
           var rw = self.setting.posterWidth,
               rh = self.setting.posterHeight,
               //右边每个间隙：按钮的宽度除以多少个层级
               gap = ((self.setting.width - self.setting.posterWidth)/2)/level;//要取整
               
           var firstLeft = (self.setting.width - self.setting.posterWidth)/2 ;
           var fixOffsetLeft = firstLeft + rw;                                                        
           rightSlice.each(function(i){
           	    level--;
                rw = rw*self.setting.scale;
                rh = rh*self.setting.scale;
            	var j = i;
            	$(this).css({
                    width:rw,
                    height:rh,
                    zIndex:level,
                    opacity:1/(++j),
                    left:fixOffsetLeft + (++i)*gap - rw,
                    top: self.setVertucalAlign(rh)
            	});
            });   
            
            /******左边帧的位置*******/
            var leftSlice = sliceItem.slice(sliceSize);
            var leftSliceSize = leftSlice.size();
            var oloop = leftSlice.size();
            //获取右边帧最后一个元素的宽度和高度
            var lw = rightSlice.last().width(),
                lh = rightSlice.last().height(),
                lz = rightSlice.last().css('zIndex');
            leftSlice.each(function(i){
                $(this).css({
                	width:lw,
                    height:lh,
                    zIndex:lz++,
                    opacity:1/oloop--,
                    left:i*gap,
                    top: self.setVertucalAlign(lh)
                });
                lw = lw/self.setting.scale;
                lh = lh/self.setting.scale;
            });

       },

       /******设置垂直排列对齐*******/
       setVertucalAlign:function(height){
            var verticalType = this.setting.verticalAlign,
                top = 0;
            if(verticalType == 'top'){
                top = 0; 
            }else if(verticalType == 'middle'){
                top = (this.setting.height - height)/2;
            }else if(verticalType == 'bottom'){
                top = this.setting.height - height;
            }else{
            	top = (this.setting.height - height)/2;
            }
            return top;
       },

       /*******旋转左右帧:原理将上一帧或者下一帧的属性值，赋给当前帧*********/
       //budge:1.连续点击时，会出现旋转会很乱，原因是当前动画还没结束，就产生了新的动画。
       //      2.图片层级不该用动画过渡，显的很生硬，解决办法：将所有的zIndex先存起来，等动画结束后在，重新赋值。
       carouselRotate:function(dir){
       	  var _this_ = this;
          //左旋转
          if(dir === 'left'){
          	  var zIndexArr = [];
              this.posterItem.each(function(){
                 var curPoster = $(this),
                     prevPoster = curPoster.prev().get(0)? curPoster.prev():_this_.posterLastItem,
                     width = prevPoster.width(),
                     height = prevPoster.height(),
                     zIndex = prevPoster.css('zIndex'),
                     opacity = prevPoster.css('opacity'),
                     top = prevPoster.css('top');
                     left = prevPoster.css('left');
                 //存放所有的zindex    
                 zIndexArr.push(zIndex);
                 curPoster.animate({
                 	width:width,
                 	height:height,
                 	// zIndex:zIndex,
                 	opacity:opacity,
                 	top:top,
                 	left:left
                 },_this_.setting.speed,function(){
                 	_this_.animateStopFlag = true;
                 });
              });
              //重新赋值zindex
              this.posterItem.each(function(i){
                   $(this).css('zIndex',zIndexArr[i]);
              });
          }
          //右旋转
          if(dir === 'right'){
          	  var zIndexArr = [];
              this.posterItem.each(function(){
              	 var curPoster = $(this),
                     nextPoster = curPoster.next().get(0)? curPoster.next():_this_.posterFirstItem,
                     width =  nextPoster.width(),
                     height = nextPoster.height(),
                     zIndex = nextPoster.css('zIndex'),
                     opacity = nextPoster.css('opacity'),
                     top = nextPoster.css('top');
                     left = nextPoster.css('left');
                 //存放所有的zindex   
                 zIndexArr.push(zIndex);    
                 curPoster.animate({
                 	 width:width,
                 	 height:height,
                 	 // zIndex:zIndex,
                 	 opacity:opacity,
                 	 top:top,
                 	 left:left
                 },_this_.setting.speed,function(){
                 	_this_.animateStopFlag = true;
                 });
              });
              //重新赋值zindex
              this.posterItem.each(function(i){
              	    $(this).css('zIndex',zIndexArr[i]); 
              });
          }
       },
       
       /******自动播放函数*****/
       autoPlay:function(){
       	  var _this_ = this;
       	  this.timer = window.setInterval(function(){
             _this_.prevBtn.click();
       	  },this.setting.delay);
       }
  };


  /*初始化多个插件*/
  Carousel.init = function(posters){
      var _this_ = this;//this-->Carousel
      posters.each(function(){
      	new _this_($(this));//this-->当前的poster
      });
  }  
  /*将Carousel绑定到window对象上
   注意：window['Carousel'] = Carousel;  一一对应 ['Carousel']--->Carousel
   */
  window['Carousel'] = Carousel;
})(jQuery);