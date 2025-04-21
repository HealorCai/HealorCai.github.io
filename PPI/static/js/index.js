$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    // preloadInterpolationImages();

    // $('#interpolation-slider').on('input', function(event) {
    //   setInterpolationImage(this.value);
    // });
    // setInterpolationImage(0);
    // $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('show-extra-tasks');
  
  button.addEventListener('click', function() {
    const extraContent = document.getElementById('extra-tasks'); 
    
    // 修正选择器 - 精确选择 <i> 元素
    const buttonIcon = this.querySelector('.fas');  // 关键修改
    const buttonText = this.querySelector('.button-text strong');
    
    // 调试输出
    console.log('图标元素:', buttonIcon);
    console.log('当前类名:', buttonIcon.classList.value);
    
    // 安全检查和状态判断
    if (!extraContent || !buttonIcon || !buttonText) {
      console.error('找不到必要的元素');
      return;
    }

    const isHidden = window.getComputedStyle(extraContent).display === 'none';
    
    // 切换状态
    if (isHidden) {
      extraContent.style.display = 'flex';
      buttonIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
      buttonText.textContent = 'Hide Extra Tasks';
    } else {
      extraContent.style.display = 'none';
      buttonIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
      buttonText.textContent = 'Show Extra Tasks';
    }
  });
});