var swiper;

window.addEventListener('resize', function() {
  if (swiper) {
    swiper.slideTo(swiper.activeIndex, 0, false); // Recharge la diapositive active
  }
});

window.addEventListener('load', function() {
  swiper = new Swiper('.Slider-container', {
    effect: 'cards',
    grabCursor: false,
    centeredSlides: false,
    loop: false,
  });
});

window.like = function() {
  if (swiper) {
    swiper.slideNext(550);
    hideYoutube();
  }
};

function dislike() {
  if (swiper) {
    swiper.slidePrev(550);
    hideYoutube();
  }
}
