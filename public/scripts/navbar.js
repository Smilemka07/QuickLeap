const btn = document.querySelector('.fa-bell');
const panel = document.querySelector('.notif_panel');

btn.addEventListener('click', (e) => {
  e.stopPropagation(); 
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

//closing panel
document.addEventListener('click', () => {
  panel.style.display = 'none';
});