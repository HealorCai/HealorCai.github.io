// window.HELP_IMPROVE_VIDEOJS = false;

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('show-extra-tasks');
  
  button.addEventListener('click', function() {
    const extraContent = document.getElementById('extra-tasks'); 
    
    // 更精准的选择器
    const buttonIcon = this.querySelector('.icon'); 
    const buttonText = this.querySelector('.button-text strong');
    
    // 调试输出
    console.log('找到的元素:', {
      extraContent,
      buttonIcon,
      buttonText,
      text: buttonText.textContent,
    });
    console.log(buttonIcon.classList.contains('fa-chevron-up')); 
    console.log(buttonIcon.classList.contains('fa-chevron-down')); 
    console.log(buttonIcon.classList.value); // 打印实际类名
    console.log(buttonIcon.classList.contains('fas')); // 检查前缀
    
    // 安全检查和状态判断
    if (!extraContent || !buttonIcon || !buttonText) {
      console.error('找不到必要的元素');
      return;
    }

    const isHidden = window.getComputedStyle(extraContent).display === 'none';
    
    // 切换状态
    if (isHidden) {
      extraContent.style.display = 'flex';
      buttonIcon.classList.remove('fa-chevron-down');
      buttonIcon.classList.add('fa-chevron-up');
      buttonText.textContent = 'Hide Extra Tasks';
    } else {
      extraContent.style.display = 'none';
      buttonIcon.classList.remove('fa-chevron-up');
      buttonIcon.classList.add('fa-chevron-down');
      buttonText.textContent = 'Show Extra Tasks';
    }
  });
});