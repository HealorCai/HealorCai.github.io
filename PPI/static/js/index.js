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