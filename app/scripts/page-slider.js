window.App || (
  window.App = {});

var PageSlider = function (el, options) {

  var _this = this;

  this.active = true;

  this.$el = $(el);

  this.options = options;

  // background node for animation
  this.$background = $('.page-slider-background');

  // wrapper of slider
  this.$wrapper = this.$el.parents('.page__column');

  // is Fullsized screen
  this.fullsize = this.$wrapper.hasClass('page__column_type_fullsized');

  this.constant = this.$el.hasClass('page-slider_type_constant');

  this.direction = this.$el.hasClass('page-slider_align_left') ? 'left' : (
    this.$el.hasClass('page-slider_align_right') ? 'right' : null);

  this.swiper = this.$el.swiper({
    mode: 'horizontal',
    loop: false,
    DOMAnimation: false,
    resistance: '100%',
    wrapperClass: 'page-slider__container',
    slideClass: 'page-slider__item',
    pagination: this.$wrapper.find('.page-slider__pagination')[0],
    onSlideChangeStart: this.process.bind(this),
    onSlideChangeEnd: this.constant ? function(){} : function() {
      _this.setBackgroundImage();
    },
    onSlideClick: this.constant ? function () {
    } : this.toggleSlider.bind(this),
    onTouchEnd: function () {
      var lastSlideX = _this.swiper.slidesGrid[_this.swiper.slidesGrid.length - 1];
      if (_this.swiper.positions.current <= -lastSlideX && _this.swiper.touches.diff) {
        // Show Globe
        _this.options.onNext && _this.options.onNext.call(_this);
      } else if (_this.swiper.positions.current >= 0 && _this.swiper.touches.diff) {
        // Show Globe
        _this.options.onPrev && _this.options.onPrev.call(_this);
      }
    }
  });

  this.init();

};

PageSlider.prototype = {

  init: function() {
    var _this = this;

    this.active = true;

    // cache active index
    this.activeIndex = this.swiper.activeIndex;

    // Init Animation Background
    this.initBackground();

    this.process();
  },

  toggleSlider: function () {

    this.$wrapper.off("webkitTransitionEnd");

    if (this.fullsize) {
      this.decrease();
    } else {
      this.increase();
    }
  },

  initBackground: function() {
    var
      slide = this.swiper.getSlide(this.swiper.activeIndex),
      $slide = $(slide),
      $image = $slide.find('.page-slider__image'),
      imagePath = $image.data('image'),
      top = this.$el.css('top'),
      left = this.$el.css('left');

    this.$background
      .removeClass('right')
      .removeClass('left')
      .addClass(this.direction)
      .css({
        top: top,
        left: left,
        width: this.$el.css('width'),
        height: this.$el.css('height')
      });

    this.$background.find('.page-slider-background__container').attr('src', imagePath)
  },

  setBackgroundImage: function() {
    if (!this.active) return;

    var
      slide = this.swiper.getSlide(this.swiper.activeIndex),
      $slide = $(slide),
      $image = $slide.find('.page-slider__image'),
      imagePath = $image.data('image');

    this.$background.find('.page-slider-background__container').attr('src', imagePath);
  },

  increase: function () {

    if (this.fullsize) {
      return;
    }

    var _this = this;

    // First, we need to turn off Globe animation !!!
    _this.toggleGlobe(false);

    //if (this.direction) {
    _this.$background.off('webkitTransitionEnd');
    //Listener to AnimationEnd Event
    _this.$background.on('webkitTransitionEnd', function () {
      var sliderInfo = _this.options.slides[_this.swiper.activeIndex];
      _this.fullsize = true;
      // Set Page_slider to FullScreen mode
      _this.$el.addClass('fullsized');
      // Recalculate swiper dimensions
      _this.swiper.resizeFix(true);
      // Hide Background Node
      // Remove event listener
      _this.$background
        .css({ 'visibility': 'hidden' })
        .off('webkitTransitionEnd');
      // Show Audio Player
      if (sliderInfo.sound) {
        App.showAndPlayAudio(App.getAudioPath(_this.options.id, sliderInfo.sound));
      }
    });

    this.$background
      .show()
      .css({ 'visibility': 'visible'})
      .addClass('fullsized');

  },

  decrease: function () {

    if (!this.fullsize) {
      return;
    }

    var _this = this;

    // We have to stop Audio at first
    App.hideAndStopAudio();
    // Show background
    this.$background.css({ 'visibility': 'visible' });
    // Remove fullsize class
    _this.$el.removeClass('fullsized');

    _this.$background.off('webkitTransitionEnd');
    _this.$background.on('webkitTransitionEnd', function () {
      _this.fullsize = false;
      // Show Swiper
      // Recalculate swiper dimensions
      _this.swiper.resizeFix(true);
      // Hide Background
      _this.$background
        .css({ 'visibility': 'hidden' })
        .off('webkitTransitionEnd');
      // Can Show the Globe
      _this.process();
    });
    // Start Animation
    _this.$background.removeClass('fullsized');
  },

  toggleGlobe: function (show) {
    App[show ? 'showGlobe' : 'hideGlobe']();
  },

  process: function () {

    if (!this.active) return;

    var
      oldSliderInfo = this.options.slides[this.activeIndex],
      sliderInfo = this.options.slides[this.swiper.activeIndex];

    if (sliderInfo.map && !this.fullsize) {
      App.showGlobe();
    } else if (oldSliderInfo.map) {
      App.hideGlobe();
    }

    if (sliderInfo.sound && this.fullsize) {
      App.showAndPlayAudio(App.getAudioPath(this.options.id, sliderInfo.sound));
    } else if (oldSliderInfo.sound) {
      App.hideAndStopAudio();
    }
  },

  reset: function () {

    var _this = this;

    if (this.constant) {
      return;
    }

    this.active = false;

    this.$el.removeClass('fullsized');
    this.$el.off('webkitTransitionEnd');
    this.swiper.resizeFix(true);

    // unset fullsize
    this.$background.removeClass('fullsized');

    // set fullsize to false
    this.fullsize = false;
    // Show Globe
    this.toggleGlobe(false);

    this.swiper.swipeTo(0);
  },

  destroy: function () {
    // Remove additional classes
    this.reset();

    this.swiper.destroy(true);
    this.swiper = null;
    this.$el.off('click');
  }
};

App.PageSlider = PageSlider;
